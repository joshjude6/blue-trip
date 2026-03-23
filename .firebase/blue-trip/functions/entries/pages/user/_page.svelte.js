import "clsx";
import { K as bind_props, v as pop, t as push, z as attr, w as escape_html } from "../../../chunks/index2.js";
import { a as auth, s as storage } from "../../../chunks/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
function DrinkTracker($$payload, $$props) {
  push();
  async function fetchUserData() {
    return;
  }
  function refresh() {
    fetchUserData();
  }
  $$payload.out.push(`<div class="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">� Drikketeller</h2> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Laster...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { refresh });
  pop();
}
function Profilepic($$payload, $$props) {
  push();
  let user;
  let profileUrl = "";
  let uploading = false;
  onAuthStateChanged(auth, async (_user) => {
    if (_user) {
      user = _user;
      try {
        const imageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        profileUrl = await getDownloadURL(imageRef);
      } catch (e) {
        profileUrl = "";
      }
    }
  });
  $$payload.out.push(`<div class="flex flex-col items-center gap-4 my-8"><div class="w-40 h-40 rounded-full bg-gray-100 shadow-inner overflow-hidden flex items-center justify-center text-gray-400 text-3xl">`);
  if (profileUrl) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<img${attr("src", profileUrl)} alt="Profilbilde" class="object-cover w-full h-full"/>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`?`);
  }
  $$payload.out.push(`<!--]--></div> <input type="file" accept="image/*" id="fileInput" class="hidden"/> <label for="fileInput" class="cursor-pointer bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition font-kalmansk">Velg profilbilde</label> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow font-kalmansk"${attr("disabled", uploading, true)}>${escape_html("Last opp / Endre profilbilde")}</button></div>`);
  pop();
}
function ShowUserKryss($$payload, $$props) {
  push();
  async function fetchUserData() {
    return;
  }
  function refresh() {
    fetchUserData();
  }
  $$payload.out.push(`<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-4">❌ Dine kryss</h2> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Laster...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { refresh });
  pop();
}
function UserInfo($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-6">⚙️ Kontoinnstillinger</h2> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Laster inn...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function _page($$payload) {
  $$payload.out.push(`<div class="text-center px-4"><h1 class="text-2xl sm:text-3xl font-saotorpes font-bold text-black mb-2 mt-8">Brukerside</h1></div> <p class="font-kalmansk text-black text-base sm:text-lg leading-relaxed text-center">Her kan du se hvor mange kryss du har, registrere enheter du har drukket, og gjette hvor vi skal.</p> <div class="w-full max-w-2xl mx-auto space-y-8"><section>`);
  Profilepic($$payload);
  $$payload.out.push(`<!----></section> <section>`);
  ShowUserKryss($$payload, {});
  $$payload.out.push(`<!----></section> <section>`);
  DrinkTracker($$payload, {});
  $$payload.out.push(`<!----></section> <section>`);
  UserInfo($$payload);
  $$payload.out.push(`<!----></section></div>`);
}
export {
  _page as default
};
