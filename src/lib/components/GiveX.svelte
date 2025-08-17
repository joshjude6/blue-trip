<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDoc, getDocs, doc, increment, serverTimestamp, runTransaction } from "firebase/firestore";

    let users: Array<{
        id: string;
        name: string;
    }> = [];
    let currentUser: any = null;
    let selectedReceiver = '';
    let reason = '';
    let amount = 1;
    let loading = false;
    let message = '';
    let authLoading = true;

    // Custom event to notify parent of new kryss
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    onMount(() => {
        const unsubscribe = onAuthChange(async (user: any) => {
        authLoading = false;

        if (user) {
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) {
            const userData = snap.data();
            currentUser = {
                ...user,
                fornavn: userData.fornavn || 'Unknown'
            };
            } else {
            currentUser = {
                ...user,
                fornavn: 'Unknown'
            };
            }
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            currentUser = {
            ...user,
            fornavn: 'Unknown'
            };
        }

        await fetchUsers();
        } else {
        currentUser = null;
        }
    });

    return () => unsubscribe();
    });


    async function fetchUsers() {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            users = [];
            
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                // Don't include current user in the list
                if (doc.id !== currentUser?.uid) {
                    users.push({
                        id: doc.id,
                        name: userData.fornavn || 'Unknown'
                    });
                }
            });
            
            users.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    async function giveKryss() {
        if (!currentUser) {
            message = 'Du må være logget inn for å kunne gi kryss.';
            return;
        }

        if (!selectedReceiver || !reason.trim()) {
            message = 'Velg en mottaker og gi en grunn.';
            return;
        }

        if (amount < 1 || amount > 10) {
            message = 'Mengde må være mellom 1 og 10.';
            return;
        }

        loading = true;
        message = '';

        try {
            const receiver = users.find(u => u.id === selectedReceiver);
            const giverName = currentUser.fornavn || 'Unknown';

            // Use transaction to ensure both operations succeed together
            await runTransaction(db, async (transaction) => {
                // Create a reference for the new kryssLog document
                const kryssLogRef = doc(collection(db, 'kryssLog'));
                
                // Add to kryss log
                transaction.set(kryssLogRef, {
                    giverId: currentUser.uid,
                    giverName: giverName,
                    receiverId: selectedReceiver,
                    receiverName: receiver?.name || 'Unknown',
                    reason: reason.trim(),
                    amount: amount,
                    timestamp: serverTimestamp()
                });

                // Update receiver's total crosses
                const userRef = doc(db, 'users', selectedReceiver);
                transaction.update(userRef, {
                    totalCrosses: increment(amount)
                });
            });

            message = `Ga ${amount} kryss til ${receiver?.name}! 🎉`;
            
            // Reset form
            selectedReceiver = '';
            reason = '';
            amount = 1;

            // Notify parent components to refresh
            dispatch('kryssGiven');

        } catch (error) {
            console.error("Error giving kryss:", error);
            
            // Better error messages
            if (error === 'permission-denied') {
                message = 'Ingen tillatelse. Sjekk Firestore-regler.';
            } else if (error === 'not-found') {
                message = 'Brukeren ble ikke funnet.';
            } else {
                message = 'Feil ved giving av kryss. Prøv igjen.';
            }
        } finally {
            loading = false;
            // Clear message after 5 seconds
            setTimeout(() => message = '', 5000);
        }
    }
</script>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-6">❌ Gi kryss her!</h2>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Laster inn...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base sm:text-lg">Du må være logget inn for å gi kryss!</p>
        </div>
    {:else}
        <form on:submit|preventDefault={giveKryss} class="space-y-4 sm:space-y-6">
            <div>
                <label for="receiver" class="block text-base font-kalmansk font-semibold text-black mb-2">
                    Hvem får kryss denne gangen?
                </label>
                <select 
                    id="receiver"
                    bind:value={selectedReceiver}
                    class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base sm:text-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                >
                    <option value="">Velg en deltaker...</option>
                    {#each users as user}
                        <option value={user.id}>{user.name}</option>
                    {/each}
                </select>
            </div>

            <div>
                <label for="reason" class="block text-base font-kalmansk font-semibold text-black mb-2">
                    Hvorfor får de kryss?
                </label>
                <textarea 
                    id="reason"
                    bind:value={reason}
                    placeholder="Forklar hvorfor de skal ha kryss..."
                    class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base sm:text-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    rows="3"
                    maxlength="200"
                    required
                ></textarea>
                <div class="text-sm text-gray-500 font-kalmansk mt-1">
                    {reason.length}/200 tegn
                </div>
            </div>

            <div>
                <label for="amount" class="block text-base font-kalmansk font-semibold text-black mb-2">
                    Hvor mange kryss?
                </label>
                <div class="flex items-center space-x-4">
                    <input 
                        id="amount"
                        type="number"
                        bind:value={amount}
                        min="1"
                        max="10"
                        class="w-20 p-3 border border-gray-300 rounded-lg font-kalmansk text-base sm:text-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center"
                        required
                    />
                    <div class="flex flex-wrap gap-1 sm:gap-2">
                        {#each [1, 2, 3, 5, 10] as preset}
                            <button 
                                type="button"
                                on:click={() => amount = preset}
                                class="px-3 sm:px-4 py-2 text-sm sm:text-base font-kalmansk border border-gray-300 rounded {amount === preset ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-50'} transition-colors"
                            >
                                {preset}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            {#if message}
                <div class="p-3 rounded-lg {message.includes('Feil') || message.includes('må') || message.includes('Ingen') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                    {message}
                </div>
            {/if}

            <button 
                type="submit"
                disabled={loading || !selectedReceiver || !reason.trim()}
                class="w-full py-3 px-6 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base sm:text-lg"
            >
                {loading ? 'Gir kryss...' : `Gi ${amount} kryss`}
            </button>
        </form>
    {/if}
</div>