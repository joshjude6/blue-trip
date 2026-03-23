<script lang="ts">
    import { onMount } from 'svelte';
    import { db, storage } from '$lib/api/firebase.js';
    import { collection, getDocs, query, where } from "firebase/firestore";
    import { ref, getDownloadURL } from "firebase/storage";

    // Historical data from September 3, 2025 23:59 Oslo time
    const HALL_OF_FAME_DATA = {
        kryss: [
            { name: 'Ian Philip', etternavn: 'Eglin', totalCrosses: 49 },
            { name: 'Ida', etternavn: 'Rødsjø', totalCrosses: 25 },
            { name: 'Martin', etternavn: 'Lindheim', totalCrosses: 12 }
        ],
        drinks: [
            { name: 'Håvard', etternavn: 'Lundheim', drinkCount: 25 },
            { name: 'Ida', etternavn: 'Rødsjø', drinkCount: 20 },
            { name: 'Tora', etternavn: 'Reigstad', drinkCount: 19 }
        ]
    };

    let kryssHallOfFame: Array<{
        id: string;
        name: string;
        etternavn: string;
        totalCrosses: number;
        profilePictureUrl: string | null;
        profilePictureLoading: boolean;
    }> = [];

    let drinkHallOfFame: Array<{
        id: string;
        name: string;
        etternavn: string;
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
                return null;
            }
        }
    }

    async function findUserByName(fornavn: string, etternavn: string): Promise<string | null> {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            
            for (const doc of usersSnapshot.docs) {
                const userData = doc.data();
                const userFornavn = userData.fornavn || '';
                const userEtternavn = userData.etternavn || '';
                
                // Match first name and last name (case insensitive)
                if (userFornavn.toLowerCase() === fornavn.toLowerCase() && 
                    userEtternavn.toLowerCase() === etternavn.toLowerCase()) {
                    return doc.id;
                }
            }
            
            // Fallback: try to match just first name if full name doesn't work
            for (const doc of usersSnapshot.docs) {
                const userData = doc.data();
                const userFornavn = userData.fornavn || '';
                
                if (userFornavn.toLowerCase() === fornavn.toLowerCase()) {
                    return doc.id;
                }
            }
            
            return null;
        } catch (error) {
            console.error(`Error finding user ${fornavn} ${etternavn}:`, error);
            return null;
        }
    }

    async function loadHallOfFame() {
        try {
            loading = true;
            error = null;

            // Load kryss hall of fame
            kryssHallOfFame = [];
            for (const user of HALL_OF_FAME_DATA.kryss) {
                const userId = await findUserByName(user.name, user.etternavn);
                
                const hallOfFameEntry = {
                    id: userId || 'unknown',
                    name: user.name,
                    etternavn: user.etternavn,
                    totalCrosses: user.totalCrosses,
                    profilePictureUrl: null,
                    profilePictureLoading: true
                };
                
                kryssHallOfFame.push(hallOfFameEntry);
                
                // Load profile picture if user found
                if (userId) {
                    hallOfFameEntry.profilePictureUrl = await getProfilePictureUrl(userId);
                }
                hallOfFameEntry.profilePictureLoading = false;
                kryssHallOfFame = [...kryssHallOfFame]; // Trigger reactivity
            }

            // Load drink hall of fame
            drinkHallOfFame = [];
            for (const user of HALL_OF_FAME_DATA.drinks) {
                const userId = await findUserByName(user.name, user.etternavn);
                
                const hallOfFameEntry = {
                    id: userId || 'unknown',
                    name: user.name,
                    etternavn: user.etternavn,
                    drinkCount: user.drinkCount,
                    profilePictureUrl: null,
                    profilePictureLoading: true
                };
                
                drinkHallOfFame.push(hallOfFameEntry);
                
                // Load profile picture if user found
                if (userId) {
                    hallOfFameEntry.profilePictureUrl = await getProfilePictureUrl(userId);
                }
                hallOfFameEntry.profilePictureLoading = false;
                drinkHallOfFame = [...drinkHallOfFame]; // Trigger reactivity
            }

        } catch (err) {
            console.error("Error loading hall of fame:", err);
            error = "Failed to load hall of fame data";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadHallOfFame();
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
            case 0: return 'text-yellow-600 font-saotorpes font-bold';
            case 1: return 'text-gray-500 font-saotorpes font-bold';
            case 2: return 'text-amber-600 font-saotorpes font-bold';
            default: return 'text-black font-kalmansk';
        }
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
    }
</script>

