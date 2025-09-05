import { z as attr, v as pop, t as push } from "../../../chunks/index2.js";
import "../../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "../../../chunks/state.svelte.js";
function _page($$payload, $$props) {
  push();
  let email = "";
  let password = "";
  let firstName = "";
  let lastName = "";
  let regEmail = "";
  let regPassword = "";
  let regConfirmPassword = "";
  $$payload.out.push(`<main class="max-w-md mx-auto p-6 space-y-6 font-kalmansk text-3xl"><section class="border p-4 rounded space-y-2"><h2 class="text-xl font-bold mb-4">Logg inn</h2> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <input type="email"${attr("value", email)} placeholder="Email" class="w-full border p-2 rounded text-base"/> <input type="password"${attr("value", password)} placeholder="Passord" class="w-full border p-2 rounded text-base"/> <button class="w-full bg-blue-600 text-white p-2 rounded text-base">Logg inn</button> <div class="text-center mt-2"><button class="text-blue-600 hover:text-blue-800 underline text-sm">Glemt passord?</button></div></section> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <section class="border p-4 rounded space-y-2"><h2 class="text-xl font-bold mb-4">Registrer ny bruker</h2> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <input type="text"${attr("value", firstName)} placeholder="Fornavn" class="w-full border p-2 rounded text-base"/> <input type="text"${attr("value", lastName)} placeholder="Etternavn" class="w-full border p-2 rounded text-base"/> <input type="email"${attr("value", regEmail)} placeholder="Email" class="w-full border p-2 rounded text-base"/> <input type="password"${attr("value", regPassword)} placeholder="Passord" class="w-full border p-2 rounded text-base"/> <input type="password"${attr("value", regConfirmPassword)} placeholder="Bekreft passord" class="w-full border p-2 rounded text-base"/> <button class="w-full bg-green-600 text-white p-2 rounded text-base">Registrer bruker</button></section> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></main>`);
  pop();
}
export {
  _page as default
};
