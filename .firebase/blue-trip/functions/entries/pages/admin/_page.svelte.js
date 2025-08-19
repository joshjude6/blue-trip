import "clsx";
import { c as pop, p as push } from "../../../chunks/index.js";
import "../../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
function AdminDeleteUser($$payload, $$props) {
  push();
  $$payload.out += `<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-red-200"><div class="mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-red-600 mb-2">🗑️ Admin: Slett Brukere</h2> <p class="font-kalmansk text-gray-600 text-base">Permanent sletting av brukere og deres data. Dette kan ikke angres!</p></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Loading...</div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function AdminReset($$payload, $$props) {
  push();
  $$payload.out += `<div class="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg border-2 border-red-200"><div class="mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-red-600 mb-2">⚠️ Admin: Kryss System Reset</h2> <p class="font-kalmansk text-gray-600 text-base">Fare-område! Disse handlingene kan ikke angres.</p></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Loading...</div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function _page($$payload) {
  AdminReset($$payload);
  $$payload.out += `<!----> `;
  AdminDeleteUser($$payload);
  $$payload.out += `<!---->`;
}
export {
  _page as default
};
