import { f as attr, e as escape_html, k as bind_props, c as pop, p as push, i as ensure_array_like, m as attr_class, j as attr_style, l as stringify, h as head } from "../../../chunks/index.js";
import { d as db } from "../../../chunks/firebase.js";
import { query, collection, orderBy, getDocs, limit } from "firebase/firestore";
import "clsx";
import "firebase/auth";
function XChart($$payload, $$props) {
  push();
  let users = [];
  let loading = true;
  let error = null;
  let maxCrosses = 0;
  async function fetchUsers() {
    try {
      loading = true;
      error = null;
      const q = query(collection(db, "users"), orderBy("totalCrosses", "desc"));
      const querySnapshot = await getDocs(q);
      users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const crosses = userData.totalCrosses || 0;
        users.push({
          id: doc.id,
          name: userData.fornavn || "Unknown",
          totalCrosses: crosses
        });
      });
      maxCrosses = users.length > 0 ? Math.max(...users.map((u) => u.totalCrosses), 5) : 5;
      console.log("Users fetched for chart:", users);
    } catch (err) {
      console.error("Error fetching users:", err);
      error = "Failed to load chart data";
    } finally {
      loading = false;
    }
  }
  function getBarHeight(crosses) {
    if (maxCrosses === 0) return 0;
    return Math.max(crosses / maxCrosses * 100, 2);
  }
  function getBarColor(index) {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-yellow-600",
      "bg-red-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-gray-600"
    ];
    return colors[index % colors.length];
  }
  function refresh() {
    fetchUsers();
  }
  $$payload.out += `<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">📊 Oversikt over kryss</h2> <button class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"${attr("disabled", loading, true)}>${escape_html(loading ? "Loading..." : "Refresh")} 🔄</button></div> `;
  if (loading) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8"><div class="animate-pulse font-kalmansk text-black text-base sm:text-lg">Loading chart...</div></div>`;
  } else if (error) {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8 text-black"><p class="font-kalmansk text-base sm:text-lg text-red-600">${escape_html(error)}</p> <button class="mt-2 px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 text-base">Try Again</button></div>`;
  } else if (users.length === 0) {
    $$payload.out += "<!--[2-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8 text-black"><p class="font-kalmansk text-base sm:text-lg">No users found.</p></div>`;
  } else {
    $$payload.out += "<!--[!-->";
    const each_array = ensure_array_like(users);
    $$payload.out += `<div class="bg-gray-50 rounded-lg p-4 mb-4"><div class="flex items-end justify-center space-x-2 sm:space-x-4 h-48 sm:h-64"><!--[-->`;
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let user = each_array[index];
      $$payload.out += `<div class="flex flex-col items-center space-y-2"><div class="flex flex-col justify-end h-32 sm:h-48"><div${attr_class(`${stringify(getBarColor(index))} rounded-t transition-all duration-500 ease-out min-w-8 sm:min-w-12 flex items-end justify-center pb-1`)}${attr_style(`height: ${stringify(getBarHeight(user.totalCrosses))}%;`)}>`;
      if (user.totalCrosses > 0) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<span class="text-white text-xs font-kalmansk font-bold">${escape_html(user.totalCrosses)}</span>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div></div> <div class="text-center"><span class="text-sm sm:text-base font-kalmansk text-black font-semibold">${escape_html(user.name)}</span></div></div>`;
    }
    $$payload.out += `<!--]--></div> <div class="flex justify-between mt-4 text-sm text-gray-500 font-kalmansk"><span>0</span> <span class="text-center">${escape_html(Math.floor(maxCrosses / 2))}</span> <span>${escape_html(maxCrosses)}</span></div></div> <div class="bg-blue-50 rounded-lg p-3 sm:p-4"><div class="flex justify-center gap-8 sm:gap-16 text-center"><div><div class="text-lg sm:text-xl font-saotorpes text-blue-600">${escape_html(users.reduce((sum, user) => sum + user.totalCrosses, 0))}</div> <div class="text-sm sm:text-base font-kalmansk text-black">Total mengde kryss</div></div> <div><div class="text-lg sm:text-xl font-saotorpes text-blue-600">${escape_html(users.length)}</div> <div class="text-sm sm:text-base font-kalmansk text-black">Deltakere</div></div></div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, { refresh });
  pop();
}
function GiveX($$payload, $$props) {
  push();
  $$payload.out += `<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-6">❌ Gi kryss her!</h2> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6"><div class="animate-pulse font-kalmansk text-black text-base">Laster inn...</div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function XHistory($$payload, $$props) {
  push();
  let kryssHistory = [];
  let loading = true;
  let error = null;
  let showAll = false;
  async function fetchKryssHistory() {
    try {
      loading = true;
      error = null;
      const q = query(collection(db, "kryssLog"), orderBy("timestamp", "desc"), limit(showAll ? 100 : 20));
      const querySnapshot = await getDocs(q);
      kryssHistory = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let formattedTime = "Ukjent tid";
        if (data.timestamp && data.timestamp.toDate) {
          const date = data.timestamp.toDate();
          formattedTime = new Intl.DateTimeFormat("no-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(date);
        }
        kryssHistory.push({
          id: doc.id,
          giverName: data.giverName || "Ukjent",
          receiverName: data.receiverName || "Ukjent",
          reason: data.reason || "Ingen grunn oppgitt",
          amount: data.amount || 1,
          timestamp: data.timestamp,
          formattedTime
        });
      });
      console.log("Kryss history fetched:", kryssHistory);
    } catch (err) {
      console.error("Error fetching kryss history:", err);
      error = "Kunne ikke laste krysshistorikk";
    } finally {
      loading = false;
    }
  }
  function refresh() {
    fetchKryssHistory();
  }
  $$payload.out += `<div class="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black">📜 Krysshistorikk</h2> <div class="flex gap-2"><button class="px-3 py-2 bg-gray-600 text-white font-kalmansk rounded hover:bg-gray-700 transition-colors text-sm">${escape_html("Vis alle")}</button> <button class="px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 transition-colors text-sm sm:text-base"${attr("disabled", loading, true)}>${escape_html(loading ? "Loading..." : "Refresh")} 🔄</button></div></div> `;
  if (loading) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8"><div class="animate-pulse font-kalmansk text-black text-base sm:text-lg">Laster historikk...</div></div>`;
  } else if (error) {
    $$payload.out += "<!--[1-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8 text-black"><p class="font-kalmansk text-base sm:text-lg text-red-600">${escape_html(error)}</p> <button class="mt-2 px-4 py-2 bg-blue-600 text-white font-kalmansk rounded hover:bg-blue-700 text-base">Prøv igjen</button></div>`;
  } else if (kryssHistory.length === 0) {
    $$payload.out += "<!--[2-->";
    $$payload.out += `<div class="text-center py-6 sm:py-8 text-black"><p class="font-kalmansk text-base sm:text-lg">Ingen krysshistorikk ennå. Begynn å gi noen kryss! ❌</p></div>`;
  } else {
    $$payload.out += "<!--[!-->";
    const each_array = ensure_array_like(kryssHistory);
    const each_array_1 = ensure_array_like(kryssHistory);
    $$payload.out += `<div class="block sm:hidden space-y-3"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let entry = each_array[$$index];
      $$payload.out += `<div class="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-600"><div class="flex items-start justify-between mb-2"><div class="flex items-center space-x-2"><span class="font-kalmansk font-semibold text-black text-base">${escape_html(entry.giverName)}</span> <span class="text-gray-500 text-base">→</span> <span class="font-kalmansk font-semibold text-blue-600 text-base">${escape_html(entry.receiverName)}</span></div> <span class="bg-blue-600 text-white px-2 py-1 rounded text-sm font-kalmansk">${escape_html(entry.amount)}x</span></div> <p class="font-kalmansk text-black text-base mb-2">"${escape_html(entry.reason)}"</p> <p class="text-sm text-gray-500 font-kalmansk">${escape_html(entry.formattedTime)}</p></div>`;
    }
    $$payload.out += `<!--]--></div> <div class="hidden sm:block overflow-x-auto"><table class="w-full"><thead><tr class="border-b-2 border-gray-200"><th class="text-left py-3 px-2 font-saotorpes text-black text-base">Fra</th><th class="text-left py-3 px-2 font-saotorpes text-black text-base">Til</th><th class="text-left py-3 px-2 font-saotorpes text-black text-base">Grunn</th><th class="text-center py-3 px-2 font-saotorpes text-black text-base">Antall</th><th class="text-right py-3 px-2 font-saotorpes text-black text-base">Når</th></tr></thead><tbody><!--[-->`;
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let entry = each_array_1[$$index_1];
      $$payload.out += `<tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors"><td class="py-3 px-2 font-kalmansk text-black text-base">${escape_html(entry.giverName)}</td><td class="py-3 px-2 font-kalmansk text-blue-600 font-semibold text-base">${escape_html(entry.receiverName)}</td><td class="py-3 px-2 font-kalmansk text-black text-base max-w-xs"><span class="truncate block"${attr("title", entry.reason)}>"${escape_html(entry.reason)}"</span></td><td class="py-3 px-2 text-center"><span class="bg-blue-600 text-white px-2 py-1 rounded text-sm font-kalmansk">${escape_html(entry.amount)}x</span></td><td class="py-3 px-2 text-right font-kalmansk text-gray-500 text-sm">${escape_html(entry.formattedTime)}</td></tr>`;
    }
    $$payload.out += `<!--]--></tbody></table></div> <div class="mt-6 pt-4 border-t border-gray-200"><div class="text-center"><span class="text-base font-kalmansk text-black">Viser ${escape_html(kryssHistory.length)} ${escape_html("nylige")} oppføringer</span></div></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  bind_props($$props, { refresh });
  pop();
}
function _page($$payload) {
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Kryss</title>`;
  });
  $$payload.out += `<div class="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8"><div class="text-center px-4"><h1 class="text-2xl sm:text-3xl font-saotorpes font-bold text-black mb-2 mt-8">Kryssesystem</h1></div> <p class="font-kalmansk max-w-xl mx-auto text-black text-base sm:text-lg leading-relaxed text-center">På denne siden kan dere melde kryss på hverandre! Nederst på siden er det en logg med alle kryss, og grunnene til hvorfor vedkommende fikk kryssene sine. 
        Husk å være generøse med kryssene! Sharing is caring, som man sier. Straffen for et kryss vet vi ikke enda - hva tenker dere?</p> <section>`;
  XChart($$payload, {});
  $$payload.out += `<!----></section> <section>`;
  GiveX($$payload);
  $$payload.out += `<!----></section> <section>`;
  XHistory($$payload, {});
  $$payload.out += `<!----></section></div>`;
}
export {
  _page as default
};
