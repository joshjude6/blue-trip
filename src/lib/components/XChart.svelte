<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { collection, getDocs, query, orderBy } from "firebase/firestore";

    let users: Array<{
        id: string;
        name: string;
        totalCrosses: number;
    }> = [];
    let loading = true;
    let error: string | null = null;
    let maxCrosses = 0;

    async function fetchUsers() {
        try {
            loading = true;
            error = null;
            
            const q = query(collection(db, 'users'), orderBy('totalCrosses', 'desc'));
            const querySnapshot = await getDocs(q);
            
            users = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const crosses = userData.totalCrosses || 0;
                users.push({
                    id: doc.id,
                    name: userData.fornavn || 'Unknown',
                    totalCrosses: crosses
                });
            });
            
            maxCrosses = users.length > 0 ? Math.max(...users.map(u => u.totalCrosses), 5) : 5;
            console.log("Users fetched for chart:", users);
        } catch (err) {
            console.error("Error fetching users:", err);
            error = "Failed to load chart data";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchUsers();
    });

    function getBarHeight(crosses: number): number {
        if (maxCrosses === 0) return 0;
        return Math.max((crosses / maxCrosses) * 100, 2); // Minimum 2% for visibility
    }

    function getBarColor(index: number): string {
        const colors = [
            'bg-blue-600',
            'bg-green-600', 
            'bg-yellow-600',
            'bg-red-600',
            'bg-purple-600',
            'bg-pink-600',
            'bg-indigo-600',
            'bg-gray-600'
        ];
        return colors[index % colors.length];
    }

    // Export refresh function so parent can call it
    export function refresh() {
        fetchUsers();
    }
</script>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">📊 Oversikt over kryss</h2>
        <button 
            on:click={fetchUsers}
            class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Refresh'} 🔄
        </button>
    </div>

    {#if loading}
        <div class="text-center py-6 sm:py-8">
            <div class="animate-pulse font-kalmansk text-black text-base sm:text-lg">Loading chart...</div>
        </div>
    {:else if error}
        <div class="text-center py-6 sm:py-8 text-black">
            <p class="font-kalmansk text-base sm:text-lg text-red-600">{error}</p>
            <button 
                on:click={fetchUsers}
                class="mt-2 px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 text-base"
            >
                Try Again
            </button>
        </div>
    {:else if users.length === 0}
        <div class="text-center py-6 sm:py-8 text-black">
            <p class="font-kalmansk text-base sm:text-lg">No users found.</p>
        </div>
    {:else}
        <!-- Bar Chart -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="flex items-end justify-center space-x-2 sm:space-x-4 h-48 sm:h-64">
                {#each users as user, index}
                    <div class="flex flex-col items-center space-y-2">
                        <!-- Bar -->
                        <div class="flex flex-col justify-end h-32 sm:h-48">
                            <div 
                                class="{getBarColor(index)} rounded-t transition-all duration-500 ease-out min-w-8 sm:min-w-12 flex items-end justify-center pb-1"
                                style="height: {getBarHeight(user.totalCrosses)}%;"
                            >
                                {#if user.totalCrosses > 0}
                                    <span class="text-white text-xs font-kalmansk font-bold">
                                        {user.totalCrosses}
                                    </span>
                                {/if}
                            </div>
                        </div>
                        
                        <!-- User Name -->
                        <div class="text-center">
                            <span class="text-sm sm:text-base font-kalmansk text-black font-semibold">
                                {user.name}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
            
            <!-- Y-axis labels -->
            <div class="flex justify-between mt-4 text-sm text-gray-500 font-kalmansk">
                <span>0</span>
                <span class="text-center">{Math.floor(maxCrosses/2)}</span>
                <span>{maxCrosses}</span>
            </div>
        </div>

        <!-- Summary -->
        <div class="bg-blue-50 rounded-lg p-3 sm:p-4">
        <div class="flex justify-center gap-8 sm:gap-16 text-center">
            <div>
                <div class="text-lg sm:text-xl font-saotorpes text-blue-600">
                    {users.reduce((sum, user) => sum + user.totalCrosses, 0)}
                </div>
                <div class="text-sm sm:text-base font-kalmansk text-black">Total mengde kryss</div>
            </div>
            <div>
                <div class="text-lg sm:text-xl font-saotorpes text-blue-600">
                    {users.length}
                </div>
                <div class="text-sm sm:text-base font-kalmansk text-black">Deltakere</div>
            </div>
        </div>
    </div>
    {/if}
</div>