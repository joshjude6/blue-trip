<!-- src/lib/components/Header.svelte -->
<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { auth, db } from '$lib/api/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';

  // List of “blå” in various languages:
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

  // Reactive index and current word:
  let index = 0;
  let currentWord = translations[index];

  // Cycle through every 1 second (1000ms):
  onMount(() => {
    const interval = setInterval(() => {
      index = (index + 1) % translations.length;
      currentWord = translations[index];
    }, 1000);

    // Clean up when component unmounts:
    return () => clearInterval(interval);
  });

  let userName = '';
  onMount(() => {
    // subscribe to Firebase Auth state
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        // fetch that user’s profile doc from Firestore
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) userName = snap.data().fornavn;
      } else {
        userName = '';
      }
    });
    return () => unsub();
  });
</script>

<h1 class="text-center text-3xl font-bold mt-8">
  klar for <span class="text-blue-400 transition-colors duration-300">{currentWord}</span>tur, {userName}?
</h1>

<style>

</style>
