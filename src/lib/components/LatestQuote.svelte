<script lang="ts">
    import { onMount } from 'svelte';
    import { functions } from '$lib/api/firebase.js';
    import { httpsCallable } from 'firebase/functions';

    let loading = true;
    let error: string | null = null;
    let latestQuote: {
        quote: string;
        saidBy: string;
    } | null = null;

    async function fetchLatestQuote() {
        try {
            loading = true;
            error = null;

            const getQuotesCallable = httpsCallable(functions, 'getQuotes');
            const response: any = await getQuotesCallable({ showAll: false });
            const entries = response?.data?.quotes || [];

            if (entries.length === 0) {
                latestQuote = null;
                return;
            }

            const data = entries[0];

            latestQuote = {
                quote: data.quote || '',
                saidBy: data.saidBy || 'Ukjent'
            };
        } catch (err) {
            console.error('Error fetching latest quote:', err);
            error = 'Kunne ikke laste siste quote.';
            latestQuote = null;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchLatestQuote();
    });
</script>

<div class="w-full max-w-4xl mx-auto py-2 sm:py-3 text-center">
    {#if loading}
        <p class="animate-pulse font-kalmansk text-black text-base">Laster siste quote...</p>
    {:else if error}
        <p class="font-kalmansk text-black text-base">{error}</p>
    {:else if !latestQuote}
        <p class="font-kalmansk text-black text-base">Ingen quotes ennå.</p>
    {:else}
        <p class="font-kalmansk text-black text-xl sm:text-2xl leading-relaxed">“{latestQuote.quote}”</p>
        <p class="font-kalmansk text-blue-600 font-semibold text-lg sm:text-xl">- {latestQuote.saidBy}</p>
    {/if}
</div>
