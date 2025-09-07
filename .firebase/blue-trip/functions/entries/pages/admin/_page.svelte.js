import "clsx";
import { v as pop, t as push } from "../../../chunks/index2.js";
import "../../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
function AdminCursedRev($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-purple-200"><div class="mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-purple-600 mb-2">🌀 Admin: Fjern cursed kryss</h2> <p class="font-kalmansk text-gray-600 text-base">Reverser effekten av cursed minus-kryss.</p></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Loading...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function AdminDeleteUser($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-red-200"><div class="mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-red-600 mb-2">🗑️ Admin: Slett Brukere</h2> <p class="font-kalmansk text-gray-600 text-base">Permanent sletting av brukere og deres data. Dette kan ikke angres!</p></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Loading...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function AdminKryssChange($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200"><div class="mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-blue-600 mb-2">👑 Admin: Juster Kryss</h2> <p class="font-kalmansk text-gray-600 text-base">Direkte justering av brukeres kryss-tellere.</p></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Loading...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function AdminReset($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-red-200"><div class="mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-red-600 mb-2">⚠️ Admin: Kryss System Reset</h2> <p class="font-kalmansk text-gray-600 text-base">Fare-område! Disse handlingene kan ikke angres.</p></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Loading...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function _page($$payload) {
  AdminReset($$payload);
  $$payload.out.push(`<!----> `);
  AdminDeleteUser($$payload);
  $$payload.out.push(`<!----> `);
  AdminCursedRev($$payload);
  $$payload.out.push(`<!----> `);
  AdminKryssChange($$payload);
  $$payload.out.push(`<!---->`);
}
export {
  _page as default
};
