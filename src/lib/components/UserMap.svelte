<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/api/firebase.js';
    import { onAuthChange } from '$lib/api/auth.js';
    import { doc, updateDoc, getDoc } from "firebase/firestore";

    

    let map: any;
    let userMarker: any = null;
    let mapContainer: HTMLDivElement;
    let currentUser: any = null;
    let loading = false;
    let message = '';
    let authLoading = true;
    let currentPin: { lat: number; lng: number } | null = null;

    // World bounds for the map
    const worldBounds: [[number, number], [number, number]] = [
        [85, -180], // North-West
        [-85, 180]  // South-East
    ];

    

    onMount(() => {
        const unsubscribe = onAuthChange((user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                loadExistingPin();
                initializeMap();
            }
        });

        return () => unsubscribe();
    });

    async function loadExistingPin() {
        if (!currentUser?.uid) return;
        
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.mapPin && userData.mapPin.lat && userData.mapPin.lng) {
                    currentPin = userData.mapPin;
                }
            }
        } catch (error) {
            console.error("Error loading existing pin:", error);
        }
    }

    async function initializeMap() {
        let containerRetries = 0;
        while (!mapContainer && containerRetries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            containerRetries++;
        }
        
        if (!mapContainer) {
            console.error('Map container element not found');
            return;
        }

        // Wait for Leaflet to load
        let leafletRetries = 0;
        while (!window.L && leafletRetries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            leafletRetries++;
        }
        
        if (!window.L) {
            console.error('Leaflet failed to load');
            return;
        }
        
        console.log('Both container and Leaflet ready!');
        
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

        // Add click handler for placing pins
        map.on('click', function(e: any) {
            if (!currentUser) {
                message = 'Du må være logget inn for å plassere en pin!';
                setTimeout(() => message = '', 3000);
                return;
            }

            const { lat, lng } = e.latlng;
            placePin(lat, lng);
        });

        // If user has existing pin, add it to map
        if (currentPin) {
            placePin(currentPin.lat, currentPin.lng, false);
        }
    }

    function placePin(lat: number, lng: number, isNewPin = true) {
        if (!map) return;

        const L = window.L || {};
        if (!L.marker) return;

        // Remove existing marker
        if (userMarker) {
            map.removeLayer(userMarker);
        }

        // Add new marker
        userMarker = L.marker([lat, lng], {
            draggable: true
        }).addTo(map);

        // Add popup
        userMarker.bindPopup(`
            <div style="text-align: center; font-family: 'kalmansk'; min-width: 120px;">
                <strong>📍 Din gjetning</strong><br>
                <small>Lat: ${lat.toFixed(4)}</small><br>
                <small>Lng: ${lng.toFixed(4)}</small><br>
                <button onclick="window.savePin()" style="margin-top: 8px; padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'kalmansk';">
                    ${currentPin ? 'Oppdater' : 'Lagre'}
                </button>
            </div>
        `).openPopup();

        // Handle marker drag
        userMarker.on('dragend', function(e: any) {
            const newPos = e.target.getLatLng();
            userMarker.getPopup().setContent(`
                <div style="text-align: center; font-family: 'kalmansk'; min-width: 120px;">
                    <strong>📍 Din gjetning</strong><br>
                    <small>Lat: ${newPos.lat.toFixed(4)}</small><br>
                    <small>Lng: ${newPos.lng.toFixed(4)}</small><br>
                    <button onclick="window.savePin()" style="margin-top: 8px; padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'kalmansk';">
                        ${currentPin ? 'Oppdater' : 'Lagre'}
                    </button>
                </div>
            `);
        });

        // Store save function globally for popup button
        window.savePin = () => {
            const pos = userMarker.getLatLng();
            savePin(pos.lat, pos.lng);
        };

        // Auto-save if this is a new pin placement
        if (isNewPin) {
            savePin(lat, lng);
        }
    }

    async function savePin(lat: number, lng: number) {
        if (!currentUser?.uid) {
            message = 'Du må være logget inn for å lagre pin!';
            return;
        }

        loading = true;
        message = '';

        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                mapPin: {
                    lat: lat,
                    lng: lng,
                    timestamp: new Date()
                }
            });

            currentPin = { lat, lng };
            message = 'Pin lagret! 📍';

        } catch (error) {
            console.error("Error saving pin:", error);
            message = 'Feil ved lagring av pin. Prøv igjen.';
        } finally {
            loading = false;
            setTimeout(() => message = '', 3000);
        }
    }
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">🗺️ Plasser din pin</h2>
    <p class="font-kalmansk text-black text-base mb-4">Klikk på kartet hvor du tror vi skal på blåtur!</p>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Laster...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base">Du må være logget inn for å plassere en pin.</p>
        </div>
    {:else}
        {#if message}
            <div class="mb-4 p-3 rounded-lg {message.includes('Feil') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-kalmansk text-base">
                {message}
            </div>
        {/if}

        {#if currentPin}
            <div class="mb-4 p-3 bg-blue-100 text-blue-600 font-kalmansk rounded text-base">
                📍 Du har plassert en pin på: {currentPin.lat.toFixed(4)}, {currentPin.lng.toFixed(4)}
            </div>
        {/if}

        <div 
            bind:this={mapContainer} 
            class="w-full h-64 sm:h-96 rounded-lg border-2 border-gray-300 mb-4"
            style="min-height: 350px;"
        ></div>

        <div class="text-center">
            <p class="font-kalmansk text-gray-600 text-base">
                Klikk hvor som helst på kartet for å plassere din pin. Du kan dra den for å justere! For å endre gjett, bare trykk et annet sted.
            </p>
        </div>
    {/if}
</div>