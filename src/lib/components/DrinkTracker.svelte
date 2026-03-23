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

    const drinkTypes = [
        { label: 'Øl',    emoji: '🍺', field: 'beerCount' },
        { label: 'Vin',   emoji: '🍷', field: 'wineCount' },
        { label: 'Drink',emoji: '🍸', field: 'mixedDrinkCount' },
        { label: 'Shot',  emoji: '🥃', field: 'shotCount' },
    ];

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

    function getTotalDrinks(): number {
        return userData?.drinkCount || 0;
    }

    async function addDrinkType(field: string, amount: number) {
        if (!currentUser?.uid) {
            message = 'Du må være logget inn for å registrere drikke!';
            return;
        }

        loading = true;
        message = '';

        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                [field]: increment(amount),
                drinkCount: increment(amount)
            });

            userData[field] = (userData[field] || 0) + amount;
            userData.drinkCount = (userData.drinkCount || 0) + amount;

            const dt = drinkTypes.find(d => d.field === field);
            message = `+${amount} ${dt?.label || 'drikke'} registrert! ${dt?.emoji || '🍻'}`;

        } catch (error) {
            console.error("Error adding drink:", error);
            message = 'Feil ved registrering av drikke. Prøv igjen.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 3000);
        }
    }

    async function subtractDrinkType(field: string) {
        if (!currentUser?.uid || (userData?.[field] || 0) === 0) {
            message = 'Ingen drikke å fjerne!';
            setTimeout(() => message = '', 3000);
            return;
        }

        loading = true;
        message = '';

        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                [field]: increment(-1),
                drinkCount: increment(-1)
            });

            userData[field] = Math.max((userData[field] || 0) - 1, 0);
            userData.drinkCount = Math.max((userData.drinkCount || 0) - 1, 0);

            const dt = drinkTypes.find(d => d.field === field);
            message = `Fjernet 1 ${dt?.label || 'drikke'}! ↩️`;

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
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">� Drikketeller</h2>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Laster...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base">Du må være logget inn for å registrere drikke.</p>
        </div>
    {:else}
        <!-- Total count display -->
        <div class="bg-blue-50 rounded-lg p-6 text-center mb-6">
            <div class="text-4xl sm:text-5xl font-saotorpes text-blue-600 mb-2">
                {getTotalDrinks()}
            </div>
            <div class="text-base sm:text-lg font-kalmansk text-black mb-3">
                {getTotalDrinks() === 1 ? 'enhet registrert' : 'enheter registrert'}
            </div>
            <!-- Breakdown -->
            <div class="flex justify-center gap-4 text-sm font-kalmansk text-gray-600 flex-wrap mb-3">
                {#each drinkTypes as { emoji, field }}
                    <span>{emoji} {userData?.[field] || 0}</span>
                {/each}
            </div>
            <div class="text-sm font-kalmansk text-gray-500">
                {#if getTotalDrinks() === 0}
                    Ingen enheter registrert ennå. Start tellingen!
                {:else if getTotalDrinks() < 5}
                    Demure med det så langt 🫀
                {:else if getTotalDrinks() < 10}
                    Noen koser seg på ferie eller? Backer 😎
                {:else}
                    Godspeed 🥸
                {/if}
            </div>
        </div>

        <!-- Per-type buttons -->
        <div class="space-y-3 mb-4">
            {#each drinkTypes as { label, emoji, field }}
                <div class="bg-gray-50 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-kalmansk font-semibold text-black text-base">
                            {emoji} {label}
                        </span>
                        <span class="font-saotorpes text-blue-600 text-lg">
                            {userData?.[field] || 0}
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <button
                            on:click={() => addDrinkType(field, 1)}
                            disabled={loading}
                            class="flex-1 py-2 px-3 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
                        >
                            +1
                        </button>
                        <button
                            on:click={() => addDrinkType(field, 2)}
                            disabled={loading}
                            class="flex-1 py-2 px-3 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
                        >
                            +2
                        </button>
                        <button
                            on:click={() => addDrinkType(field, 3)}
                            disabled={loading}
                            class="flex-1 py-2 px-3 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm"
                        >
                            +3
                        </button>
                        <button
                            on:click={() => subtractDrinkType(field)}
                            disabled={loading || (userData?.[field] || 0) === 0}
                            class="py-2 px-3 bg-red-500 text-white font-kalmansk rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors text-sm"
                        >
                            -1 ↩️
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        <div class="flex justify-end mb-4">
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