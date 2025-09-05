<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import { loginUser, registerUser, onAuthChange, logoutUser } from "$lib/api/auth.js";
  import { sendPasswordResetEmail } from "firebase/auth";
  import { auth } from "$lib/api/firebase.js"; // You'll need to import auth from your firebase config
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let loginError = "";

  let firstName = "";
  let lastName = "";
  let regEmail = "";
  let regPassword = "";
  let regConfirmPassword = "";
  let regError = "";

  let resetEmail = "";
  let resetError = "";
  let resetSuccess = "";
  let showResetForm = false;
  let resetLoading = false;

  let currentUser = null;
  onMount(() => {
    const unsub = onAuthChange((user) => {
      currentUser = user;
    });
    return () => unsub();
  });

  async function handleLogin() {
    loginError = "";
    try {
      await loginUser(email, password);
      goto("/user");
    } catch (err) {
      loginError = "Login mislyktes.";
    }
  }

  async function handleRegister() {
    regError = "";
    if (regPassword !== regConfirmPassword) {
      regError = "Passordene stemmer ikke overens.";
      return;
    }
    try {
      await registerUser({ firstName, lastName, email: regEmail, password: regPassword });
      goto("/user");
      console.log("Bruker registrert!")
    } catch (err) {
      regError = "Registrering mislyktes.";
      console.error('Firebase signup error', err.code, err.message);
      regError = err.message;
    }
  }

  async function handleLogout() {
    await logoutUser();
    alert("Logget ut!");
  }

  async function handlePasswordReset() {
    resetError = "";
    resetSuccess = "";
    
    if (!resetEmail.trim()) {
      resetError = "Vennligst skriv inn e-postadressen din.";
      return;
    }

    resetLoading = true;
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      resetSuccess = "Passord-reset e-post sendt! Sjekk innboksen din.";
      resetEmail = "";
      // Hide the form after 3 seconds
      setTimeout(() => {
        showResetForm = false;
        resetSuccess = "";
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error.code === 'auth/user-not-found') {
        resetError = "Ingen bruker funnet med denne e-postadressen.";
      } else if (error.code === 'auth/invalid-email') {
        resetError = "Ugyldig e-postadresse.";
      } else {
        resetError = "Feil ved sending av reset-e-post. Prøv igjen.";
      }
    } finally {
      resetLoading = false;
    }
  }

  function showResetPassword() {
    showResetForm = true;
    resetError = "";
    resetSuccess = "";
    resetEmail = email; // Pre-fill with login email if available
  }

  function hideResetForm() {
    showResetForm = false;
    resetError = "";
    resetSuccess = "";
    resetEmail = "";
  }
</script>

<main class="max-w-md mx-auto p-6 space-y-6 font-kalmansk text-3xl">
  <!-- Login form -->
  <section class="border p-4 rounded space-y-2">
    <h2 class="text-xl font-bold mb-4">Logg inn</h2>
    {#if loginError}
      <div class="text-red-600 text-base">{loginError}</div>
    {/if}
    <input type="email" bind:value={email} placeholder="Email" class="w-full border p-2 rounded text-base" />
    <input type="password" bind:value={password} placeholder="Passord" class="w-full border p-2 rounded text-base" />
    <button on:click={handleLogin} class="w-full bg-blue-600 text-white p-2 rounded text-base">
      Logg inn
    </button>
    
    <!-- Forgot Password Link -->
    <div class="text-center mt-2">
      <button 
        on:click={showResetPassword}
        class="text-blue-600 hover:text-blue-800 underline text-sm"
      >
        Glemt passord?
      </button>
    </div>
  </section>

  <!-- Password Reset Form -->
  {#if showResetForm}
    <section class="border border-orange-300 p-4 rounded space-y-2 bg-orange-50">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-bold">Tilbakestill passord</h2>
        <button 
          on:click={hideResetForm}
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>
      
      {#if resetError}
        <div class="text-red-600 text-base">{resetError}</div>
      {/if}
      
      {#if resetSuccess}
        <div class="text-green-600 text-base">{resetSuccess}</div>
      {/if}
      
      <p class="text-sm text-gray-600">
        Skriv inn e-postadressen din, så sendes du en lenke for å tilbakestille passordet. Husk å sjekke søppelpost!
      </p>
      
      <input 
        type="email" 
        bind:value={resetEmail} 
        placeholder="Din e-postadresse" 
        class="w-full border p-2 rounded text-base"
        disabled={resetLoading}
      />
      
      <div class="flex gap-2">
        <button 
          on:click={handlePasswordReset}
          disabled={resetLoading || !resetEmail.trim()}
          class="flex-1 bg-orange-600 text-white p-2 rounded text-base hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {resetLoading ? 'Sender...' : 'Send reset-lenke'}
        </button>
        <button 
          on:click={hideResetForm}
          disabled={resetLoading}
          class="px-4 bg-gray-600 text-white p-2 rounded text-base hover:bg-gray-700"
        >
          Avbryt
        </button>
      </div>
    </section>
  {/if}

  <!-- Register form -->
  <section class="border p-4 rounded space-y-2">
    <h2 class="text-xl font-bold mb-4">Registrer ny bruker</h2>
    {#if regError}
      <div class="text-red-600 text-base">{regError}</div>
    {/if}
    <input type="text" bind:value={firstName} placeholder="Fornavn" class="w-full border p-2 rounded text-base" />
    <input type="text" bind:value={lastName} placeholder="Etternavn" class="w-full border p-2 rounded text-base" />
    <input type="email" bind:value={regEmail} placeholder="Email" class="w-full border p-2 rounded text-base" />
    <input type="password" bind:value={regPassword} placeholder="Passord" class="w-full border p-2 rounded text-base" />
    <input type="password" bind:value={regConfirmPassword} placeholder="Bekreft passord" class="w-full border p-2 rounded text-base" />
    <button on:click={handleRegister} class="w-full bg-green-600 text-white p-2 rounded text-base">
      Registrer bruker
    </button>
  </section>

  {#if currentUser}
    <!-- Logout button visible when user is signed in -->
    <section class="text-center">
      <button on:click={handleLogout} class="bg-red-600 text-white p-2 rounded text-base">
        Logg ut
      </button>
    </section>
  {/if}
</main>