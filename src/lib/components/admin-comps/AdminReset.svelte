<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    let confirmationPhase = '';
    let userCount = 0;
    let logCount = 0;


    let resetCrossesConfirm = false;
    let resetDrinksConfirm = false;
    let clearLogsConfirm = false;
    let resetAllConfirm = false;

    onMount(() => {
        const unsubscribe = onAuthChange((user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                fetchCounts();
            }
        });

        return () => unsubscribe();
    });

    async function fetchCounts() {
        try {
            // Count users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            userCount = usersSnapshot.size;

            // Count kryss logs
            const logsSnapshot = await getDocs(collection(db, 'kryssLog'));
            logCount = logsSnapshot.size;
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    }

    async function resetAllCrosses() {
        if (!resetCrossesConfirm) {
            resetCrossesConfirm = true;
            message = 'Klikk igjen for å bekrefte nullstilling av alle kryss...';
            setTimeout(() => {
                resetCrossesConfirm = false;
                message = '';
            }, 5000);
            return;
        }

        loading = true;
        message = '';

        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);

            let updateCount = 0;
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userData.totalCrosses && userData.totalCrosses > 0) {
                    batch.update(doc(db, 'users', userDoc.id), {
                        totalCrosses: 0
                    });
                    updateCount++;
                }
            });

            await batch.commit();
            message = `✅ Nullstilt ${updateCount} brukeres kryss-tellere!`;
            resetCrossesConfirm = false;
            fetchCounts(); // Refresh counts

        } catch (error) {
            console.error("Error resetting crosses:", error);
            message = '❌ Feil ved nullstilling av kryss.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    async function resetAllDrinks() {
        if (!resetDrinksConfirm) {
            resetDrinksConfirm = true;
            message = 'Klikk igjen for å bekrefte nullstilling av alle kryss...';
            setTimeout(() => {
                resetDrinksConfirm = false;
                message = '';
            }, 5000);
            return;
        }

        loading = true;
        message = '';

        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);

            let updateCount = 0;
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userData.drinkCount && userData.drinkCount > 0) {
                    batch.update(doc(db, 'users', userDoc.id), {
                        drinkCount: 0
                    });
                    updateCount++;
                }
            });

            await batch.commit();
            message = `✅ Nullstilt ${updateCount} brukeres enhet-tellere!`;
            resetCrossesConfirm = false;
            fetchCounts(); // Refresh counts

        } catch (error) {
            console.error("Error resetting drinks:", error);
            message = '❌ Feil ved nullstilling av enheter.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    async function clearAllLogs() {
        if (!clearLogsConfirm) {
            clearLogsConfirm = true;
            message = 'Klikk igjen for å bekrefte sletting av all historikk...';
            setTimeout(() => {
                clearLogsConfirm = false;
                message = '';
            }, 5000);
            return;
        }

        loading = true;
        message = '';

        try {
            const logsSnapshot = await getDocs(collection(db, 'kryssLog'));
            const batch = writeBatch(db);

            logsSnapshot.forEach((logDoc) => {
                batch.delete(doc(db, 'kryssLog', logDoc.id));
            });

            await batch.commit();
            message = `✅ Slettet ${logsSnapshot.size} historikk-oppføringer!`;
            clearLogsConfirm = false;
            fetchCounts(); // Refresh counts

        } catch (error) {
            console.error("Error clearing logs:", error);
            message = '❌ Feil ved sletting av historikk.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    async function resetEverything() {
        if (!resetAllConfirm) {
            resetAllConfirm = true;
            message = '⚠️ ADVARSEL: Dette sletter ALT! Klikk igjen for å bekrefte...';
            setTimeout(() => {
                resetAllConfirm = false;
                message = '';
            }, 10000);
            return;
        }

        loading = true;
        message = '';

        try {
            // Reset all user crosses and clear all logs in parallel
            const [usersSnapshot, logsSnapshot] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'kryssLog'))
            ]);

            const batch = writeBatch(db);

            // Reset user crosses
            let userResetCount = 0;
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                if (userData.totalCrosses && userData.totalCrosses > 0) {
                    batch.update(doc(db, 'users', userDoc.id), {
                        totalCrosses: 0
                    });
                    userResetCount++;
                }
            });

            // Delete all logs
            logsSnapshot.forEach((logDoc) => {
                batch.delete(doc(db, 'kryssLog', logDoc.id));
            });

            await batch.commit();
            message = `✅ FULLSTENDIG RESET: ${userResetCount} brukere nullstilt, ${logsSnapshot.size} oppføringer slettet!`;
            resetAllConfirm = false;
            fetchCounts(); // Refresh counts

        } catch (error) {
            console.error("Error resetting everything:", error);
            message = '❌ Feil ved fullstendig reset.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 10000);
        }
    }

    function cancelAllConfirmations() {
        resetCrossesConfirm = false;
        clearLogsConfirm = false;
        resetAllConfirm = false;
        message = 'Alle bekreftelser avbrutt.';
        setTimeout(() => message = '', 3000);
    }
