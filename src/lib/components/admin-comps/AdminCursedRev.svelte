<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDocs, doc, deleteDoc, writeBatch, query, where, orderBy, increment } from "firebase/firestore";

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    let cursedEntries: Array<{
        id: string;
        giverName: string;
        receiverName: string;
        receiverId: string;
        reason: string;
        timestamp: any;
        formattedTime: string;
        reversing?: boolean;
    }> = [];
    let cursedCount = 0;
    let reversalHistory: Array<{
        originalEntry: any;
        reversedAt: string;
        affectedUsers: number;
    }> = [];

    onMount(() => {
        const unsubscribe = onAuthChange((user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                fetchCursedEntries();
            }
        });

        return () => unsubscribe();
    });

    async function fetchCursedEntries() {
        try {
            loading = true;
            
            // Get all cursed entries
            const q = query(
                collection(db, 'kryssLog'), 
                where('cursed', '==', true),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            
            cursedEntries = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                let formattedTime = 'Ukjent tid';
                if (data.timestamp && data.timestamp.toDate) {
                    const date = data.timestamp.toDate();
                    formattedTime = new Intl.DateTimeFormat('no-NO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(date);
                }
                
                cursedEntries.push({
                    id: doc.id,
                    giverName: data.giverName || 'Ukjent',
                    receiverName: data.receiverName || 'Ukjent',
                    receiverId: data.receiverId,
                    reason: data.reason || 'Ingen grunn oppgitt',
                    timestamp: data.timestamp,
                    formattedTime,
                    reversing: false
                });
            });
            
            cursedCount = cursedEntries.length;
            
        } catch (error) {
            console.error("Error fetching cursed entries:", error);
            message = '❌ Feil ved henting av cursed oppføringer.';
        } finally {
            loading = false;
        }
    }

    async function reverseCursedEntry(entryId: string, receiverId: string) {
        const entry = cursedEntries.find(e => e.id === entryId);
        if (!entry) return;

        entry.reversing = true;
        cursedEntries = [...cursedEntries]; // Trigger reactivity

        try {
            // Get all users to reverse the effect
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);

            let affectedUsers = 0;

            // Remove 1 kryss from everyone except the originally cursed person and the giver
            usersSnapshot.forEach((userDoc) => {
                const userId = userDoc.id;
                // Don't affect the cursed person or the person who gave the curse
                if (userId !== receiverId && userId !== currentUser?.uid) {
                    batch.update(doc(db, 'users', userId), {
                        totalCrosses: increment(-1)
                    });
                    affectedUsers++;
                }
            });

            // Delete the cursed log entry
            batch.delete(doc(db, 'kryssLog', entryId));

            await batch.commit();

            // Add to reversal history
            reversalHistory.unshift({
                originalEntry: { ...entry },
                reversedAt: new Date().toLocaleString('no-NO'),
                affectedUsers
            });

            // Remove from cursed entries
            cursedEntries = cursedEntries.filter(e => e.id !== entryId);
            cursedCount = cursedEntries.length;

            message = `✅ Reversert cursed oppføring! ${affectedUsers} brukere mistet 1 kryss.`;

        } catch (error) {
            console.error("Error reversing cursed entry:", error);
            message = '❌ Feil ved reversering av cursed oppføring.';
            entry.reversing = false;
            cursedEntries = [...cursedEntries];
        } finally {
            setTimeout(() => message = '', 5000);
        }
    }

    async function reverseAllCursed() {
        if (cursedEntries.length === 0) {
            message = 'Ingen cursed oppføringer å reversere.';
            setTimeout(() => message = '', 3000);
            return;
        }

        loading = true;
        message = '';

        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);

            // Calculate total reversals needed per user
            const userReversals = new Map();
            
            // For each cursed entry, everyone except the cursed person should lose 1 kryss
            cursedEntries.forEach(entry => {
                usersSnapshot.forEach((userDoc) => {
                    const userId = userDoc.id;
                    if (userId !== entry.receiverId) {
                        const current = userReversals.get(userId) || 0;
                        userReversals.set(userId, current - 1);
                    }
                });
            });

            // Apply all reversals
            userReversals.forEach((adjustment, userId) => {
                batch.update(doc(db, 'users', userId), {
                    totalCrosses: increment(adjustment)
                });
            });

            // Delete all cursed log entries
            cursedEntries.forEach(entry => {
                batch.delete(doc(db, 'kryssLog', entry.id));
            });

            await batch.commit();

            const totalReversed = cursedEntries.length;
            const totalUsers = userReversals.size;

            // Clear cursed entries
            cursedEntries = [];
            cursedCount = 0;

            message = `✅ Reversert alle ${totalReversed} cursed oppføringer! ${totalUsers} brukere påvirket.`;

        } catch (error) {
            console.error("Error reversing all cursed entries:", error);
            message = '❌ Feil ved reversering av alle cursed oppføringer.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 8000);
        }
    }
</script>

