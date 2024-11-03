import { publish } from "./eventBuss.js";
import "./gl/index.js";
import "./ui/index.js";
import "./api/index.js";
import "./utils/ripple.js";

window.addEventListener("load", () => {
  publish("appStartup");
});
