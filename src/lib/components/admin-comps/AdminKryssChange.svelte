<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDocs, doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    let selectedUser = '';
    let adjustmentAmount = 0;
    let users: Array<{
        id: string;
        name: string;
        totalCrosses: number;
    }> = [];

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
            const querySnapshot = await getDocs(collection(db, 'users'));
            users = [];
            
            querySnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                users.push({
                    id: userDoc.id,
                    name: userData.fornavn || 'Unknown',
                    totalCrosses: userData.totalCrosses || 0
                });
            });
            
            users.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("Error fetching users:", error);
            message = 'Feil ved henting av brukere.';
        }
    }

    async function adjustKryss() {
        if (!selectedUser) {
            message = 'Velg en bruker først.';
            return;
        }

        if (adjustmentAmount === 0) {
            message = 'Velg en mengde å justere.';
            return;
        }

        loading = true;
        message = '';

        try {
            const userRef = doc(db, 'users', selectedUser);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
                message = 'Bruker ikke funnet.';
                return;
            }

            const userData = userDoc.data();
            const currentKryss = userData.totalCrosses || 0;
            const newTotal = currentKryss + adjustmentAmount;

            // Prevent going below 0
            if (newTotal < 0) {
                message = `Kan ikke justere: ${userData.fornavn} har ${currentKryss} kryss, kan ikke gå under 0.`;
                return;
            }

            await updateDoc(userRef, {
                totalCrosses: increment(adjustmentAmount)
            });

            const userName = users.find(u => u.id === selectedUser)?.name;
            const action = adjustmentAmount > 0 ? 'La til' : 'Fjernet';
            message = `${action} ${Math.abs(adjustmentAmount)} kryss ${adjustmentAmount > 0 ? 'til' : 'fra'} ${userName}. Ny total: ${newTotal}`;

            // Refresh user list to show updated counts
            await fetchUsers();

            // Reset selection
            adjustmentAmount = 0;

        } catch (error) {
            console.error("Error adjusting kryss:", error);
            message = 'Feil ved justering av kryss.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    function setAmount(amount: number) {
        adjustmentAmount = amount;
    }

    function getCurrentUserKryss(): number {
        if (!selectedUser) return 0;
        return users.find(u => u.id === selectedUser)?.totalCrosses || 0;
    }
</script>

<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200">
    <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-blue-600 mb-2">👑 Admin: Juster Kryss</h2>
        <p class="font-kalmansk text-gray-600 text-base">Direkte justering av brukeres kryss-tellere.</p>
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
        <div class="space-y-6">
            <!-- User Selection -->
            <div>
                <label for="userSelect" class="block text-base font-kalmansk font-semibold text-black mb-2">
                    Velg bruker
                </label>
                <select 
                    id="userSelect"
                    bind:value={selectedUser}
                    class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                    <option value="">Velg en bruker...</option>
                    {#each users as user}
                        <option value={user.id}>{user.name} (har {user.totalCrosses} kryss)</option>
                    {/each}
                </select>
            </div>

            {#if selectedUser}
                <div class="p-4 bg-blue-50 rounded-lg">
                    <h3 class="font-saotorpes text-lg text-blue-800 mb-2">
                        {users.find(u => u.id === selectedUser)?.name} har {getCurrentUserKryss()} kryss
                    </h3>
                    
                    <!-- Amount Selection -->
                    <div class="space-y-4">
                        <div>
                            <p class="font-kalmansk text-base text-gray-700 mb-3">Velg justering:</p>
                            
                            <!-- Positive Presets -->
                            <div class="mb-3">
                                <p class="text-sm font-kalmansk text-green-700 mb-2">Legg til kryss:</p>
                                <div class="flex gap-2 flex-wrap">
                                    {#each [1, 2, 3, 5, 10] as amount}
                                        <button 
                                            on:click={() => setAmount(amount)}
                                            class="px-4 py-2 rounded font-kalmansk transition-colors text-base
                                                {adjustmentAmount === amount ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}"
                                        >
                                            +{amount}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            <!-- Negative Presets -->
                            <div class="mb-3">
                                <p class="text-sm font-kalmansk text-red-700 mb-2">Fjern kryss:</p>
                                <div class="flex gap-2 flex-wrap">
                                    {#each [1, 2, 3, 5, 10] as amount}
                                        <button 
                                            on:click={() => setAmount(-amount)}
                                            class="px-4 py-2 rounded font-kalmansk transition-colors text-base
                                                {adjustmentAmount === -amount ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}"
                                        >
                                            -{amount}
                                        </button>
                                    {/each}
                                </div>
                            </div>

                            <!-- Custom Amount -->
                            <div>
                                <label for="customAmount" class="block text-sm font-kalmansk text-gray-700 mb-1">
                                    Eller skriv inn egen mengde:
                                </label>
                                <input 
                                    id="customAmount"
                                    type="number"
                                    bind:value={adjustmentAmount}
                                    class="w-32 p-2 border border-gray-300 rounded font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <!-- Preview -->
                        {#if adjustmentAmount !== 0}
                            <div class="p-3 bg-gray-100 rounded">
                                <p class="font-kalmansk text-sm">
                                    <strong>Forhåndsvisning:</strong> 
                                    {getCurrentUserKryss()} 
                                    {adjustmentAmount > 0 ? '+ ' : ''}{adjustmentAmount} = 
                                    <span class="{getCurrentUserKryss() + adjustmentAmount < 0 ? 'text-red-600' : 'text-green-600'}">
                                        {getCurrentUserKryss() + adjustmentAmount}
                                    </span>
                                    {#if getCurrentUserKryss() + adjustmentAmount < 0}
                                        <span class="text-red-600">(Ikke tillatt - kan ikke gå under 0)</span>
                                    {/if}
                                </p>
                            </div>
                        {/if}

                        <!-- Submit Button -->
                        <button 
                            on:click={adjustKryss}
                            disabled={loading || adjustmentAmount === 0 || (getCurrentUserKryss() + adjustmentAmount < 0)}
                            class="px-6 py-3 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base"
                        >
                            {loading ? 'Justerer...' : `Juster med ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount} kryss`}
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Status Message -->
            {#if message}
                <div class="p-4 rounded-lg {message.includes('Feil') || message.includes('Kan ikke') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                    {message}
                </div>
            {/if}

            <!-- Refresh Button -->
            <div class="text-center pt-4">
                <button 
                    on:click={fetchUsers}
                    disabled={loading}
                    class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 disabled:bg-gray-400 text-base"
                >
                    Oppdater brukerliste
                </button>
            </div>
        </div>
    {/if}
</div>