<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-purple-200">
    <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-purple-600 mb-2">🌀 Admin: Fjern cursed kryss</h2>
        <p class="font-kalmansk text-gray-600 text-base">Reverser effekten av cursed minus-kryss.</p>
    </div>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Loading...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base">Du må være logget inn som admin.</p>
        </div>
    {:else}
        <!-- Current Status -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-purple-50 rounded-lg">
            <div class="text-center">
                <div class="text-2xl font-saotorpes text-purple-600">{cursedCount}</div>
                <div class="text-base font-kalmansk text-black">Aktive cursed minus-kryss</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-saotorpes text-purple-600">{reversalHistory.length}</div>
                <div class="text-base font-kalmansk text-black">Reverserte denne økten</div>
            </div>
            <div class="text-center">
                <button 
                    on:click={fetchCursedEntries}
                    disabled={loading}
                    class="px-4 py-2 bg-purple-600 text-white font-kalmansk rounded hover:bg-purple-700 disabled:bg-gray-400 text-base"
                >
                    🔄 Oppdater
                </button>
            </div>
        </div>

        <!-- Bulk Actions -->
        {#if cursedCount > 0}
            <div class="border border-purple-300 rounded-lg p-4 bg-purple-50 mb-6">
                <h3 class="font-saotorpes text-lg text-purple-800 mb-2">Bulk-handlinger</h3>
                <button 
                    on:click={reverseAllCursed}
                    disabled={loading}
                    class="px-6 py-3 bg-purple-600 text-white font-kalmansk rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-base"
                >
                    🌀 Reverser alle cursed kryss ({cursedCount})
                </button>
            </div>
        {/if}

        <!-- Cursed Entries List -->
        {#if loading}
            <div class="text-center py-8">
                <div class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-800 mr-2"></div>
                    <span class="font-kalmansk text-base">Loading cursed entries...</span>
                </div>
            </div>
        {:else if cursedEntries.length === 0}
            <div class="text-center py-8 bg-gray-50 rounded-lg">
                <div class="text-6xl mb-4">😈</div>
                <p class="font-kalmansk text-lg text-gray-600">Ingen aktive cursed oppføringer!</p>
                <p class="font-kalmansk text-base text-gray-500 mt-2">Alle cursed kryss har blitt reversert eller det er ingen cursed kryss ennå.</p>
            </div>
        {:else}
            <!-- Desktop: Table Layout -->
            <div class="hidden sm:block overflow-x-auto bg-white rounded-lg border border-purple-200">
                <table class="w-full">
                    <thead class="bg-purple-100">
                        <tr>
                            <th class="text-left py-3 px-4 font-saotorpes text-purple-800 text-base">Giver</th>
                            <th class="text-left py-3 px-4 font-saotorpes text-purple-800 text-base">Mottaker</th>
                            <th class="text-left py-3 px-4 font-saotorpes text-purple-800 text-base">Grunn</th>
                            <th class="text-center py-3 px-4 font-saotorpes text-purple-800 text-base">Når</th>
                            <th class="text-center py-3 px-4 font-saotorpes text-purple-800 text-base">Handling</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each cursedEntries as entry}
                            <tr class="border-b border-purple-100 hover:bg-purple-25 transition-colors">
                                <td class="py-4 px-4 font-kalmansk text-black text-base">
                                    {entry.giverName}
                                </td>
                                <td class="py-4 px-4 font-kalmansk font-semibold text-purple-700 text-base">
                                    {entry.receiverName}
                                </td>
                                <td class="py-4 px-4 font-kalmansk text-black text-base max-w-xs">
                                    <span class="truncate block" title={entry.reason}>
                                        {entry.reason.replace('Cursed: ', '')}
                                    </span>
                                </td>
                                <td class="py-4 px-4 text-center font-kalmansk text-gray-500 text-sm">
                                    {entry.formattedTime}
                                </td>
                                <td class="py-4 px-4 text-center">
                                    <button 
                                        on:click={() => reverseCursedEntry(entry.id, entry.receiverId)}
                                        disabled={entry.reversing}
                                        class="px-4 py-2 bg-purple-600 text-white font-kalmansk rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm transition-colors"
                                    >
                                        {entry.reversing ? '🔄 Reverserer...' : '↩️ Reverser'}
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Mobile: Card Layout -->
            <div class="block sm:hidden space-y-4">
                {#each cursedEntries as entry}
                    <div class="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-1">
                                    <span class="font-kalmansk font-semibold text-black text-base">
                                        {entry.giverName}
                                    </span>
                                    <span class="text-purple-500 text-base">→</span>
                                    <span class="font-kalmansk font-semibold text-purple-700 text-base">
                                        {entry.receiverName}
                                    </span>
                                </div>
                                <p class="font-kalmansk text-black text-base mb-2">
                                    "{entry.reason.replace('CURSED MINUS-KRYSS: ', '')}"
                                </p>
                                <p class="text-sm text-gray-500 font-kalmansk">
                                    {entry.formattedTime}
                                </p>
                            </div>
                        </div>
                        <button 
                            on:click={() => reverseCursedEntry(entry.id, entry.receiverId)}
                            disabled={entry.reversing}
                            class="w-full px-4 py-2 bg-purple-600 text-white font-kalmansk rounded hover:bg-purple-700 disabled:bg-gray-400 text-base transition-colors"
                        >
                            {entry.reversing ? '🔄 Reverserer...' : '↩️ Reverser Curse'}
                        </button>
                    </div>
                {/each}
            </div>
        {/if}

        <!-- Reversal History -->
        {#if reversalHistory.length > 0}
            <div class="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 class="font-saotorpes text-lg text-green-800 mb-4">✅ Reverserte denne økten</h3>
                <div class="space-y-2">
                    {#each reversalHistory as reversal}
                        <div class="text-sm font-kalmansk text-green-700">
                            • Reversert curse fra <strong>{reversal.originalEntry.giverName}</strong> 
                            mot <strong>{reversal.originalEntry.receiverName}</strong> 
                            kl. {reversal.reversedAt} 
                            ({reversal.affectedUsers} brukere påvirket)
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Status Message -->
        {#if message}
            <div class="mt-6 p-4 rounded-lg {message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}
    {/if}
</div>