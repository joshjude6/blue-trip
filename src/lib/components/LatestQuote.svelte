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

<div class="w-full max-w-4xl mx-auto py-2 sm:py-3 text-center px-4 sm:px-6">
    <p class="font-kalmansk text-black text-sm sm:text-2xl">Addressen til Airbnben er:</p>
    <p class="font-saotorpes text-red-600 text-2xl sm:text-3xl mb-3">swietej Barbary 11, 80-755 Gdansk, Polen</p>
    <p class="font-kalmansk text-black text-sm sm:text-2xl">Tips for tur:</p>
    <p class="font-kalmansk text-black text-sm sm:text-xl">1 polsk zloty er lik 2,65 norske kroner. Anbefaler at du bare ganger alle prisene med 3 i hodet og blir positivt overrasket over hvor mye penger du "sparer". Det er forresten en kebabsjappe som heter Kebab King kun fem minutter å gå unna Airbnben! Addressen er Szafarnia 11.</p>
    <p class="font-kalmansk text-red-600 text-sm sm:text-xl mb-4">Til slutt: Det som skjer i Gdansk, blir i Gdansk (og på denne nettsiden) 🫦</p>
    
    {#if loading}
        <p class="animate-pulse font-kalmansk text-black text-base">Laster siste quote...</p>
    {:else if error}
        <p class="font-kalmansk text-black text-base">{error}</p>
    {:else if !latestQuote}
        <p class="font-kalmansk text-black text-base">Ingen quotes ennå.</p>
    {:else}
        <div class="bg-red-50 rounded-lg py-3 px-4 sm:px-6">
            <p class="font-kalmansk text-black text-xl sm:text-3xl leading-relaxed">“{latestQuote.quote}”</p>
            <p class="font-kalmansk text-blue-600 font-semibold text-lg sm:text-2xl">- {latestQuote.saidBy}</p>
        </div>
    {/if}
</div>
