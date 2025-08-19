<script lang="ts">
    import { onMount } from 'svelte';
    import { db, storage } from '$lib/api/firebase.js';
    import { collection, getDocs, query, orderBy } from "firebase/firestore";
    import { ref, getDownloadURL } from "firebase/storage";

    let leaderboard: Array<{
        id: string;
        name: string;
        etternavn: string;
        totalCrosses: number;
        drinkCount: number;
        profilePictureUrl: string | null;
        profilePictureLoading: boolean;
    }> = [];
    let loading = true;
    let error: string | null = null;

    async function getProfilePictureUrl(userId: string): Promise<string | null> {
        try {
            const profilePicRef = ref(storage, `profilePictures/${userId}.jpg`);
            const url = await getDownloadURL(profilePicRef);
            return url;
        } catch (error) {
            try {
                const profilePicRef = ref(storage, `profilePictures/${userId}.png`);
                const url = await getDownloadURL(profilePicRef);
                return url;
            } catch {
                // No profile picture found
                return null;
            }
        }
    }

    async function fetchLeaderboard() {
        try {
            loading = true;
            error = null;
        
            const q = query(collection(db, 'users'), orderBy('drinkCount', 'desc'));
            const querySnapshot = await getDocs(q);
            
            leaderboard = [];
            
            // First, create the leaderboard without profile pictures
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                leaderboard.push({
                    id: doc.id,
                    name: userData.fornavn || 'Unknown',
                    etternavn: userData.etternavn || '',
                    totalCrosses: userData.totalCrosses || 0,
                    drinkCount: userData.drinkCount || 0,
                    profilePictureUrl: userData.profilePictureUrl || null, // If stored as URL in document
                    profilePictureLoading: true
                });
            });
            
            // Then, load profile pictures asynchronously
            for (let i = 0; i < leaderboard.length; i++) {
                const user = leaderboard[i];
                
                // If profile picture URL is not stored in the document, try to get it from Storage
                if (!user.profilePictureUrl) {
                    user.profilePictureUrl = await getProfilePictureUrl(user.id);
                }
                
                user.profilePictureLoading = false;
                leaderboard = [...leaderboard]; // Trigger reactivity
            }
            
            console.log("Leaderboard fetched:", leaderboard);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            error = "Failed to load leaderboard";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchLeaderboard();
    });

    function getPositionEmoji(index: number): string {
        switch(index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `#${index + 1}`;
        }
    }

    function getPositionClass(index: number): string {
        switch(index) {
            case 0: return 'text-blue-600 font-saotorpes font-bold';
            case 1: return 'text-blue-600 font-saotorpes font-bold';
            case 2: return 'text-blue-600 font-saotorpes font-bold';
            default: return 'text-black font-kalmansk';
        }
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
    }
</script>

<div class="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🍻 Enhet-leaderboard</h2>
        <button 
            on:click={fetchLeaderboard}
            class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"
            disabled={loading}
        >
            {loading ? 'Loading...' : 'Refresh'}
        </button>
    </div>

    {#if loading}
        <div class="text-center py-6 sm:py-8">
            <div class="animate-pulse font-kalmansk text-black text-sm sm:text-base">Loading leaderboard...</div>
        </div>
    {:else if error}
        <div class="text-center py-6 sm:py-8 text-black">
            <p class="font-kalmansk text-sm sm:text-base">{error}</p>
            <button 
                on:click={fetchLeaderboard}
                class="mt-2 px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 text-sm sm:text-base"
            >
                Try Again
            </button>
        </div>
    {:else if leaderboard.length === 0}
        <div class="text-center py-6 sm:py-8 text-black">
            <p class="font-kalmansk text-sm sm:text-base">No users found. Start giving out some X's! ❌</p>
        </div>
    {:else}
        <div class="space-y-2 sm:space-y-3">
            {#each leaderboard as user, index}
                <div class="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border-l-4 {index < 3 ? 'border-blue-600' : 'border-gray-300'}">
                    <div class="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        <div class="text-lg sm:text-2xl {getPositionClass(index)} flex-shrink-0">
                            {getPositionEmoji(index)}
                        </div>
                        
                        <!-- Profile Picture -->
                        <div class="flex-shrink-0">
                            {#if user.profilePictureLoading}
                                <div class="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 rounded-full animate-pulse"></div>
                            {:else if user.profilePictureUrl}
                                <img 
                                    src={user.profilePictureUrl} 
                                    alt="{user.name}'s profile"
                                    class="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-300"
                                    on:error={handleImageError}
                                />
                            {:else}
                                <!-- Empty space when no profile picture -->
                                <div class="w-8 h-8 sm:w-12 sm:h-12"></div>
                            {/if}
                        </div>
                        
                        <div class="min-w-0 flex-1">
                            <h3 class="font-kalmansk font-semibold text-black text-sm sm:text-base truncate">
                                {user.name} {user.etternavn}
                            </h3>
                        </div>
                    </div>
                    <!-- drikke/kryss-teller -->
                    <div class="text-right flex-shrink-0 ml-8">
                        <div class="text-lg sm:text-xl font-saotorpes text-blue-600">
                            {user.drinkCount}
                        </div>
                        <div class="text-xs sm:text-sm font-kalmansk text-black">
                            {user.drinkCount === 1 ? 'enhet' : 'enheter'}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
        <div class="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <div class="flex justify-center sm:justify-between text-xs sm:text-sm font-kalmansk text-black">
                <span class="text-center sm:text-left">Total mengde enheter: {leaderboard.reduce((sum, user) => sum + user.drinkCount, 0)}</span>
            </div>
        </div>
    {/if}
</div>