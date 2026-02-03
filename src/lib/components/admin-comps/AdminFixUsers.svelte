<script lang="ts">
    import { onMount } from 'svelte';
    import { functions } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { httpsCallable } from 'firebase/functions';

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    let missingUsers: any[] = [];

    onMount(() => {
        const unsubscribe = onAuthChange((user: any) => {
            currentUser = user;
            authLoading = false;
        });

        return () => unsubscribe();
    });

    async function scanMissingUsers() {
        loading = true;
        message = '';
        missingUsers = [];

        try {
            const scanFunction = httpsCallable(functions, 'scanMissingUserDocuments');
            const result: any = await scanFunction();
            
            missingUsers = result.data.missingUsers || [];
            
            if (missingUsers.length === 0) {
                message = '✅ Alle brukere har Firestore-dokumenter!';
            } else {
                message = `⚠️ Fant ${missingUsers.length} bruker(e) uten Firestore-dokument.`;
            }
        } catch (error: any) {
            console.error("Error scanning users:", error);
            message = `❌ Feil ved skanning: ${error.message}`;
        } finally {
            loading = false;
            setTimeout(() => message = '', 8000);
        }
    }

    async function fixMissingUsers() {
        loading = true;
        message = '';

        try {
            const fixFunction = httpsCallable(functions, 'fixMissingUserDocuments');
            const result: any = await fixFunction();
            
            message = `✅ Opprettet ${result.data.created} Firestore-dokument(er)!`;
            missingUsers = [];
            
        } catch (error: any) {
            console.error("Error fixing users:", error);
            message = `❌ Feil ved reparasjon: ${error.message}`;
        } finally {
            loading = false;
            setTimeout(() => message = '', 8000);
        }
    }
</script>

<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-purple-200">
    <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-purple-600 mb-2">🔧 Admin: Fiks manglende brukerdokumenter</h2>
        <p class="font-kalmansk text-gray-600 text-base">Opprett Firestore-dokumenter for brukere som mangler dem.</p>
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
            <!-- Scan Button -->
            <div>
                <button 
                    on:click={scanMissingUsers}
                    disabled={loading}
                    class="px-6 py-3 bg-purple-600 text-white font-kalmansk rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-base"
                >
                    {loading ? 'Skanner...' : '🔍 Skann for manglende dokumenter'}
                </button>
            </div>

            <!-- Missing Users List -->
            {#if missingUsers.length > 0}
                <div class="border border-purple-300 rounded-lg p-4 bg-purple-50">
                    <h3 class="font-saotorpes text-lg text-purple-800 mb-3">Brukere uten Firestore-dokument:</h3>
                    <ul class="space-y-2 font-kalmansk text-base">
                        {#each missingUsers as user}
                            <li class="bg-white p-3 rounded border">
                                <div><strong>Email:</strong> {user.email || 'Ingen email'}</div>
                                <div class="text-sm text-gray-600"><strong>UID:</strong> {user.uid}</div>
                            </li>
                        {/each}
                    </ul>
                    
                    <!-- Fix Button -->
                    <button 
                        on:click={fixMissingUsers}
                        disabled={loading}
                        class="mt-4 px-6 py-3 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-base"
                    >
                        {loading ? 'Fikser...' : '✨ Opprett manglende dokumenter'}
                    </button>
                </div>
            {/if}
        </div>

        <!-- Status Message -->
        {#if message}
            <div class="mt-6 p-4 rounded-lg {message.includes('❌') ? 'bg-red-100 text-red-700' : message.includes('⚠️') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}

        <!-- Loading Indicator -->
        {#if loading}
            <div class="mt-6 text-center">
                <div class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-800 mr-2"></div>
                    <span class="font-kalmansk text-base">Loading...</span>
                </div>
            </div>
        {/if}

        <!-- Info Note -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="font-kalmansk text-sm text-blue-800">
                <strong>Info:</strong> Dette verktøyet oppretter Firestore-dokumenter for brukere som eksisterer i Firebase Authentication men mangler dokument i Firestore. Standard verdier: totalCrosses=0, drinkCount=0, isAdmin=false.
            </p>
        </div>
    {/if}
</div>
