<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDocs, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";

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
            message = 'You must be logged in to give kryss';
            return;
        }

        if (!selectedReceiver || !reason.trim()) {
            message = 'Please select a receiver and provide a reason';
            return;
        }

        if (amount < 1 || amount > 10) {
            message = 'Amount must be between 1 and 10';
            return;
        }

        loading = true;
        message = '';

        try {
            // Find receiver name for the log
            const receiver = users.find(u => u.id === selectedReceiver);
            const giverName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown';

            // Add to kryss log collection
            await addDoc(collection(db, 'kryssLog'), {
                giverId: currentUser.uid,
                giverName: giverName,
                receiverId: selectedReceiver,
                receiverName: receiver?.name || 'Unknown',
                reason: reason.trim(),
                amount: amount,
                timestamp: serverTimestamp()
            });

            // Update receiver's total crosses
            await updateDoc(doc(db, 'users', selectedReceiver), {
                totalCrosses: increment(amount)
            });

            message = `Successfully gave ${amount} kryss to ${receiver?.name}! 🎉`;
            
            // Reset form
            selectedReceiver = '';
            reason = '';
            amount = 1;

            // Notify parent components to refresh
            dispatch('kryssGiven');

        } catch (error) {
            console.error("Error giving kryss:", error);
            message = 'Error giving kryss. Please try again.';
        } finally {
            loading = false;
            // Clear message after 5 seconds
            setTimeout(() => message = '', 5000);
        }
    }
</script>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-6">❌ Give Kryss</h2>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-sm">Loading...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-sm sm:text-base">You must be logged in to give kryss.</p>
        </div>
    {:else}
        <form on:submit|preventDefault={giveKryss} class="space-y-4 sm:space-y-6">
            <!-- Receiver Selection -->
            <div>
                <label for="receiver" class="block text-sm font-kalmansk font-semibold text-black mb-2">
                    Who gets the kryss?
                </label>
                <select 
                    id="receiver"
                    bind:value={selectedReceiver}
                    class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-sm sm:text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                >
                    <option value="">Select someone...</option>
                    {#each users as user}
                        <option value={user.id}>{user.name}</option>
                    {/each}
                </select>
            </div>

            <!-- Reason Input -->
            <div>
                <label for="reason" class="block text-sm font-kalmansk font-semibold text-black mb-2">
                    Why are they getting kryss?
                </label>
                <textarea 
                    id="reason"
                    bind:value={reason}
                    placeholder="Explain why they deserve these kryss..."
                    class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-sm sm:text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    rows="3"
                    maxlength="200"
                    required
                ></textarea>
                <div class="text-xs text-gray-500 font-kalmansk mt-1">
                    {reason.length}/200 characters
                </div>
            </div>

            <!-- Amount Selection -->
            <div>
                <label for="amount" class="block text-sm font-kalmansk font-semibold text-black mb-2">
                    How many kryss?
                </label>
                <div class="flex items-center space-x-4">
                    <input 
                        id="amount"
                        type="number"
                        bind:value={amount}
                        min="1"
                        max="10"
                        class="w-20 p-3 border border-gray-300 rounded-lg font-kalmansk text-sm sm:text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center"
                        required
                    />
                    <div class="flex flex-wrap gap-1 sm:gap-2">
                        {#each [1, 2, 3, 5, 10] as preset}
                            <button 
                                type="button"
                                on:click={() => amount = preset}
                                class="px-2 sm:px-3 py-1 text-xs sm:text-sm font-kalmansk border border-gray-300 rounded {amount === preset ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-50'} transition-colors"
                            >
                                {preset}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Message Display -->
            {#if message}
                <div class="p-3 rounded-lg {message.includes('Error') || message.includes('must') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-sm">
                    {message}
                </div>
            {/if}

            <!-- Submit Button -->
            <button 
                type="submit"
                disabled={loading || !selectedReceiver || !reason.trim()}
                class="w-full py-3 px-6 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
                {loading ? 'Giving Kryss...' : `Give ${amount} Kryss`} ❌
            </button>
        </form>
    {/if}
</div>