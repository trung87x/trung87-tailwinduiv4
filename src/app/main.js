import { mountAppShell } from "../ui/AppShell.js";
import { initRouter } from "./router.js";
import "./style.css";

(async function () {
  await mountAppShell(document.getElementById("app"));
  initRouter();
})();
