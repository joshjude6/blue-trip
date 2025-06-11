<script>
  //@ts-nocheck
  import { auth, storage } from '$lib/api/firebase';
  import { onAuthStateChanged } from 'firebase/auth';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

  let file;
  let user;
  let profileUrl = '';
  let uploading = false;

  onAuthStateChanged(auth, async (_user) => {
    if (_user) {
      user = _user;
      try {
        const imageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        profileUrl = await getDownloadURL(imageRef);
      } catch (e) {
        profileUrl = '';
      }
    }
  });

  const uploadProfilePicture = async () => {
    if (!file || !user) return;
    uploading = true;
    const imageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
    await uploadBytes(imageRef, file);
    profileUrl = await getDownloadURL(imageRef);
    uploading = false;
  };

  function handleFileSelect(e) {
    file = e.target.files[0];
  }
</script>

<div class="flex flex-col items-center gap-4 my-8">
  <div class="w-40 h-40 rounded-full bg-gray-100 shadow-inner overflow-hidden flex items-center justify-center text-gray-400 text-3xl">
    {#if profileUrl}
      <img src={profileUrl} alt="Profilbilde" class="object-cover w-full h-full" />
    {:else}
      ?
    {/if}
  </div>

  <input
    type="file"
    accept="image/*"
    id="fileInput"
    class="hidden"
    on:change={handleFileSelect}
  />

  <label
    for="fileInput"
    class="cursor-pointer bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition font-kalmansk"
  >
    Velg profilbilde
  </label>

  {#if file}
    <p class="text-sm text-gray-600 font-kalmansk">{file.name}</p>
  {/if}

  <button
    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow font-kalmansk"
    on:click={uploadProfilePicture}
    disabled={uploading}
  >
    {uploading ? 'Laster opp...' : 'Last opp / Endre profilbilde'}
  </button>
</div>
