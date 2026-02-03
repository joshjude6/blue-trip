import { G as ensure_array_like, O as attr_class, w as escape_html, N as stringify } from "../../../chunks/index2.js";
function _page($$payload) {
  const games = [
    {
      name: "Wordle",
      url: "https://www.nytimes.com/games/wordle/index.html",
      icon: "🔤",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      name: "Connections",
      url: "https://www.nytimes.com/games/connections",
      icon: "🔗",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Tradle",
      url: "https://oec.world/en/tradle",
      icon: "📦",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      name: "Globle",
      url: "https://globle-game.com",
      icon: "🌍",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      name: "Factle",
      url: "https://frontofficesports.com/trivia/factle/",
      icon: "🧠",
      color: "bg-yellow-500 hover:bg-yellow-600"
    }
  ];
  const each_array = ensure_array_like(games);
  $$payload.out.push(`<div class="w-1/2 p-4 sm:p-6"><h2 class="text-xl sm:text-2xl font-saotorpes font-bold text-black mb-6 text-center">Husk dine fem om dagen!</h2> <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let game = each_array[$$index];
    $$payload.out.push(`<button${attr_class(`group relative overflow-hidden rounded-lg ${stringify(game.color)} text-white p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`)}><div class="text-center"><div class="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">${escape_html(game.icon)}</div> <h3 class="font-bold text-lg font-kalmansk mb-1">${escape_html(game.name)}</h3></div> <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div> <div class="absolute top-2 right-2 opacity-50 group-hover:opacity-80 transition-opacity duration-300"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg></div></button>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
}
export {
  _page as default
};
