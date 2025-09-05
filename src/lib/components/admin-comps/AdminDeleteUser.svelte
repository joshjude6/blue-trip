<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDocs, doc, deleteDoc, query, where, writeBatch } from "firebase/firestore";

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    let users: Array<{
        id: string;
        name: string;
        etternavn: string;
        email: string;
        totalCrosses: number;
        isAdmin: boolean;
    }> = [];

    // Confirmation states
    let confirmDeleteUserId = '';
    let confirmDeleteAll = false;

    onMount(() => {
        const unsubscribe = onAuthChange((user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                fetchUsers();
            }
        });

        return () => unsubscribe();
    });

    async function fetchUsers() {
        try {
            loading = true;
            const querySnapshot = await getDocs(collection(db, 'users'));
            users = [];
            
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                users.push({
                    id: doc.id,
                    name: userData.fornavn || 'Unknown',
                    etternavn: userData.etternavn || '',
                    email: userData.email || 'No email',
                    totalCrosses: userData.totalCrosses || 0,
                    isAdmin: userData.isAdmin || false
                });
            });
            
            users.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("Error fetching users:", error);
            message = '❌ Kunne ikke laste brukere.';
        } finally {
            loading = false;
        }
    }

    async function deleteUser(userId: string, userName: string) {
        if (confirmDeleteUserId !== userId) {
            confirmDeleteUserId = userId;
            message = `Klikk igjen for å bekrefte sletting av ${userName}...`;
            setTimeout(() => {
                confirmDeleteUserId = '';
                message = '';
            }, 5000);
            return;
        }

        // Safety check - don't delete current user
        if (userId === currentUser?.uid) {
            message = '❌ Du kan ikke slette deg selv!';
            setTimeout(() => message = '', 3000);
            return;
        }

        loading = true;
        message = '';

        try {
            // Delete user's kryss log entries (both given and received)
            const kryssLogSnapshot = await getDocs(collection(db, 'kryssLog'));
            const batch = writeBatch(db);
            
            let deletedLogs = 0;
            kryssLogSnapshot.forEach((logDoc) => {
                const logData = logDoc.data();
                if (logData.giverId === userId || logData.receiverId === userId) {
                    batch.delete(doc(db, 'kryssLog', logDoc.id));
                    deletedLogs++;
                }
            });

            // Delete the user document
            batch.delete(doc(db, 'users', userId));

            await batch.commit();

            message = `✅ Bruker ${userName} slettet! (${deletedLogs} tilhørende kryss-oppføringer også slettet)`;
            confirmDeleteUserId = '';
            
            // Refresh user list
            fetchUsers();

        } catch (error) {
            console.error("Error deleting user:", error);
            message = `❌ Feil ved sletting av ${userName}.`;
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    async function deleteAllUsers() {
        if (!confirmDeleteAll) {
            confirmDeleteAll = true;
            message = '⚠️ ADVARSEL: Dette sletter ALLE brukere og all data! Klikk igjen for å bekrefte...';
            setTimeout(() => {
                confirmDeleteAll = false;
                message = '';
            }, 10000);
            return;
        }

        loading = true;
        message = '';

        try {
            const [usersSnapshot, kryssLogSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'kryssLog'))
            ]);

            const batch = writeBatch(db);

            // Don't delete current user to avoid locking out admin
            let deletedUsers = 0;
            usersSnapshot.forEach((userDoc) => {
                if (userDoc.id !== currentUser?.uid) {
                    batch.delete(doc(db, 'users', userDoc.id));
                    deletedUsers++;
                }
            });

            // Delete all kryss logs
            kryssLogSnapshot.forEach((logDoc) => {
                batch.delete(doc(db, 'kryssLog', logDoc.id));
            });

            await batch.commit();

            message = `✅ FULLSTENDIG RYDDING: ${deletedUsers} brukere og ${kryssLogSnapshot.size} kryss-oppføringer slettet! (Din egen bruker ble beholdt)`;
            confirmDeleteAll = false;
            
            // Refresh user list
            fetchUsers();

        } catch (error) {
            console.error("Error deleting all users:", error);
            message = '❌ Feil ved sletting av alle brukere.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 10000);
        }
    }

    function cancelConfirmations() {
        confirmDeleteUserId = '';
        confirmDeleteAll = false;
        message = 'Alle bekreftelser avbrutt.';
        setTimeout(() => message = '', 3000);
    }
</script>

