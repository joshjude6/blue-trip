<!-- src/lib/components/Header.svelte -->
<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { auth, db } from '$lib/api/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';

  const translations = [
    'blå',      // Norwegian
    'blue',     // English
    'blau',     // German
    'azul',     // Spanish / Portuguese
    'modrá',    // Czech / Slovak
    'sininen',  // Finnish
    'plava',    // Croatian / Serbian
    'kék',      // Hungarian
    'zils',     // Latvian
    'mavi'      // Turkish
  ];

  let index = 0;
  let currentWord = translations[index];

  onMount(() => {
    const interval = setInterval(() => {
      index = (index + 1) % translations.length;
      currentWord = translations[index];
    }, 1000);
    return () => clearInterval(interval);
  });

  let userName = '';
  onMount(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) userName = snap.data().fornavn;
      } else {
        userName = '';
      }
    });
    return () => unsub();
  });
</script>



<div class="w-full text-center flex justify-center mt-8">
  <h1 class="text-5xl text-center font-saotorpes">klar for <span class="text-blue-600 font-bold transition-colors duration-300">{currentWord}</span>tur{#if userName}, {userName}{/if}?</h1>
</div>

<style>

</style>
