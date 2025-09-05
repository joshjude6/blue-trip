<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { collection, getDocs } from "firebase/firestore";

    let map: any;
    let mapContainer: HTMLDivElement;
    let allPins: Array<{
        id: string;
        name: string;
        lat: number;
        lng: number;
        timestamp: any;
    }> = [];
    let loading = true;
    let error: string | null = null;

    // Colors for different users
    const pinColors = [
        '#ef4444', // red
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // yellow
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f97316', // orange
        '#6366f1'  // indigo
    ];

    async function fetchAllPins() {
        try {
            loading = true;
            error = null;
            
            const querySnapshot = await getDocs(collection(db, 'users'));
            allPins = [];
            
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.mapPin && userData.mapPin.lat && userData.mapPin.lng) {
                    allPins.push({
                        id: doc.id,
                        name: userData.fornavn || 'Ukjent',
                        lat: userData.mapPin.lat,
                        lng: userData.mapPin.lng,
                        timestamp: userData.mapPin.timestamp
                    });
                }
            });
            
            console.log("All pins fetched:", allPins);
        } catch (err) {
            console.error("Error fetching pins:", err);
            error = "Kunne ikke laste pins";
        } finally {
            loading = false;
        }
    }

    function createColoredPinIcon(color: string, initial: string): string {
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${color}" stroke="#000" stroke-width="1"/>
                <circle cx="12.5" cy="12.5" r="8" fill="white"/>
                <text x="12.5" y="17" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${initial}</text>
            </svg>
        `)}`;
    }

    async function displayPinsOnMap() {
        if (!map || loading) return;

        // Clear existing markers
        map.eachLayer((layer: any) => {
            if (layer.options && layer.options.isPinMarker) {
                map.removeLayer(layer);
            }
        });

        // Add markers for each pin
        allPins.forEach((pin, index) => {
            const L = window.L;
            if (!L || !L.marker) return;

            const color = pinColors[index % pinColors.length];
            const initial = pin.name.charAt(0).toUpperCase();
            
            const customIcon = L.icon({
                iconUrl: createColoredPinIcon(color, initial),
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
            });

            const marker = L.marker([pin.lat, pin.lng], {
                icon: customIcon,
                isPinMarker: true
            }).addTo(map);

            const timestamp = pin.timestamp ? 
                new Date(pin.timestamp.seconds * 1000 || pin.timestamp).toLocaleDateString('no-NO') : 
                'Ukjent dato';
            
            marker.bindPopup(`
                <div style="text-align: center; min-width: 150px; font-family: 'kalmansk';">
                    <strong style="color: ${color};">${pin.name}'s gjett</strong><br>
                    <small>📅 ${timestamp}</small><br>
                    <small>📍 ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}</small>
                </div>
            `);
        });
    }

    onMount(async () => {
        // Load Leaflet dynamically
        let retries = 0;
        while (!window.L && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.L) {
            console.error('Leaflet failed to load');
            return;
        }
        
        const L = window.L;
        
        // Initialize map
        map = L.map(mapContainer, {
            center: [54.5, 15.0],
            zoom: 4,
            minZoom: 2,
            maxZoom: 10,
            worldCopyJump: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 10
        }).addTo(map);

        // Fetch and display pins
        await fetchAllPins();
        await displayPinsOnMap();
    });

    // Reactive statement to update map when pins change
    $: if (map && !loading) {
        displayPinsOnMap();
    }

    // Export refresh function
    export function refresh() {
        fetchAllPins();
    }
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🗺️ Hvor trodde dere vi skulle?</h2>
        <button 
            on:click={fetchAllPins}
            disabled={loading}
            class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-base"
        >
            {loading ? 'Laster...' : 'Oppdater'} 🔄
        </button>
    </div>

    {#if error}
        <div class="mb-4 p-4 bg-red-100 text-black rounded font-kalmansk text-base">
            {error}
            <button 
                on:click={fetchAllPins}
                class="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
                Prøv igjen
            </button>
        </div>
    {/if}

    {#if allPins.length > 0}
        <div class="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 class="font-saotorpes font-semibold text-blue-600 mb-2 text-base">
                Gjett på kartet ({allPins.length}):
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {#each allPins as pin, index}
                    <div class="flex items-center space-x-2">
                        <div 
                            class="w-4 h-4 rounded-full border border-gray-400 flex-shrink-0"
                            style="background-color: {pinColors[index % pinColors.length]};"
                        ></div>
                        <span class="font-kalmansk text-black text-lg truncate">
                            {pin.name} {#if pin.name === 'Martin'}👑 - Nærmest gjett!{/if} {#if pin.name === 'Tora'}🥈 - naila det før hun bytta 👎{/if}
                        </span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    
    <div 
        bind:this={mapContainer} 
        class="w-full h-64 sm:h-96 lg:h-[500px] rounded-lg border-2 border-gray-300 mb-4"
        style="min-height: 350px;"
    ></div>

    {#if loading}
        <div class="text-center text-black font-kalmansk text-base">
            Laster gjetninger... 🔄
        </div>
    {:else if allPins.length === 0}
        <div class="text-center text-black font-kalmansk text-base">
            Ingen har plassert pins ennå! Vær den første! 📍
        </div>
    {:else}
        <div class="text-center text-black text-base font-kalmansk">
            {allPins.length} gjett på kartet.
        </div>
    {/if}
</div>