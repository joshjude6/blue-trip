import { f as attr, c as pop, p as push } from "../../../chunks/index.js";
import "../../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
import "../../../chunks/client.js";
function _page($$payload, $$props) {
  push();
  let email = "";
  let password = "";
  let firstName = "";
  let lastName = "";
  let regEmail = "";
  let regPassword = "";
  let regConfirmPassword = "";
  $$payload.out += `<main class="max-w-md mx-auto p-6 space-y-6 font-kalmansk text-3xl"><section class="border p-4 rounded space-y-2">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <input type="email"${attr("value", email)} placeholder="Email" class="w-full border p-2 rounded"/> <input type="password"${attr("value", password)} placeholder="Passord" class="w-full border p-2 rounded"/> <button class="w-full bg-blue-600 text-white p-2 rounded">Logg inn</button></section> <section class="border p-4 rounded space-y-2">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <input type="text"${attr("value", firstName)} placeholder="Fornavn" class="w-full border p-2 rounded"/> <input type="text"${attr("value", lastName)} placeholder="Etternavn" class="w-full border p-2 rounded"/> <input type="email"${attr("value", regEmail)} placeholder="Email" class="w-full border p-2 rounded"/> <input type="password"${attr("value", regPassword)} placeholder="Passord" class="w-full border p-2 rounded"/> <input type="password"${attr("value", regConfirmPassword)} placeholder="Bekreft passord" class="w-full border p-2 rounded"/> <button class="w-full bg-green-600 text-white p-2 rounded">Registrer bruker</button></section> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></main>`;
  pop();
}
export {
  _page as default
};
