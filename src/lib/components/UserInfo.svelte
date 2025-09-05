<script lang="ts">
    import { onMount } from 'svelte';
    import { onAuthChange } from '$lib/api/auth.js';
    import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

    let currentUser: any = null;
    let authLoading = true;
    let loading = false;
    let message = '';
    let showEmailForm = false;
    let showPasswordForm = false;

    // Email change form
    let newEmail = '';
    let confirmPassword = '';

    // Password change form
    let currentPassword = '';
    let newPassword = '';
    let confirmNewPassword = '';

    onMount(() => {
        const unsubscribe = onAuthChange((user: any) => {
            currentUser = user;
            authLoading = false;
            if (user) {
                newEmail = user.email || '';
            }
        });

        return () => unsubscribe();
    });

    async function changeEmail() {
        if (!currentUser || !newEmail.trim() || !confirmPassword.trim()) {
            message = 'Vennligst fyll ut alle felt.';
            return;
        }

        if (newEmail === currentUser.email) {
            message = 'Den nye e-postadressen er den samme som den nåværende.';
            return;
        }

        loading = true;
        message = '';

        try {
            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(currentUser.email, confirmPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Update email
            await updateEmail(currentUser, newEmail);

            message = 'E-postadresse oppdatert! Du må kanskje logge inn på nytt.';
            showEmailForm = false;
            confirmPassword = '';

        } catch (error: any) {
            console.error('Error updating email:', error);
            
            if (error.code === 'auth/wrong-password') {
                message = 'Feil passord.';
            } else if (error.code === 'auth/email-already-in-use') {
                message = 'E-postadressen er allerede i bruk.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Ugyldig e-postadresse.';
            } else {
                message = 'Feil ved oppdatering av e-post. Prøv igjen.';
            }
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    async function changePassword() {
        if (!currentUser || !currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            message = 'Vennligst fyll ut alle felt.';
            return;
        }

        if (newPassword !== confirmNewPassword) {
            message = 'De nye passordene matcher ikke.';
            return;
        }

        if (newPassword.length < 6) {
            message = 'Nytt passord må være minst 6 tegn.';
            return;
        }

        if (newPassword === currentPassword) {
            message = 'Det nye passordet må være forskjellig fra det nåværende.';
            return;
        }

        loading = true;
        message = '';

        try {
            // Re-authenticate user first
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);

            message = 'Passord oppdatert!';
            showPasswordForm = false;
            currentPassword = '';
            newPassword = '';
            confirmNewPassword = '';

        } catch (error: any) {
            console.error('Error updating password:', error);
            
            if (error.code === 'auth/wrong-password') {
                message = 'Feil nåværende passord.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Passordet er for svakt.';
            } else {
                message = 'Feil ved oppdatering av passord. Prøv igjen.';
            }
        } finally {
            loading = false;
            setTimeout(() => message = '', 5000);
        }
    }

    function cancelEmailChange() {
        showEmailForm = false;
        newEmail = currentUser?.email || '';
        confirmPassword = '';
        message = '';
    }

    function cancelPasswordChange() {
        showPasswordForm = false;
        currentPassword = '';
        newPassword = '';
        confirmNewPassword = '';
        message = '';
    }
</script>

<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6">
    <h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-6">⚙️ Kontoinnstillinger</h2>

    {#if authLoading}
        <div class="text-center py-6">
            <div class="animate-pulse font-kalmansk text-black text-base">Laster inn...</div>
        </div>
    {:else if !currentUser}
        <div class="text-center py-6">
            <p class="font-kalmansk text-black text-base sm:text-lg">Du må være logget inn for å endre kontoinnstillinger!</p>
        </div>
    {:else}
        <div class="space-y-6">
            <!-- Current Account Info -->
            <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-saotorpes text-lg text-black mb-2">Nåværende kontoinformasjon</h3>
                <div class="space-y-2">
                    <div class="flex flex-col sm:flex-row sm:items-center">
                        <span class="font-kalmansk font-semibold text-black text-base w-32">E-post:</span>
                        <span class="font-kalmansk text-black text-base">{currentUser.email}</span>
                    </div>
                </div>
            </div>

            <!-- Email Change Section -->
            <div class="border border-blue-200 rounded-lg p-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h3 class="font-saotorpes text-lg text-black">Endre e-postadresse</h3>
                        <p class="font-kalmansk text-gray-600 text-sm">Oppdater e-postadressen knyttet til kontoen din</p>
                    </div>
                    {#if !showEmailForm}
                        <button 
                            on:click={() => showEmailForm = true}
                            class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 transition-colors text-base"
                        >
                            Endre e-post
                        </button>
                    {/if}
                </div>

                {#if showEmailForm}
                    <div class="space-y-4">
                        <div>
                            <label for="newEmail" class="block text-base font-kalmansk font-semibold text-black mb-2">
                                Ny e-postadresse
                            </label>
                            <input 
                                id="newEmail"
                                type="email"
                                bind:value={newEmail}
                                class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label for="confirmPasswordEmail" class="block text-base font-kalmansk font-semibold text-black mb-2">
                                Bekreft nåværende passord
                            </label>
                            <input 
                                id="confirmPasswordEmail"
                                type="password"
                                bind:value={confirmPassword}
                                placeholder="Skriv inn ditt nåværende passord"
                                class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                required
                            />
                        </div>
                        <div class="flex gap-2">
                            <button 
                                on:click={changeEmail}
                                disabled={loading || !newEmail.trim() || !confirmPassword.trim()}
                                class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base"
                            >
                                {loading ? 'Oppdaterer...' : 'Oppdater e-post'}
                            </button>
                            <button 
                                on:click={cancelEmailChange}
                                disabled={loading}
                                class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded-lg hover:bg-gray-700 transition-colors text-base"
                            >
                                Avbryt
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Password Change Section -->
            <div class="border border-green-200 rounded-lg p-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h3 class="font-saotorpes text-lg text-black">Endre passord</h3>
                        <p class="font-kalmansk text-gray-600 text-sm">Oppdater passordet ditt for bedre sikkerhet</p>
                    </div>
                    {#if !showPasswordForm}
                        <button 
                            on:click={() => showPasswordForm = true}
                            class="px-4 py-2 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 transition-colors text-base"
                        >
                            Endre passord
                        </button>
                    {/if}
                </div>

                {#if showPasswordForm}
                    <div class="space-y-4">
                        <div>
                            <label for="currentPassword" class="block text-base font-kalmansk font-semibold text-black mb-2">
                                Nåværende passord
                            </label>
                            <input 
                                id="currentPassword"
                                type="password"
                                bind:value={currentPassword}
                                placeholder="Skriv inn ditt nåværende passord"
                                class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label for="newPassword" class="block text-base font-kalmansk font-semibold text-black mb-2">
                                Nytt passord
                            </label>
                            <input 
                                id="newPassword"
                                type="password"
                                bind:value={newPassword}
                                placeholder="Minimum 6 tegn"
                                class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label for="confirmNewPassword" class="block text-base font-kalmansk font-semibold text-black mb-2">
                                Bekreft nytt passord
                            </label>
                            <input 
                                id="confirmNewPassword"
                                type="password"
                                bind:value={confirmNewPassword}
                                placeholder="Gjenta det nye passordet"
                                class="w-full p-3 border border-gray-300 rounded-lg font-kalmansk text-base focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                required
                            />
                        </div>
                        <div class="flex gap-2">
                            <button 
                                on:click={changePassword}
                                disabled={loading || !currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()}
                                class="px-4 py-2 bg-green-600 text-white font-kalmansk rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base"
                            >
                                {loading ? 'Oppdaterer...' : 'Oppdater passord'}
                            </button>
                            <button 
                                on:click={cancelPasswordChange}
                                disabled={loading}
                                class="px-4 py-2 bg-gray-600 text-white font-kalmansk rounded-lg hover:bg-gray-700 transition-colors text-base"
                            >
                                Avbryt
                            </button>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Status Message -->
            {#if message}
                <div class="p-3 rounded-lg {message.includes('oppdatert') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-kalmansk text-base">
                    {message}
                </div>
            {/if}
        </div>
    {/if}
</div>