<script>
  let isOpen = false;
</script>

<nav class="bg-blue-600 text-white p-4 shadow-md">
  <div class="container mx-auto flex items-center justify-between">
    <a href="/" class="text-xl font-bold">BlueTrip</a>
    
    <!-- Mobile menu button -->
    <button
      class="md:hidden focus:outline-none"
      on:click={() => (isOpen = !isOpen)}
      aria-label="Toggle menu"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"
        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>

    <!-- Navigation links -->
    <ul
      class={`md:flex md:space-x-4 md:static absolute left-0 top-full w-full md:w-auto bg-blue-600 md:bg-transparent transition-all duration-300 ease-in-out ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <li><a href="/" class="block px-4 py-2 rounded-xl hover:bg-blue-700">Hjem</a></li>
      <li><a href="/login" class="block px-4 py-2 rounded-xl hover:bg-blue-700">Logg inn</a></li>
      <li><a href="/user" class="block px-4 py-2 rounded-xl hover:bg-blue-700">Min side</a></li>
      <li><a href="/kryss" class="block px-4 py-2 rounded-xl hover:bg-blue-700">Kryss</a></li>
      <li><a href="/hint" class="block px-4 py-2 rounded-xl hover:bg-blue-700">Hint</a></li>
      <li><a href="/admin" class="block px-4 py-2 rounded-xl hover:bg-blue-700">Admin</a></li>
    </ul>
  </div>
</nav>
