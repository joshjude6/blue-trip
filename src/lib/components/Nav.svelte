<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/api/firebase.js';
  import { onAuthChange } from '$lib/api/auth.js';
  import { doc, getDoc } from 'firebase/firestore';

  let showAdminButton = false;

  onMount(() => {
    onAuthChange(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          showAdminButton = userDoc.exists() && userDoc.data().isAdmin === true;
        } catch (error) {
          showAdminButton = false;
        }
      } else {
        showAdminButton = false;
      }
    });
  });
</script>

<nav class="w-full py-4 shadow-md">
  <ul class="flex flex-wrap justify-center items-center gap-4 px-4">
    <li>
      <a
        href="/"
        class="bg-blue-100 text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-blue-100 transition flex items-center justify-center"
        >Hjem</a
      >
    </li>
    <li>
      <a
        href="/login"
        class="bg-blue-100 text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-blue-100 transition flex items-center justify-center"
        >Logg inn</a
      >
    </li>
    <li>
      <a
        href="/user"
        class="bg-blue-100 text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-blue-100 transition flex items-center justify-center"
        >Min side</a
      >
    </li>
    <li>
      <a
        href="/kryss"
        class="bg-blue-100 text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-blue-100 transition flex items-center justify-center"
        >Kryss</a
      >
    </li>
    <li>
      <a
        href="/blue"
        class="bg-blue-100 text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-blue-100 transition flex items-center justify-center"
        >Hall of Fame</a
      >
    </li>
    {#if showAdminButton}
    <li>
      <a
        href="/admin"
        class="bg-blue-100 text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-blue-100 transition flex items-center justify-center"
        >Admin</a
      >
    </li>
    {/if}
  </ul>
</nav>