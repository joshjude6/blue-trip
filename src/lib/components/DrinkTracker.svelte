<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { doc, updateDoc, getDoc, increment } from "firebase/firestore";

    let currentUser: any = null;
    let userData: any = null;
    let loading = false;
    let message = '';
    let authLoading = true;
    let addAmount = 1;

    onMount(() => {
        const unsubscribe = onAuthChange(async (user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                await fetchUserData();
            }
        });

        return () => unsubscribe();
    });

    async function fetchUserData() {
        if (!currentUser?.uid) return;
        
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                userData = userDoc.data();
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    async function addDrink(amount: number) {
        if (!currentUser?.uid) {
            message = 'Du må være logget inn for å registrere drikke!';
            return;
        }

        loading = true;
        message = '';

        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                drinkCount: increment(amount)
            });

            // Update local data
            userData.drinkCount = (userData.drinkCount || 0) + amount;
            message = `+${amount} drikke registrert! 🍺`;

        } catch (error) {
            console.error("Error adding drink:", error);
            message = 'Feil ved registrering av drikke. Prøv igjen.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 3000);
        }
    }

    async function subtractDrink() {
        if (!currentUser?.uid || (userData?.drinkCount || 0) === 0) {
            message = 'Ingen drikke å fjerne!';
            setTimeout(() => message = '', 3000);
            return;
        }

        loading = true;
        message = '';

        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                drinkCount: increment(-1)
            });

            // Update local data
            userData.drinkCount = Math.max((userData.drinkCount || 0) - 1, 0);
            message = 'Fjernet 1 drikke! ↩️';

        } catch (error) {
            console.error("Error subtracting drink:", error);
            message = 'Feil ved fjerning av drikke.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 3000);
        }
    }

    // Export refresh function so parent can call it
    export function refresh() {
        fetchUserData();
    }
</script>

<div class="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">🍺 Drikketeller</h2>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Laster...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base">Du må være logget inn for å registrere drikke.</p>
        </div>
    {:else}
        <!-- Current Count Display -->
        <div class="bg-blue-50 rounded-lg p-6 text-center mb-6">
            <div class="text-4xl sm:text-5xl font-saotorpes text-blue-600 mb-2">
                {userData?.drinkCount || 0}
            </div>
            <div class="text-base sm:text-lg font-kalmansk text-black mb-2">
                {(userData?.drinkCount || 0) === 1 ? 'drikke registrert' : 'drikker registrert'}
            </div>
            <div class="text-sm font-kalmansk text-gray-600">
                {#if (userData?.drinkCount || 0) === 0}
                    Ingen drikker registrert ennå. Start tellingen! 
                {:else if (userData?.drinkCount || 0) < 5}
                    Demure med det så langt 🫀
                {:else if (userData?.drinkCount || 0) < 10}
                    Noen koser seg på ferie eller? Backer 😎
                {:else}
                    Godspeed 🥸
                {/if}
            </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button 
                on:click={() => addDrink(1)}
                disabled={loading}
                class="py-3 px-4 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-base"
            >
                +1 🍺
            </button>
            <button 
                on:click={() => addDrink(2)}
                disabled={loading}
                class="py-3 px-4 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-base"
            >
                +2 🍺
            </button>
            <button 
                on:click={() => addDrink(3)}
                disabled={loading}
                class="py-3 px-4 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-base"
            >
                +3 🍺
            </button>
            <button 
                on:click={() => addDrink(5)}
                disabled={loading}
                class="py-3 px-4 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-base"
            >
                +5 🍺
            </button>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 class="font-kalmansk font-semibold text-black text-base mb-3">Egendefinert mengde:</h3>
            <div class="flex items-center space-x-3">
                <input 
                    type="number"
                    bind:value={addAmount}
                    min="1"
                    max="20"
                    class="w-20 p-2 border border-gray-300 rounded font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center"
                />
                <button 
                    on:click={() => addDrink(addAmount)}
                    disabled={loading || addAmount < 1}
                    class="flex-1 py-2 px-4 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-base"
                >
                    Legg til {addAmount} {addAmount === 1 ? 'drikke' : 'drikker'}
                </button>
            </div>
        </div>


        <div class="flex gap-3 mb-4">
            <button 
                on:click={subtractDrink}
                disabled={loading || (userData?.drinkCount || 0) === 0}
                class="flex-1 py-2 px-4 bg-red-600 text-white font-kalmansk rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors text-base"
            >
                Fjern 1 drikke ↩️
            </button>
            <button 
                on:click={fetchUserData}
                disabled={loading}
                class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 disabled:bg-gray-400 text-base"
            >
                🔄
            </button>
        </div>

        {#if message}
            <div class="p-3 rounded-lg {message.includes('Feil') || message.includes('må') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}
    {/if}
</div>