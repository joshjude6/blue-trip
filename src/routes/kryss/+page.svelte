<script lang="ts">
    import XChart from "$lib/components/XChart.svelte";
    import GiveX from "$lib/components/GiveX.svelte";
    import XHistory from "$lib/components/XHistory.svelte";

    let chartComponent: XChart;
    let historyComponent: XHistory;

    // Handle when new kryss is given - refresh other components
    function handleKryssGiven() {
        if (chartComponent) {
            chartComponent.refresh();
        }
        if (historyComponent) {
            historyComponent.refresh();
        }
    }
</script>

<svelte:head>
    <title>Gdansk!</title>
</svelte:head>





<div class="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
    <!-- Page Header -->
    <div class="text-center px-4">
        <h1 class="text-2xl sm:text-3xl font-saotorpes font-bold text-black mb-2 mt-8">Kryssesystem</h1>
    </div>

    <p class="font-kalmansk max-w-xl mx-auto text-black text-base sm:text-lg leading-relaxed text-center">
        På denne siden kan dere melde kryss på hverandre! Nederst på siden er det en logg med alle kryss, og grunnene til hvorfor vedkommende fikk kryssene sine. 
        Husk å være generøse med kryssene! Sharing is caring, som man sier.
    </p>

    <!-- Chart Section -->
    <section>
        <XChart bind:this={chartComponent} />
    </section>

    <!-- Give Kryss Section -->
    <section>
        <GiveX on:kryssGiven={handleKryssGiven} />
    </section>

    <!-- History Section -->
    <section>
        <XHistory bind:this={historyComponent} />
    </section>
</div>