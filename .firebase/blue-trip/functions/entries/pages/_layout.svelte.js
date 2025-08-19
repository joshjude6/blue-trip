import { e as escape_html, c as pop, p as push, d as slot } from "../../chunks/index.js";
import "clsx";
import "../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
function Header($$payload, $$props) {
  push();
  const translations = [
    "blå",
    "blue",
    "blau",
    "青い",
    "azul",
    "파란색",
    "modrá",
    "μπλε",
    "sininen",
    "plava",
    "kék",
    "zils",
    "mavi",
    "蓝色"
  ];
  let index = 0;
  let currentWord = translations[index];
  $$payload.out += `<div class="w-full text-center flex justify-center mt-8"><h1 class="text-5xl text-center font-saotorpes">klar for <span class="text-blue-600 font-bold transition-colors duration-300">${escape_html(currentWord)}</span>tur`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->?</h1></div>`;
  pop();
}
function Nav($$payload, $$props) {
  push();
  $$payload.out += `<nav class="w-full py-4 shadow-md"><ul class="flex flex-wrap justify-center items-center gap-4 px-4"><li><a href="/" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Hjem</a></li> <li><a href="/login" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Logg inn</a></li> <li><a href="/user" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Min side</a></li> <li><a href="/kryss" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Kryss</a></li> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></ul></nav>`;
  pop();
}
function _layout($$payload, $$props) {
  $$payload.out += `<main class="flex flex-col items-center px-4">`;
  Header($$payload);
  $$payload.out += `<!----> `;
  Nav($$payload);
  $$payload.out += `<!----> <!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></main>`;
}
export {
  _layout as default
};