<div class="min-h-screen from-yellow-50 via-white to-blue-50 p-4">
    <div class="max-w-6xl mx-auto space-y-8">
        <!-- Header -->
        <div class="text-center py-8">
            <h1 class="text-3xl sm:text-4xl font-saotorpes font-bold text-black mb-4">🏆 Málaga Hall of Fame</h1>
            <p class="font-kalmansk text-gray-600 text-base sm:text-lg">
                Topp 3 på leaderboardene for blåturen i 2025 til Málaga, Spania - gratulerer til vinnerne våre!
            </p>
        </div>

        {#if loading}
            <div class="text-center py-12">
                <div class="animate-pulse font-kalmansk text-black text-lg">Loading hall of fame...</div>
            </div>
        {:else if error}
            <div class="text-center py-12">
                <p class="font-kalmansk text-red-600 text-lg">{error}</p>
                <button 
                    on:click={loadHallOfFame}
                    class="mt-4 px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        {:else}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Kryss Hall of Fame -->
                <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-200">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-saotorpes font-bold text-black mb-2">⚔️ Kryssenes mestere</h2>
                        <p class="font-kalmansk text-gray-600 text-sm">Samlet flest kryss</p>
                    </div>

                    <div class="space-y-4">
                        {#each kryssHallOfFame as user, index}
                            <div class="flex items-center justify-between p-4 rounded-lg border-l-4 shadow-sm
                            {index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-700' : 
                            index === 1 ? 'bg-gradient-to-r from-slate-200 to-slate-300 border-slate-600' : 
                            'bg-gradient-to-r from-amber-600 to-orange-800 border-orange-900'}">
                                <div class="flex items-center space-x-4 flex-1 min-w-0">
                                    <div class="text-2xl {getPositionClass(index)} flex-shrink-0">
                                        {getPositionEmoji(index)}
                                    </div>
                                    
                                    <!-- Profile Picture -->
                                    <div class="flex-shrink-0">
                                        {#if user.profilePictureLoading}
                                            <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                        {:else if user.profilePictureUrl}
                                            <img 
                                                src={user.profilePictureUrl} 
                                                alt="{user.name}'s profile"
                                                class="w-12 h-12 rounded-full object-cover border-2 {index === 0 ? 'border-yellow-900' : index === 1 ? 'border-slate-600' : 'border-amber-600'}"
                                                on:error={handleImageError}
                                            />
                                        {:else}
                                            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                <span class="text-gray-600 font-bold text-lg">{user.name.charAt(0)}</span>
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <div class="min-w-0 flex-1">
                                        <h3 class="{index === 0 ? 'text-2xl' : index === 1 ? 'text-xl' : 'text-lg'} font-kalmansk font-semibold text-black truncate">
                                            {user.name} {user.etternavn}
                                        </h3>
                                        {#if index === 0}
                                            <div class="text-lg text-yellow-900 font-kalmansk">🏆 Cancelled?</div>
                                        {/if}
                                    </div>
                                </div>
                                
                                <div class="text-right flex-shrink-0 ml-4">
                                    <div class="text-xl font-saotorpes {index === 0 ? 'text-yellow-900' : index === 1 ? 'text-slate-600' : 'text-amber-600'}">
                                        {user.totalCrosses}
                                    </div>
                                    <div class="text-sm font-kalmansk {index === 0 ? 'text-yellow-900' : index === 1 ? 'text-slate-600' : 'text-amber-600'}">
                                        kryss
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <div class="mt-6 pt-4 border-t border-yellow-200 text-center">
                        <span class="text-sm font-kalmansk text-gray-600">
                            Totalt {kryssHallOfFame.reduce((sum, user) => sum + user.totalCrosses, 0)} kryss mottatt innad i topp 3.
                        </span>
                    </div>
                </div>

                <!-- Drink Hall of Fame -->
                <div class="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-saotorpes font-bold text-black mb-2">🍻 Enhetenes ødeleggere</h2>
                        <p class="font-kalmansk text-gray-600 text-sm">Flest enheter konsumert</p>
                    </div>

                    <div class="space-y-4">
                        {#each drinkHallOfFame as user, index}
                            <div class="flex items-center justify-between p-4 rounded-lg border-l-4 shadow-sm
                            {index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-700' : 
                            index === 1 ? 'bg-gradient-to-r from-slate-200 to-slate-300 border-slate-600' : 
                            'bg-gradient-to-r from-amber-600 to-orange-800 border-orange-900'}">
                                <div class="flex items-center space-x-4 flex-1 min-w-0">
                                    <div class="text-2xl {getPositionClass(index)} flex-shrink-0">
                                        {getPositionEmoji(index)}
                                    </div>
                                    
                                    <!-- Profile Picture -->
                                    <div class="flex-shrink-0">
                                        {#if user.profilePictureLoading}
                                            <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                                        {:else if user.profilePictureUrl}
                                            <img 
                                                src={user.profilePictureUrl} 
                                                alt="{user.name}'s profile"
                                                class="w-12 h-12 rounded-full object-cover border-2 {index === 0 ? 'border-yellow-900' : index === 1 ? 'border-slate-600' : 'border-amber-600'}"
                                                on:error={handleImageError}
                                            />
                                        {:else}
                                            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                <span class="text-gray-600 font-bold text-lg">{user.name.charAt(0)}</span>
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <div class="min-w-0 flex-1">
                                        <h3 class="{index === 0 ? 'text-2xl' : index === 1 ? 'text-xl' : 'text-lg'} font-kalmansk font-semibold text-black truncate">
                                            {user.name} {user.etternavn}
                                        </h3>
                                        {#if index === 0}
                                            <div class="text-lg text-yellow-900 font-kalmansk">🏆 Fyllik?</div>
                                        {/if}
                                    </div>
                                </div>
                                
                                <div class="text-right flex-shrink-0 ml-4">
                                    <div class="text-xl font-saotorpes {index === 0 ? 'text-yellow-900' : index === 1 ? 'text-slate-600' : 'text-amber-600'}">
                                        {user.drinkCount}
                                    </div>
                                    <div class="text-sm font-kalmansk {index === 0 ? 'text-yellow-900' : index === 1 ? 'text-slate-600' : 'text-amber-600'}">
                                        {user.drinkCount === 1 ? 'enhet' : 'enheter'}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>

                    <div class="mt-6 pt-4 border-t border-blue-200 text-center">
                        <span class="text-sm font-kalmansk text-gray-600">
                            Totalt {drinkHallOfFame.reduce((sum, user) => sum + user.drinkCount, 0)} enheter konsumert innad i topp 3.
                        </span>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>