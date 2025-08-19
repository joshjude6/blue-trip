<!--
kart med alles gjett
countdown
leaderboard
-->
<script>
    import AllPinsMap from "$lib/components/AllPinsMap.svelte";
    import Countdown from "$lib/components/Countdown.svelte";
    import DrinkLeaderboard from "$lib/components/DrinkLeaderboard.svelte";
    import KryssLeaderboard from "$lib/components/KryssLeaderboard.svelte";
</script>

<div class="w-full max-w-2xl mx-auto space-y-8">
    <section class="text-center">
        <Countdown />
    </section>
    <section class="max-w-4xl mx-auto px-4">
        <div class="bg-white rounded-lg p-6 sm:p-8">
            <p class="font-kalmansk text-black text-base sm:text-lg leading-relaxed text-center">
                Blod, svette, og KI har gitt oss denne nettsiden for blåturen som vi SNART skal på!
                På denne nettsiden kan dere melde kryss på hverandre, registrere antall enheter, og gjette hvor vi skal. 
                Jeg kom ikke på mer features, men gjerne foreslå noe, så vibe-koder jeg det raskt (jeg betalte for claude.ai i én måned via jobb selv om det funka helt jævlig for VHDL😎).
            </p>
        </div>
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
    <section>
        <AllPinsMap />
    </section>
</div>