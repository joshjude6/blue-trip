<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Nav from '$lib/components/Nav.svelte';
</script>
<div class="bg-blue-200">
  <Header />
  <Nav />
</div>
<main class="flex flex-col items-center px-4">
  <slot />
</main>
