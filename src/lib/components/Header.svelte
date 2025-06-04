<!-- src/lib/components/Header.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

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
</script>

<h1 class="text-center text-3xl font-bold mt-8">
  klar for <span class="text-blue-400 transition-colors duration-300">{currentWord}</span>tur?
</h1>

<style>

</style>
