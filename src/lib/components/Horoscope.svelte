<!-- src/lib/components/Header.svelte -->
<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { auth, db } from '$lib/api/firebase.js';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc, setDoc } from 'firebase/firestore';

  const translations = [
    'rizz', 'gyatt', 'crash out', 'pink pilates', 'main character', 'badminton', 
    'sunglasses', 'break up', 'beach', 'baddie', 'grwm', 'delulu', 'vibe check', 
    'situationship', 'alpha moves', 'sigma grindset', 'girl dinner', 'skibidi', 
    'fanum tax', 'core memory', 'outside', 'hot girl walk', 'coquette', 'based', 
    'stan mode', 'side quest', 'npc energy', 'clean aesthetic', 'boy math', 
    'girl math', 'clout chase', 'late night scroll', 'soft launch', 'gatekeep', 
    'slay', 'no cap', 'fit check', 'main quest', 'low-key', 'high-key', 
    'mood board', 'playlist energy', 'glow up', 'preppy vibe', 'emo night', 
    'hard launch', 'thrift haul', 'romcom core', 'cottagecore', 'goblin mode', 
    'dark academia', 'light academia', 'that girl', 'sad boi hours', 'manifesting', 
    'soft girl', 'e-boy energy', 'e-girl vibes', 'scandi minimal', '2000s throwback', 
    'villain era', 'it girl', 'main feed', 'fyp', 'aesthetic dump', 
    'fake deep', 'chronically online', 'simp mode', 'out of pocket', 'rent free', 
    'hard launch breakup', 'red flag', 'green flag', 'golden hour', 'photo dump', 
    'deinfluenced', 'under the influence', 'beta test era', 'glitch in the matrix', 
    'phone eats first', 'revenge dress', 'soft life', 'hot mess', 'doomscrolling', 
    'low effort slay', 'quiet luxury', 'core core', 'internet boyfriend', 
    'internet girlfriend', 'blurred flash', 'smoke sesh', 'early 2010s tumblr', 
    'late night facetime', 'rebrand season', 'afterparty', 'couch locked', 
    'playlist main character', 'pre-game', 'bottle girl energy', 'beige flag', 
    'toxic situationship', 'girlboss', 'feral girl summer'
  ];

  let userName = '';
  let userVibes = [';)', ':D', ':P'];
  let currentVibeIndex = 0;
  let displayWord = userVibes[currentVibeIndex];

  // Generate a seed based on user ID and current 4-hour period
  function generateTimeSeed() {
    const now = new Date();
    const hoursPassed = Math.floor(now.getTime() / (1000 * 60 * 60)); // Hours since epoch
    const period = Math.floor(hoursPassed / 4); // 4-hour periods since epoch
    return period;
  }

  // Generate a deterministic random number from a seed
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Generate 3 unique random words for a user based on their ID and time period
  function generateUserVibes(userId) {
    const timeSeed = generateTimeSeed();
    
    // Create a more unique user seed by combining multiple factors
    const userSeed = userId.split('').reduce((acc, char, index) => {
      return acc + char.charCodeAt(0) * (index + 1) * 37; // Multiply by position and prime number
    }, 0);
    
    // Add more entropy by using different prime multipliers
    const combinedSeed = (userSeed * 1009) + (timeSeed * 2003) + 4001;

    const selectedWords = [];
    const availableIndices = [...Array(translations.length).keys()];

    for (let i = 0; i < 3; i++) {
      // Use different large prime numbers for each word selection
      const wordSeed = combinedSeed + (i * 9973) + (userSeed * (i + 1) * 7919);
      const randomValue = seededRandom(wordSeed);
      const randomIndex = Math.floor(randomValue * availableIndices.length);
      const wordIndex = availableIndices.splice(randomIndex, 1)[0];
      selectedWords.push(translations[wordIndex]);
    }

    return selectedWords;
  }

  // Check if user's vibes need updating (every 4 hours)
  async function checkAndUpdateUserVibes(userId) {
    try {
      const userVibesDoc = await getDoc(doc(db, 'userVibes', userId));
      const currentTimeSeed = generateTimeSeed();
      
      if (userVibesDoc.exists()) {
        const data = userVibesDoc.data();
        
        // If the time period has changed, generate new vibes
        if (data.timeSeed !== currentTimeSeed) {
          const newVibes = generateUserVibes(userId);
          await setDoc(doc(db, 'userVibes', userId), {
            vibes: newVibes,
            timeSeed: currentTimeSeed,
            lastUpdated: new Date()
          });
          return newVibes;
        } else {
          // Return existing vibes
          return data.vibes || generateUserVibes(userId);
        }
      } else {
        // First time - generate and store new vibes
        const newVibes = generateUserVibes(userId);
        await setDoc(doc(db, 'userVibes', userId), {
          vibes: newVibes,
          timeSeed: currentTimeSeed,
          lastUpdated: new Date()
        });
        return newVibes;
      }
    } catch (error) {
      console.error('Error managing user vibes:', error);
      // Fallback to deterministic generation
      return generateUserVibes(userId);
    }
  }

  onMount(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            userName = snap.data().fornavn || 'Unknown';
          }
          
          // Get user's personalized vibes
          userVibes = await checkAndUpdateUserVibes(user.uid);
        } catch (error) {
          console.error('Error loading user data:', error);
          userName = 'Unknown';
          userVibes = ['loading', 'your', 'vibe'];
        }
      } else {
        userName = '';
        userVibes = ['guest', 'mode', 'vibes'];
      }
    });

    // Cycle through the 3 words every 2 seconds
    const vibeInterval = setInterval(() => {
      currentVibeIndex = (currentVibeIndex + 1) % userVibes.length;
      displayWord = userVibes[currentVibeIndex];
    }, 2000);

    return () => {
      unsub();
      clearInterval(vibeInterval);
    };
  });

  // Reactive statement to update display word when userVibes changes
  $: if (userVibes.length > 0) {
    displayWord = userVibes[currentVibeIndex];
  }
</script>

<div class="w-full max-w-3xl mx-auto text-center justify-center mt-8">
  <h3 class="text-2xl text-center font-saotorpes">
    {userName ? `${userName}, ` : ''} dette blir en  
  </h3>
  <span class="text-4xl text-blue-600 font-bold transition-colors duration-300 font-saotorpes">{userVibes.join(', ')}</span>
  <h3 class="text-2xl text-center font-saotorpes"> 
     type dag for deg.
  </h3>
  <h3 class="text-xl text-center font-kalmansk">
    Ikke fornøyd med hvordan dagen din ser ut? Om noen timer endres alt, men husk at du har mest kontroll over din egen skjebne.
  </h3>
</div>

<style>
</style>