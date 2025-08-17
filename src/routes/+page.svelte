<!--
kart med alles gjett
countdown
leaderboard
-->
<script>
    import Countdown from "$lib/components/Countdown.svelte";
    import Leaderboard from "$lib/components/Leaderboard.svelte";
</script>

<div class="w-full space-y-8">
    <section class="text-center">
        <Countdown />
    </section>
    <section>
        <Leaderboard />
    </section>
</div>