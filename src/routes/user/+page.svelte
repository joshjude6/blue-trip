<script>
    import Profilepic from "$lib/components/Profilepic.svelte";
    import UserMap from "$lib/components/UserMap.svelte";
</script>

<h2 class="text-3xl font-kalmansk font-bold">Her er brukersiden din!</h2>



<div class="w-full max-w-2xl mx-auto space-y-8">
    <section>
        <Profilepic />
    </section>
    <section>
        <UserMap />
    </section>
</div>