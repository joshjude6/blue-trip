<script>
    import DrinkTracker from "$lib/components/DrinkTracker.svelte";
    import Profilepic from "$lib/components/Profilepic.svelte";
    import ShowUserKryss from "$lib/components/ShowUserKryss.svelte";
    import UserInfo from "$lib/components/UserInfo.svelte";
    import UserMap from "$lib/components/UserMap.svelte";
</script>

<div class="text-center px-4">
        <h1 class="text-2xl sm:text-3xl font-saotorpes font-bold text-black mb-2 mt-8">Brukerside</h1>
    </div>

<p class="font-kalmansk text-black text-base sm:text-lg leading-relaxed text-center">
    Her kan du se hvor mange kryss du har, registrere enheter du har drukket, og gjette hvor vi skal.
</p>




<div class="w-full max-w-2xl mx-auto space-y-8">
    <section>
        <Profilepic />
    </section>
    <section>
        <ShowUserKryss />
    </section>
    <section>
        <DrinkTracker />
    </section>
    <section>
        <UserInfo />
    </section>
</div>