<script>
    import { onMount } from 'svelte';
    
    const travelDate = new Date('2025-08-30T12:00:00');
    let timeLeft = ''; // Declare at component level
    
    function updateCountdown() {
        const now = new Date();
        const diff = travelDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            timeLeft = 'Blåtur er her!';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        timeLeft = `${days}D ${hours}T ${minutes}M ${seconds}S`;
    }

    onMount(() => {
        updateCountdown(); // Initial call
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    });
</script>

<div class="w-full text-center flex justify-center mt-8">
  <h2 class="text-3xl font-saotorpes text-center">
    <span class="text-blue-600 font-bold">{timeLeft}</span>
  </h2>
</div>