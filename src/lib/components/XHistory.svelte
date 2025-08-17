<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

    let kryssHistory: Array<{
        id: string;
        giverName: string;
        receiverName: string;
        reason: string;
        amount: number;
        timestamp: any;
        formattedTime: string;
    }> = [];
    let loading = true;
    let error: string | null = null;
    let showAll = false;

    async function fetchKryssHistory() {
        try {
            loading = true;
            error = null;
            
            // Get recent kryss history, limited to prevent too much data loading
            const q = query(
                collection(db, 'kryssLog'), 
                orderBy('timestamp', 'desc'),
                limit(showAll ? 100 : 20)
            );
            const querySnapshot = await getDocs(q);
            
            kryssHistory = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                let formattedTime = 'Unknown time';
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
                
                kryssHistory.push({
                    id: doc.id,
                    giverName: data.giverName || 'Unknown',
                    receiverName: data.receiverName || 'Unknown',
                    reason: data.reason || 'No reason provided',
                    amount: data.amount || 1,
                    timestamp: data.timestamp,
                    formattedTime
                });
            });
            
            console.log("Kryss history fetched:", kryssHistory);
        } catch (err) {
            console.error("Error fetching kryss history:", err);
            error = "Failed to load kryss history";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchKryssHistory();
    });

    // Export refresh function so parent can call it
    export function refresh() {
        fetchKryssHistory();
    }

    function toggleShowAll() {
        showAll = !showAll;
        fetchKryssHistory();
    }
</script>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">📜 Kryss-logg</h2>
        <div class="flex gap-2">
            <button 
                on:click={toggleShowAll}
                class="px-3 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 transition-colors text-sm"
            >
                {showAll ? 'Show Recent' : 'Show All'}
            </button>
            <button 
                on:click={fetchKryssHistory}
                class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Refresh'} 🔄
            </button>
        </div>
    </div>

    {#if loading}
        <div class="text-center py-6 sm:py-8">
            <div class="animate-pulse font-kalmansk text-black text-sm sm:text-base">Loading history...</div>
        </div>
    {:else if error}
        <div class="text-center py-6 sm:py-8 text-black">
            <p class="font-kalmansk text-sm sm:text-base text-red-600">{error}</p>
            <button 
                on:click={fetchKryssHistory}
                class="mt-2 px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 text-sm"
            >
                Try Again
            </button>
        </div>
    {:else if kryssHistory.length === 0}
        <div class="text-center py-6 sm:py-8 text-black">
            <p class="font-kalmansk text-sm sm:text-base">No kryss history yet. Start giving some kryss! ❌</p>
        </div>
    {:else}
        <!-- Mobile: Card Layout -->
        <div class="block sm:hidden space-y-3">
            {#each kryssHistory as entry}
                <div class="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-600">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="font-kalmansk font-semibold text-black text-sm">
                                {entry.giverName}
                            </span>
                            <span class="text-gray-500 text-sm">→</span>
                            <span class="font-kalmansk font-semibold text-blue-600 text-sm">
                                {entry.receiverName}
                            </span>
                        </div>
                        <span class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-kalmansk">
                            {entry.amount}x
                        </span>
                    </div>
                    <p class="font-kalmansk text-black text-sm mb-2">
                        "{entry.reason}"
                    </p>
                    <p class="text-xs text-gray-500 font-kalmansk">
                        {entry.formattedTime}
                    </p>
                </div>
            {/each}
        </div>

        <!-- Desktop: Table Layout -->
        <div class="hidden sm:block overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b-2 border-gray-200">
                        <th class="text-left py-3 px-2 font-saotorpes text-black text-sm">From</th>
                        <th class="text-left py-3 px-2 font-saotorpes text-black text-sm">To</th>
                        <th class="text-left py-3 px-2 font-saotorpes text-black text-sm">Reason</th>
                        <th class="text-center py-3 px-2 font-saotorpes text-black text-sm">Amount</th>
                        <th class="text-right py-3 px-2 font-saotorpes text-black text-sm">When</th>
                    </tr>
                </thead>
                <tbody>
                    {#each kryssHistory as entry}
                        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td class="py-3 px-2 font-kalmansk text-black text-sm">
                                {entry.giverName}
                            </td>
                            <td class="py-3 px-2 font-kalmansk text-blue-600 font-semibold text-sm">
                                {entry.receiverName}
                            </td>
                            <td class="py-3 px-2 font-kalmansk text-black text-sm max-w-xs">
                                <span class="truncate block" title={entry.reason}>
                                    "{entry.reason}"
                                </span>
                            </td>
                            <td class="py-3 px-2 text-center">
                                <span class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-kalmansk">
                                    {entry.amount}x
                                </span>
                            </td>
                            <td class="py-3 px-2 text-right font-kalmansk text-gray-500 text-xs">
                                {entry.formattedTime}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Summary -->
        <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="text-center">
                <span class="text-sm font-kalmansk text-black">
                    Showing {kryssHistory.length} {showAll ? 'of all' : 'recent'} entries
                </span>
            </div>
        </div>
    {/if}
</div>