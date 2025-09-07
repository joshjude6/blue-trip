<!-- src/lib/components/Header.svelte -->
<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { auth, db } from '$lib/api/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';

  const translations = [
  'siste',
  'last',        // English
  'letzte',      // German
  'último',      // Spanish
  'dernier',     // French
  '最後',          // Japanese (saigo)
  '마지막',        // Korean (majimak)
  'poslední',    // Czech
  'viimeinen',   // Finnish
  'zadnji',      // Croatian/Slovenian
  'utolsó',      // Hungarian
  'son',         // Turkish
  '最后',          // Chinese (zuìhòu)
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



<div class="w-full text-center flex justify-center pt-8">
  <h1 class="text-5xl text-center font-saotorpes">klar for ditt <span class="text-blue-600 font-bold transition-colors duration-300">{currentWord}</span> år{#if userName}, {userName}{/if}?</h1>
</div>

<style>

</style>