</script>

<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-red-200">
    <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-red-600 mb-2">⚠️ Admin: Kryss System Reset</h2>
        <p class="font-kalmansk text-gray-600 text-base">Fare-område! Disse handlingene kan ikke angres.</p>
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
        <!-- Current Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
                <div class="text-2xl font-saotorpes text-blue-600">{userCount}</div>
                <div class="text-base font-kalmansk text-black">Registrerte brukere</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-saotorpes text-blue-600">{logCount}</div>
                <div class="text-base font-kalmansk text-black">Krysshistorikk oppføringer</div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-4">
            <!-- Reset Crosses Only -->
            <div class="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                <h3 class="font-saotorpes text-lg text-yellow-800 mb-2">Nullstill bare kryss-tellere/enhet-tellere</h3>
                <p class="font-kalmansk text-base text-yellow-700 mb-4">
                    Setter alle brukeres totalCrosses/drinkCount til 0. Beholder historikken for kryss.
                </p>
                <button 
                    on:click={resetAllCrosses}
                    disabled={loading}
                    class="px-6 py-3 bg-yellow-600 text-white font-kalmansk rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors text-base {resetCrossesConfirm ? 'ring-4 ring-yellow-300 bg-yellow-700' : ''}"
                >
                    {resetCrossesConfirm ? '⚠️ Klikk igjen for å bekrefte' : 'Nullstill kryss-tellere'}
                </button>
                <button 
                    on:click={resetAllDrinks}
                    disabled={loading}
                    class="px-6 py-3 bg-yellow-600 text-white font-kalmansk rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors text-base {resetDrinksConfirm ? 'ring-4 ring-yellow-300 bg-yellow-700' : ''}"
                >
                    {resetCrossesConfirm ? '⚠️ Klikk igjen for å bekrefte' : 'Nullstill enhet-tellere'}
                </button>
            </div>

            <!-- Clear Logs Only -->
            <div class="border border-orange-300 rounded-lg p-4 bg-orange-50">
                <h3 class="font-saotorpes text-lg text-orange-800 mb-2">Slett bare historikk</h3>
                <p class="font-kalmansk text-base text-orange-700 mb-4">
                    Sletter all krysshistorikk. Beholder brukernes nåværende tellere.
                </p>
                <button 
                    on:click={clearAllLogs}
                    disabled={loading}
                    class="px-6 py-3 bg-orange-600 text-white font-kalmansk rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors text-base {clearLogsConfirm ? 'ring-4 ring-orange-300 bg-orange-700' : ''}"
                >
                    {clearLogsConfirm ? '⚠️ Klikk igjen for å bekrefte' : 'Slett all historikk'}
                </button>
            </div>

            <!-- Reset Everything -->
            <div class="border border-red-400 rounded-lg p-4 bg-red-50">
                <h3 class="font-saotorpes text-lg text-red-800 mb-2">🚨 FULLSTENDIG RESET</h3>
                <p class="font-kalmansk text-base text-red-700 mb-4">
                    Nullstiller ALT: alle kryss-tellere OG sletter all historikk. Dette kan IKKE angres!
                </p>
                <button 
                    on:click={resetEverything}
                    disabled={loading}
                    class="px-6 py-3 bg-red-600 text-white font-kalmansk rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-base {resetAllConfirm ? 'ring-4 ring-red-300 bg-red-700 animate-pulse' : ''}"
                >
                    {resetAllConfirm ? '🚨 KLIKK IGJEN FOR Å SLETTE ALT' : 'RESET ALT'}
                </button>
            </div>

            <!-- Cancel All -->
            {#if resetCrossesConfirm || clearLogsConfirm || resetAllConfirm}
                <div class="text-center">
                    <button 
                        on:click={cancelAllConfirmations}
                        class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 text-base"
                    >
                        Avbryt alle bekreftelser
                    </button>
                </div>
            {/if}

            <!-- Refresh Counts -->
            <div class="text-center pt-4">
                <button 
                    on:click={fetchCounts}
                    disabled={loading}
                    class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 text-base"
                >
                    🔄 Oppdater tellere
                </button>
            </div>
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
                <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
                    <span class="font-kalmansk text-base">Loading...</span>
                </div>
            </div>
        {/if}
    {/if}
</div>