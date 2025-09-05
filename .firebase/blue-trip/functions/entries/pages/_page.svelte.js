import "clsx";
import "../../chunks/firebase.js";
import "firebase/firestore";
import { z as attr, w as escape_html, v as pop, t as push } from "../../chunks/index2.js";
import "firebase/storage";
import "firebase/auth";
function DrinkLeaderboard($$payload, $$props) {
  push();
  let loading = true;
  $$payload.out.push(`<div class="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🍻 Enhet-leaderboard</h2> <button class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"${attr("disabled", loading, true)}>${escape_html("Loading...")}</button></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6 sm:py-8"><div class="animate-pulse font-kalmansk text-black text-sm sm:text-base">Loading leaderboard...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function Horoscope($$payload, $$props) {
  push();
  let userVibes = [";)", ":D", ":P"];
  $$payload.out.push(`<div class="w-full max-w-3xl mx-auto text-center justify-center mt-8"><h3 class="text-2xl text-center font-saotorpes">${escape_html("")}, dette blir en</h3> <span class="text-4xl text-blue-600 font-bold transition-colors duration-300 font-saotorpes">${escape_html(userVibes.join(", "))}</span> <h3 class="text-2xl text-center font-saotorpes">type dag for deg.</h3> <h3 class="text-xl text-center font-kalmansk">Ikke fornøyd med hvordan dagen din ser ut? Om noen timer endres alt, men husk at du har mest kontroll over din egen skjebne.</h3></div>`);
  pop();
}
function KryssLeaderboard($$payload, $$props) {
  push();
  let loading = true;
  $$payload.out.push(`<div class="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">⚔️ Kryss-leaderboard</h2> <button class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"${attr("disabled", loading, true)}>${escape_html("Loading...")}</button></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-6 sm:py-8"><div class="animate-pulse font-kalmansk text-black text-sm sm:text-base">Loading leaderboard...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
function _page($$payload) {
  $$payload.out.push(`<div class="w-full max-w-4xl mx-auto space-y-8"><section>`);
  Horoscope($$payload);
  $$payload.out.push(`<!----></section> <section><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="w-full">`);
  KryssLeaderboard($$payload);
  $$payload.out.push(`<!----></div> <div class="w-full">`);
  DrinkLeaderboard($$payload);
  $$payload.out.push(`<!----></div></div></section></div>`);
}
export {
  _page as default
};
