<!-- src/lib/components/Header.svelte -->
<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { auth, db } from '$lib/api/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';

  const translations = [
  'drita',
  'fucked up',       
  'dicht', 
  'borracho',        
  'bourré',        
  'べろべろ',       
  '꽐라',         
  'kännissä',      
  'mrtav pijan',   
  'wstawiony',     
  'tök részeg',    
  '喝高了',     
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
  <h1 class="text-4xl text-center font-saotorpes">klar for å bli <span class="text-blue-600 font-bold transition-colors duration-300">{currentWord}</span> i Gdansk{#if userName}, {userName}{/if}?</h1>
</div>

<style>

</style>
