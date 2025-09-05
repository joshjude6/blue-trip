import { w as escape_html, v as pop, t as push, x as slot } from "../../chunks/index2.js";
import "clsx";
import "../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
function Header($$payload, $$props) {
  push();
  const translations = [
    "siste",
    "last",
    // English
    "letzte",
    // German
    "último",
    // Spanish
    "dernier",
    // French
    "最後",
    // Japanese (saigo)
    "마지막",
    // Korean (majimak)
    "poslední",
    // Czech
    "τελευταίος",
    // Greek (telefteos)
    "viimeinen",
    // Finnish
    "zadnji",
    // Croatian/Slovenian
    "utolsó",
    // Hungarian
    "pēdējais",
    // Latvian
    "son",
    // Turkish
    "最后"
    // Chinese (zuìhòu)
  ];
  let index = 0;
  let currentWord = translations[index];
  $$payload.out.push(`<div class="w-full text-center flex justify-center mt-8"><h1 class="text-5xl text-center font-saotorpes">klar for ditt <span class="text-blue-600 font-bold transition-colors duration-300">${escape_html(currentWord)}</span> år`);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->?</h1></div>`);
  pop();
}
function Nav($$payload, $$props) {
  push();
  $$payload.out.push(`<nav class="w-full py-4 shadow-md"><ul class="flex flex-wrap justify-center items-center gap-4 px-4"><li><a href="/" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Hjem</a></li> <li><a href="/login" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Logg inn</a></li> <li><a href="/user" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Min side</a></li> <li><a href="/kryss" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Kryss</a></li> <li><a href="/blue" class="bg-white text-blue-600 font-kalmansk text-lg sm:text-2xl rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition flex items-center justify-center">Hall of Fame</a></li> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></ul></nav>`);
  pop();
}
function _layout($$payload, $$props) {
  $$payload.out.push(`<main class="flex flex-col items-center px-4">`);
  Header($$payload);
  $$payload.out.push(`<!----> `);
  Nav($$payload);
  $$payload.out.push(`<!----> <!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></main>`);
}
export {
  _layout as default
};
