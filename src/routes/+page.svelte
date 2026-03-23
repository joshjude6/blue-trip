
<script>
    import LatestQuote from "$lib/components/LatestQuote.svelte";
    import DrinkLeaderboard from "$lib/components/DrinkLeaderboard.svelte";
    import KryssLeaderboard from "$lib/components/KryssLeaderboard.svelte";
</script>

<div class="w-full max-w-4xl mx-auto space-y-8">
    <section>
      <LatestQuote />
    </section>
    <section>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="w-full">
        <KryssLeaderboard />
      </div>
      <div class="w-full">
        <DrinkLeaderboard />
      </div>
    </div>
    </section>
</div>