<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-red-200">
    <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-red-600 mb-2">🗑️ Admin: Slett Brukere</h2>
        <p class="font-kalmansk text-gray-600 text-base">Permanent sletting av brukere og deres data. Dette kan ikke angres!</p>
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
        <!-- User Count -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg text-center">
            <div class="text-2xl font-saotorpes text-blue-600">{users.length}</div>
            <div class="text-base font-kalmansk text-black">Registrerte brukere</div>
            <button 
                on:click={fetchUsers}
                disabled={loading}
                class="mt-2 px-3 py-1 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 text-sm"
            >
                🔄 Oppdater liste
            </button>
        </div>

        <!-- Individual User Delete -->
        <div class="mb-8">
            <h3 class="text-lg font-saotorpes text-black mb-4">Slett enkeltbrukere</h3>
            
            {#if users.length === 0}
                <div class="text-center py-8 text-gray-500 font-kalmansk">
                    Ingen brukere funnet.
                </div>
            {:else}
                <div class="grid gap-3">
                    {#each users as user}
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 {user.id === currentUser?.uid ? 'border-green-500 bg-green-50' : confirmDeleteUserId === user.id ? 'border-red-500 bg-red-50' : 'border-gray-300'}">
                            <div class="flex items-center space-x-4">
                                <div>
                                    <h4 class="font-kalmansk font-semibold text-black text-base">
                                        {user.name} {user.etternavn}
                                        {#if user.isAdmin}
                                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">ADMIN</span>
                                        {/if}
                                        {#if user.id === currentUser?.uid}
                                            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">DEG</span>
                                        {/if}
                                    </h4>
                                    <p class="text-sm font-kalmansk text-gray-600">{user.email}</p>
                                    <p class="text-sm font-kalmansk text-gray-500">{user.totalCrosses} kryss</p>
                                </div>
                            </div>
                            <div>
                                {#if user.id === currentUser?.uid}
                                    <span class="px-4 py-2 bg-gray-300 text-gray-500 font-kalmansk rounded text-base cursor-not-allowed">
                                        Kan ikke slette deg selv
                                    </span>
                                {:else}
                                    <button 
                                        on:click={() => deleteUser(user.id, user.name)}
                                        disabled={loading}
                                        class="px-4 py-2 bg-red-600 text-white font-kalmansk rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors text-base {confirmDeleteUserId === user.id ? 'ring-4 ring-red-300 animate-pulse' : ''}"
                                    >
                                        {confirmDeleteUserId === user.id ? '⚠️ Klikk igjen for å slette' : '🗑️ Slett'}
                                    </button>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Delete All Users -->
        <div class="border border-red-400 rounded-lg p-6 bg-red-50">
            <h3 class="font-saotorpes text-lg text-red-800 mb-2">🚨 SLETT ALLE BRUKERE</h3>
            <p class="font-kalmansk text-base text-red-700 mb-4">
                Sletter ALLE brukere og ALL kryssdata permanent! Din egen bruker blir beholdt for å unngå utkasting.
            </p>
            <button 
                on:click={deleteAllUsers}
                disabled={loading || users.length <= 1}
                class="px-6 py-3 bg-red-600 text-white font-kalmansk rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-base {confirmDeleteAll ? 'ring-4 ring-red-300 bg-red-700 animate-pulse' : ''}"
            >
                {confirmDeleteAll ? '🚨 KLIKK IGJEN FOR Å SLETTE ALT' : 'SLETT ALLE BRUKERE'}
            </button>
            {#if users.length <= 1}
                <p class="text-sm font-kalmansk text-gray-500 mt-2">Kun du er registrert - ingen andre å slette.</p>
            {/if}
        </div>

        <!-- Cancel Confirmations -->
        {#if confirmDeleteUserId || confirmDeleteAll}
            <div class="mt-6 text-center">
                <button 
                    on:click={cancelConfirmations}
                    class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 text-base"
                >
                    Avbryt alle bekreftelser
                </button>
            </div>
        {/if}

        <!-- Status Message -->
        {#if message}
            <div class="mt-6 p-4 rounded-lg {message.includes('❌') ? 'bg-red-100 text-red-700' : message.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}

        <!-- Loading Indicator -->
        {#if loading}
            <div class="mt-6 text-center">
                <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                    <span class="font-kalmansk text-base">Sletter...</span>
                </div>
            </div>
        {/if}
    {/if}
</div>