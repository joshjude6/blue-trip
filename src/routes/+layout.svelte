<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Nav from '$lib/components/Nav.svelte';
</script>

<main class="flex flex-col items-center px-4">
  <Header />
  <Nav />
  <slot />
</main>
