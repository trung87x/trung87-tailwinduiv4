import { mountAppShell } from "../ui/AppShell.js";
import { initRouter } from "./router.js";

(async function () {
  await mountAppShell(document.getElementById("app"));
  initRouter();
})();
