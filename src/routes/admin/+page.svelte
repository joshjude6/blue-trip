<script>
    import { onMount } from 'svelte';
    import { onAuthChange } from '$lib/api/auth.js';
    import { db } from '$lib/api/firebase.js';
    import { doc, getDoc } from 'firebase/firestore';
    import AdminCursedRev from "$lib/components/admin-comps/AdminCursedRev.svelte";
    import AdminDeleteUser from "$lib/components/admin-comps/AdminDeleteUser.svelte";
    import AdminKryssChange from "$lib/components/admin-comps/AdminKryssChange.svelte";
    import AdminReset from "$lib/components/admin-comps/AdminReset.svelte";

    let currentUser = null;
    let isAdmin = false;
    let loading = true;
    let accessDenied = false;

    onMount(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        currentUser = user;
                        isAdmin = userData.isAdmin === true;
                        accessDenied = !isAdmin;
                    } else {
                        accessDenied = true;
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    accessDenied = true;
                }
            } else {
                accessDenied = true;
            }
            loading = false;
        });

        return () => unsubscribe();
    });
</script>

{#if loading}
    <div class="flex justify-center items-center min-h-screen">
        <div class="text-xl font-kalmansk">Laster inn...</div>
    </div>
{:else if accessDenied}
    <div class="flex justify-center items-center min-h-screen">
        <div class="text-center">
            <h1 class="text-3xl font-bold text-red-600 mb-4 font-saotorpes">Ingen tilgang</h1>
            <p class="text-lg font-kalmansk">Du har ikke tillatelse til å se denne siden.</p>
            <a href="/" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-kalmansk">
                Tilbake til hovedsiden
            </a>
        </div>
    </div>
{:else if isAdmin}
    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
        <div class="space-y-6">
            <AdminReset />
            <AdminDeleteUser />
            <AdminCursedRev />
            <AdminKryssChange />
        </div>
    </div>
{/if}