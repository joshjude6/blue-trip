import "clsx";
import { F as head, z as attr, w as escape_html, G as ensure_array_like, J as attr_style, K as bind_props, v as pop, t as push, N as stringify } from "../../../chunks/index2.js";
import { d as db } from "../../../chunks/firebase.js";
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
    $$payload2.out.push(`<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>`);
  });
  $$payload.out.push(`<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">🗺️ Hvor trodde dere vi skulle?</h2> <button${attr("disabled", loading, true)} class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-base">${escape_html(loading ? "Laster..." : "Oppdater")} 🔄</button></div> `);
  if (error) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="mb-4 p-4 bg-red-100 text-black rounded font-kalmansk text-base">${escape_html(error)} <button class="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Prøv igjen</button></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (allPins.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(allPins);
    $$payload.out.push(`<div class="mb-4 p-4 bg-blue-50 rounded-lg"><h3 class="font-saotorpes font-semibold text-blue-600 mb-2 text-base">Gjett på kartet (${escape_html(allPins.length)}):</h3> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm"><!--[-->`);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let pin = each_array[index];
      $$payload.out.push(`<div class="flex items-center space-x-2"><div class="w-4 h-4 rounded-full border border-gray-400 flex-shrink-0"${attr_style(`background-color: ${stringify(pinColors[index % pinColors.length])};`)}></div> <span class="font-kalmansk text-black text-lg truncate">${escape_html(pin.name)} `);
      if (pin.name === "Martin") {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`👑 - Nærmest gjett!`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> `);
      if (pin.name === "Tora") {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`🥈 - naila det før hun bytta 👎`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></span></div>`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="w-full h-64 sm:h-96 lg:h-[500px] rounded-lg border-2 border-gray-300 mb-4" style="min-height: 350px;"></div> `);
  if (loading) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center text-black font-kalmansk text-base">Laster gjetninger... 🔄</div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (allPins.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="text-center text-black font-kalmansk text-base">Ingen har plassert pins ennå! Vær den første! 📍</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="text-center text-black text-base font-kalmansk">${escape_html(allPins.length)} gjett på kartet.</div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { refresh });
  pop();
}
function HallofFame($$payload, $$props) {
  push();
  $$payload.out.push(`<div class="min-h-screen from-yellow-50 via-white to-blue-50 p-4"><div class="max-w-6xl mx-auto space-y-8"><div class="text-center py-8"><h1 class="text-3xl sm:text-4xl font-saotorpes font-bold text-black mb-4">🏆 Hall of Fame</h1> <p class="font-kalmansk text-gray-600 text-base sm:text-lg">Topp 3 på leaderboardene for årets blåtur til Málaga, Spania - gratulerer til vinnerne våre!</p></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-12"><div class="animate-pulse font-kalmansk text-black text-lg">Loading hall of fame...</div></div>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  pop();
}
function _page($$payload) {
  HallofFame($$payload);
  $$payload.out.push(`<!----> <div class="w-full max-w-5xl">`);
  AllPinsMap($$payload, {});
  $$payload.out.push(`<!----></div>`);
}
export {
  _page as default
};
