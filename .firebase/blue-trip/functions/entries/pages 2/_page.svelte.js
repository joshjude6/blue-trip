import "clsx";
import { h as head, f as attr, e as escape_html, i as ensure_array_like, j as attr_style, k as bind_props, c as pop, p as push, l as stringify } from "../../chunks/index.js";
import { d as db } from "../../chunks/firebase.js";
import { getDocs, collection } from "firebase/firestore";
import "firebase/storage";
function AllPinsMap($$payload, $$props) {
  push();
  let allPins = [];
  let loading = true;
  let error = null;
  const pinColors = [
    "#ef4444",
    // red
    "#3b82f6",
    // blue
    "#10b981",
    // green
    "#f59e0b",
    // yellow
    "#8b5cf6",
    // purple
    "#ec4899",
    // pink
    "#06b6d4",
    // cyan
    "#84cc16",
    // lime
    "#f97316",
    // orange
    "#6366f1"
    // indigo
  ];
  async function fetchAllPins() {
    try {
      loading = true;
      error = null;
      const querySnapshot = await getDocs(collection(db, "users"));
      allPins = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.mapPin && userData.mapPin.lat && userData.mapPin.lng) {
          allPins.push({
            id: doc.id,
            name: userData.fornavn || "Ukjent",
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
  function refresh() {
    fetchAllPins();
  }
  head($$payload, ($$payload2) => {
    $$payload2.out += `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>`;
  });
  $$payload.out += `<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🗺️ Hvor tror dere vi skal?</h2> <button${attr("disabled", loading, true)} class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-base">${escape_html(loading ? "Laster..." : "Oppdater")} 🔄</button></div> `;
  if (error) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="mb-4 p-4 bg-red-100 text-black rounded font-kalmansk text-base">${escape_html(error)} <button class="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Prøv igjen</button></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  if (allPins.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(allPins);
    $$payload.out += `<div class="mb-4 p-4 bg-blue-50 rounded-lg"><h3 class="font-saotorpes font-semibold text-blue-600 mb-2 text-base">Gjetninger på kartet (${escape_html(allPins.length)}):</h3> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm"><!--[-->`;
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let pin = each_array[index];
      $$payload.out += `<div class="flex items-center space-x-2"><div class="w-4 h-4 rounded-full border border-gray-400 flex-shrink-0"${attr_style(`background-color: ${stringify(pinColors[index % pinColors.length])};`)}></div> <span class="font-kalmansk text-black truncate">${escape_html(pin.name)}</span></div>`;
    }
    $$payload.out += `<!--]--></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="w-full h-64 sm:h-96 lg:h-[500px] rounded-lg border-2 border-gray-300 mb-4" style="min-height: 350px;"></div> `;
  if (loading) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center text-black font-kalmansk text-base">Laster gjetninger... 🔄</div>`;
  } else if (allPins.length === 0) {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="text-center text-black font-kalmansk text-base">Ingen har plassert pins ennå! Vær den første! 📍</div>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="text-center text-black text-base font-kalmansk">${escape_html(allPins.length)} gjett på kartet.</div>`;
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, { refresh });
  pop();
}
function Countdown($$payload, $$props) {
  push();
  let timeLeft = "";
  $$payload.out += `<div class="w-full text-center flex justify-center mt-8"><h2 class="text-3xl font-saotorpes text-center">Det er <span class="text-blue-600 font-bold">${escape_html(timeLeft)}</span> til blåtur!</h2></div>`;
  pop();
}
function DrinkLeaderboard($$payload, $$props) {
  push();
  let loading = true;
  $$payload.out += `<div class="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🍻 Enhet-leaderboard</h2> <button class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"${attr("disabled", loading, true)}>${escape_html("Loading...")}</button></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8"><div class="animate-pulse font-kalmansk text-black text-sm sm:text-base">Loading leaderboard...</div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function KryssLeaderboard($$payload, $$props) {
  push();
  let loading = true;
  $$payload.out += `<div class="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">⚔️ Kryss-leaderboard</h2> <button class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"${attr("disabled", loading, true)}>${escape_html("Loading...")}</button></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8"><div class="animate-pulse font-kalmansk text-black text-sm sm:text-base">Loading leaderboard...</div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function _page($$payload) {
  $$payload.out += `<div class="w-full max-w-2xl mx-auto space-y-8"><section class="text-center">`;
  Countdown($$payload);
  $$payload.out += `<!----></section> <section class="max-w-4xl mx-auto px-4"><div class="bg-white rounded-lg p-6 sm:p-8"><p class="font-kalmansk text-black text-base sm:text-lg leading-relaxed text-center">Blod, svette, og KI har gitt oss denne nettsiden for blåturen som vi SNART skal på! 
                På denne nettsiden kan dere melde kryss på hverandre, registrere antall enheter, og gjette hvor vi skal. 
                Jeg kom ikke på mer features, men gjerne foreslå noe, så vibe-koder jeg det raskt (jeg betalte for claude.ai i én måned via jobb selv om det funka helt jævlig for VHDL😎).</p></div></section> <section><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="w-full">`;
  KryssLeaderboard($$payload);
  $$payload.out += `<!----></div> <div class="w-full">`;
  DrinkLeaderboard($$payload);
  $$payload.out += `<!----></div></div></section> <section>`;
  AllPinsMap($$payload, {});
  $$payload.out += `<!----></section></div>`;
}
export {
  _page as default
};
