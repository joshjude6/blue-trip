<script lang="ts">
    import Quotes from '$lib/components/Quotes.svelte';
</script>

<div class="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
    <div class="text-center px-4">
        <h1 class="text-2xl sm:text-3xl font-saotorpes font-bold text-black mb-2 mt-8">Quotes</h1>
    </div>

    <p class="font-kalmansk max-w-xl mx-auto text-black text-base sm:text-lg leading-relaxed text-center">
        Heller lagre en quote for mye enn for lite! Husk at alt på internett varer evig 🥰
    </p>

    <section>
        <Quotes />
    </section>
</div>
