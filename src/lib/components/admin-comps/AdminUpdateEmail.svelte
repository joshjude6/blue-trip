<script lang="ts">
    import { onMount } from 'svelte';
    import { db, functions } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDocs } from "firebase/firestore";
    import { httpsCallable } from 'firebase/functions';

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    
    let users: Array<{
        id: string;
        name: string;
        email: string;
    }> = [];
    
    let selectedUserId = '';
    let newEmail = '';

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
            
            querySnapshot.forEach((docSnap) => {
                const userData = docSnap.data();
                users.push({
                    id: docSnap.id,
                    name: `${userData.fornavn || ''} ${userData.etternavn || ''}`.trim() || 'Unknown',
                    email: userData.email || 'No email'
                });
            });
            
            users.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("Error fetching users:", error);
            message = '❌ Feil ved lasting av brukere';
        }
    }

    async function updateUserEmail() {
        if (!selectedUserId) {
            message = '❌ Velg en bruker';
            return;
        }

        if (!newEmail || !newEmail.includes('@')) {
            message = '❌ Skriv inn en gyldig e-postadresse';
            return;
        }

        loading = true;
        message = '';

        try {
            // Call the Cloud Function to update email in both Auth and Firestore
            const updateEmailFunction = httpsCallable(functions, 'updateUserEmail');
            
            const result = await updateEmailFunction({
                userId: selectedUserId,
                newEmail: newEmail
            });

            const selectedUser = users.find(u => u.id === selectedUserId);
            message = `✅ E-post oppdatert for ${selectedUser?.name}! Både Firebase Authentication og Firestore er oppdatert.`;
            
            // Refresh user list
            await fetchUsers();
            newEmail = '';
            selectedUserId = '';

        } catch (error: any) {
            console.error("Error updating email:", error);
            message = `❌ Feil ved oppdatering av e-post: ${error.message}`;
        } finally {
            loading = false;
            setTimeout(() => message = '', 8000);
        }
    }

    function selectUser() {
        const user = users.find(u => u.id === selectedUserId);
        if (user) {
            newEmail = user.email;
        }
    }
</script>

<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200">
    <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-blue-600 mb-2">✉️ Admin: Endre bruker e-post</h2>
        <p class="font-kalmansk text-gray-600 text-base">Oppdater e-postadresse for en bruker i Firestore.</p>
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
        <div class="space-y-4">
            <!-- User Selection -->
            <div>
                <label class="block font-kalmansk text-black text-base mb-2">Velg bruker:</label>
                <select 
                    bind:value={selectedUserId}
                    on:change={selectUser}
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 font-kalmansk text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    <option value="">-- Velg en bruker --</option>
                    {#each users as user}
                        <option value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    {/each}
                </select>
            </div>

            <!-- New Email Input -->
            {#if selectedUserId}
                <div>
                    <label class="block font-kalmansk text-black text-base mb-2">Ny e-postadresse:</label>
                    <input 
                        type="email"
                        bind:value={newEmail}
                        placeholder="ny-epost@example.com"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 font-kalmansk text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                </div>

                <!-- Update Button -->
                <div class="flex gap-3">
                    <button 
                        on:click={updateUserEmail}
                        disabled={loading || !newEmail}
                        class="px-6 py-3 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-base"
                    >
                        {loading ? 'Oppdaterer...' : 'Oppdater e-post'}
                    </button>
                    
                    <button 
                        on:click={() => { selectedUserId = ''; newEmail = ''; }}
                        disabled={loading}
                        class="px-6 py-3 bg-gray-600 text-white font-kalmansk rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors text-base"
                    >
                        Avbryt
                    </button>
                </div>
            {/if}

            <!-- Refresh Button -->
            <div class="pt-4 border-t">
                <button 
                    on:click={fetchUsers}
                    disabled={loading}
                    class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 disabled:bg-gray-400 text-base"
                >
                    🔄 Oppdater brukerliste
                </button>
            </div>
        </div>

        <!-- Status Message -->
        {#if message}
            <div class="mt-6 p-4 rounded-lg {message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}

        <!-- Loading Indicator -->
        {#if loading}
            <div class="mt-6 text-center">
                <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                    <span class="font-kalmansk text-base">Loading...</span>
                </div>
            </div>
        {/if}

        <!-- Info Note -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="font-kalmansk text-sm text-blue-800">
                <strong>Info:</strong> Dette oppdaterer e-posten i både Firebase Authentication og Firestore-databasen. Brukeren vil kunne logge inn med den nye e-posten umiddelbart.
            </p>
        </div>
    {/if}
</div>
