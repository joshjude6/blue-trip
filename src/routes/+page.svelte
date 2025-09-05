
<script>
    import AllPinsMap from "$lib/components/AllPinsMap.svelte";
    import DrinkLeaderboard from "$lib/components/DrinkLeaderboard.svelte";
    import Horoscope from "$lib/components/Horoscope.svelte";
    import KryssLeaderboard from "$lib/components/KryssLeaderboard.svelte";
</script>

<div class="w-full max-w-4xl mx-auto space-y-8">
    <section>
        <Horoscope />
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