import "clsx";
import { v as pop, t as push } from "../../../chunks/index2.js";
import "../../../chunks/firebase.js";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
function _page($$payload, $$props) {
  push();
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="flex justify-center items-center min-h-screen"><div class="text-xl font-kalmansk">Laster inn...</div></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _page as default
};
