<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { doc, getDoc } from "firebase/firestore";

    let currentUser: any = null;
    let userData: any = null;
    let loading = true;
    let authLoading = true;

    onMount(() => {
        const unsubscribe = onAuthChange(async (user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                await fetchUserData();
            } else {
                loading = false;
            }
        });

        return () => unsubscribe();
    });

    async function fetchUserData() {
        if (!currentUser?.uid) return;
        
        try {
            loading = true;
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                userData = userDoc.data();
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            loading = false;
        }
    }

    // Export refresh function so parent can call it
    export function refresh() {
        fetchUserData();
    }
</script>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">❌ Dine kryss</h2>

    {#if authLoading || loading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Laster...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base">Du må være logget inn for å se dine kryss.</p>
        </div>
    {:else}
        <div class="bg-blue-50 rounded-lg p-6 text-center">
            <div class="text-4xl sm:text-5xl font-saotorpes text-blue-600 mb-2">
                {userData?.totalCrosses || 0}
            </div>
            <div class="text-base sm:text-lg font-kalmansk text-black mb-2">
                {(userData?.totalCrosses || 0) === 1 ? 'kryss totalt' : 'kryss totalt'}
            </div>
            <div class="text-sm font-kalmansk text-gray-600">
                Hei {userData?.fornavn || 'Bruker'}! 
                {#if (userData?.totalCrosses || 0) === 0}
                    Du har ikke fått noen kryss ennå. 
                {:else if (userData?.totalCrosses || 0) < 5}
                    Svakt (eller sterkt?) av deg!
                {:else if (userData?.totalCrosses || 0) < 10}
                    Can't take you anywhere fyfaennnnnn
                {:else}
                    Du er cancelled når vi kommer hjem 😜
                {/if}
            </div>
        </div>
        
        <div class="mt-4 text-center">
            <button 
                on:click={fetchUserData}
                disabled={loading}
                class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 text-base"
            >
                {loading ? 'Oppdaterer...' : 'Oppdater'} 🔄
            </button>
        </div>
    {/if}
</div>