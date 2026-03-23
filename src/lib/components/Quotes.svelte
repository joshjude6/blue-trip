<script lang="ts">
    import { onMount } from 'svelte';
    import { db, functions } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
    import { httpsCallable } from 'firebase/functions';

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let saving = false;
    let deleting = false;
    let error: string | null = null;
    let message = '';
    let showAll = false;

    let quoteText = '';
    let saidBy = '';
    let nameOptions: string[] = [];
    let userNameOptions: string[] = [];

    let quotes: Array<{
        id: string;
        quote: string;
        saidBy: string;
        submittedByName: string;
        timestamp: any;
        formattedTime: string;
    }> = [];

    onMount(() => {
        const unsubscribe = onAuthChange(async (user: any) => {
            authLoading = false;

            if (!user) {
                currentUser = null;
                return;
            }

            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                const userData = snap.exists() ? snap.data() : {};
                currentUser = {
                    ...user,
                    fornavn: userData.fornavn || 'Unknown',
                    isAdmin: userData.isAdmin === true
                };
            } catch (err) {
                console.error('Error fetching current user:', err);
                currentUser = {
                    ...user,
                    fornavn: 'Unknown',
                    isAdmin: false
                };
            }
        });

        fetchUserNames();
        fetchQuotes();
        return () => unsubscribe();
    });

    async function fetchUserNames() {
        try {
            const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('fornavn', 'asc')));
            const firstNames = new Set<string>();

            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                const firstName = (userData.fornavn || '').toString().trim();
                if (firstName) {
                    firstNames.add(firstName);
                }
            });

            userNameOptions = Array.from(firstNames).sort((a, b) => a.localeCompare(b, 'no'));
            nameOptions = userNameOptions;
        } catch (err) {
            console.error('Error fetching user names:', err);
        }
    }

    async function fetchQuotes() {
        try {
            loading = true;
            error = null;

            const getQuotesCallable = httpsCallable(functions, 'getQuotes');
            const response: any = await getQuotesCallable({ showAll });
            const entries = response?.data?.quotes || [];

            quotes = [];
            const firstNames = new Set<string>();

            entries.forEach((data: any) => {
                const rawName = (data.saidBy || '').toString().trim();
                const firstName = rawName.split(/\s+/)[0];
                if (firstName) {
                    firstNames.add(firstName);
                }

                let formattedTime = 'Ukjent tid';
                if (data.timestampMs) {
                    const date = new Date(data.timestampMs);
                    formattedTime = new Intl.DateTimeFormat('no-NO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(date);
                }

                quotes.push({
                    id: data.id,
                    quote: data.quote || '',
                    saidBy: data.saidBy || 'Ukjent',
                    submittedByName: data.submittedByName || 'Ukjent',
                    timestamp: data.timestampMs,
                    formattedTime
                });
            });

            const quoteNameOptions = Array.from(firstNames).sort((a, b) => a.localeCompare(b, 'no'));
            const mergedOptions = new Set<string>([...userNameOptions, ...quoteNameOptions]);
            nameOptions = Array.from(mergedOptions).sort((a, b) => a.localeCompare(b, 'no'));

            if (!nameOptions.includes(saidBy)) {
                saidBy = '';
            }
        } catch (err) {
            console.error('Error fetching quotes:', err);
            error = 'Kunne ikke laste quotes.';
        } finally {
            loading = false;
        }
    }

    async function addQuote() {
        if (!currentUser) {
            message = 'Du må være logget inn for å legge til quote.';
            return;
        }

        if (!quoteText.trim() || !saidBy.trim()) {
            message = 'Skriv både quote og hvem som sa det.';
            return;
        }

        saving = true;
        message = '';

        try {
            const addQuoteCallable = httpsCallable(functions, 'addQuote');
            await addQuoteCallable({
                quote: quoteText.trim(),
                saidBy: saidBy.trim()
            });

            quoteText = '';
            saidBy = '';
            message = '✅ Quote lagret!';

            await fetchQuotes();
        } catch (err) {
            console.error('Error adding quote:', err);
            message = '❌ Feil ved lagring av quote.';
        } finally {
            saving = false;
            setTimeout(() => (message = ''), 4000);
        }
    }

    async function deleteQuote(quoteId: string) {
        if (!currentUser?.isAdmin) {
            message = '❌ Kun admin kan slette quotes.';
            setTimeout(() => (message = ''), 3000);
            return;
        }

        if (!confirm('Slette denne quoten? Dette kan ikke angres.')) {
            return;
        }

        deleting = true;
        message = '';

        try {
            const deleteQuoteCallable = httpsCallable(functions, 'deleteQuote');
            await deleteQuoteCallable({ quoteId });
            message = '✅ Quote slettet.';
            await fetchQuotes();
        } catch (err) {
            console.error('Error deleting quote:', err);
            message = '❌ Feil ved sletting av quote.';
        } finally {
            deleting = false;
            setTimeout(() => (message = ''), 4000);
        }
    }

    function toggleShowAll() {
        showAll = !showAll;
        fetchQuotes();
    }
</script>

<div class="w-full max-w-4xl mx-auto space-y-6">
    <div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">💬 Legg til quote</h2>

        {#if authLoading}
            <div class="text-center py-4">
                <div class="animate-pulse font-kalmansk text-black text-base">Laster...</div>
            </div>
        {:else if !currentUser}
            <div class="text-center py-4">
                <p class="font-kalmansk text-black text-base">Du må være logget inn for å legge til quotes.</p>
            </div>
        {:else}
            <form on:submit|preventDefault={addQuote} class="space-y-4">
                <div>
                    <label for="quoteText" class="block text-base font-kalmansk font-semibold text-black mb-2">Quote</label>
                    <textarea
                        id="quoteText"
                        bind:value={quoteText}
                        rows="3"
                        maxlength="250"
                        required
                        placeholder="Skriv sitatet her..."
                        class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    ></textarea>
                    <div class="text-sm text-gray-500 font-kalmansk mt-1">{quoteText.length}/250 tegn</div>
                </div>

                <div>
                    <label for="saidBy" class="block text-base font-kalmansk font-semibold text-black mb-2">Hvem sa det?</label>
                    <select
                        id="saidBy"
                        bind:value={saidBy}
                        required
                        class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                        <option value="">Velg navn...</option>
                        {#each nameOptions as firstName}
                            <option value={firstName}>{firstName}</option>
                        {/each}
                    </select>
                    {#if nameOptions.length === 0}
                        <div class="text-sm text-gray-500 font-kalmansk mt-1">Ingen navn funnet i quote-loggen ennå.</div>
                    {/if}
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    class="px-6 py-3 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-base"
                >
                    {saving ? 'Lagrer...' : 'Lagre quote'}
                </button>
            </form>
        {/if}

        {#if message}
            <div class="mt-4 p-3 rounded-lg {message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}
    </div>

    <div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🗂️ Quote-logg</h2>
            <div class="flex gap-2">
                <button
                    on:click={toggleShowAll}
                    class="px-3 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 transition-colors text-sm"
                >
                    {showAll ? 'Vis nylige' : 'Vis alle'}
                </button>
                <button
                    on:click={fetchQuotes}
                    disabled={loading}
                    class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                    {loading ? 'Laster...' : 'Refresh'} 🔄
                </button>
            </div>
        </div>

        {#if loading}
            <div class="text-center py-6">
                <div class="animate-pulse font-kalmansk text-black text-base">Laster quotes...</div>
            </div>
        {:else if error}
            <div class="text-center py-6">
                <p class="font-kalmansk text-red-600 text-base">{error}</p>
            </div>
        {:else if quotes.length === 0}
            <div class="text-center py-6">
                <p class="font-kalmansk text-black text-base">Ingen quotes ennå. Legg til den første 💬</p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each quotes as entry}
                    <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
                        <p class="font-kalmansk text-black text-base sm:text-lg leading-relaxed mb-2">“{entry.quote}”</p>
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                            <p class="font-kalmansk text-blue-600 font-semibold text-sm sm:text-base">— {entry.saidBy}</p>
                            <div class="flex items-center gap-2 sm:gap-3">
                                <p class="font-kalmansk text-gray-500 text-sm">Lagt til av {entry.submittedByName} • {entry.formattedTime}</p>
                                {#if currentUser?.isAdmin}
                                    <button
                                        on:click={() => deleteQuote(entry.id)}
                                        disabled={deleting}
                                        class="px-2 py-1 bg-red-600 text-white font-kalmansk rounded hover:bg-red-700 disabled:bg-gray-400 text-xs"
                                    >
                                        Slett
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200 text-center">
                <span class="text-sm font-kalmansk text-black">
                    Viser {quotes.length} {showAll ? 'quotes totalt' : 'nylige quotes'}
                </span>
            </div>
        {/if}
    </div>
</div>
