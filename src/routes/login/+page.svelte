<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import { loginUser, registerUser, onAuthChange, logoutUser } from "$lib/api/auth.js";
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
</script>

<main class="max-w-md mx-auto p-6 space-y-6">
  <!-- Login form -->
  <section class="border p-4 rounded space-y-2">
    {#if loginError}
      <div class="text-red-600">{loginError}</div>
    {/if}
    <input type="email" bind:value={email} placeholder="Email" class="w-full border p-2 rounded" />
    <input type="password" bind:value={password} placeholder="Passord" class="w-full border p-2 rounded" />
    <button on:click={handleLogin} class="w-full bg-blue-600 text-white p-2 rounded">
      Logg inn
    </button>
  </section>

  <!-- Register form -->
  <section class="border p-4 rounded space-y-2">
    {#if regError}
      <div class="text-red-600">{regError}</div>
    {/if}
    <input type="text" bind:value={firstName} placeholder="Fornavn" class="w-full border p-2 rounded" />
    <input type="text" bind:value={lastName} placeholder="Etternavn" class="w-full border p-2 rounded" />
    <input type="email" bind:value={regEmail} placeholder="Email" class="w-full border p-2 rounded" />
    <input type="password" bind:value={regPassword} placeholder="Passord" class="w-full border p-2 rounded" />
    <input type="password" bind:value={regConfirmPassword} placeholder="Bekreft passord" class="w-full border p-2 rounded" />
    <button on:click={handleRegister} class="w-full bg-green-600 text-white p-2 rounded">
      Registrer bruker
    </button>
  </section>

  {#if currentUser}
    <!-- Logout button visible when user is signed in -->
    <section class="text-center">
      <button on:click={handleLogout} class="bg-red-600 text-white p-2 rounded">
        Logg ut
      </button>
    </section>
  {/if}
</main>
