const shimCodeUrl =
  "https://ga.jspm.io/npm:es-module-shims@1.6.2/dist/es-module-shims.wasm.js";

// Define the import map with module paths
const importMap = {
  imports: {
    three: "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/",
  },
};

// Notify that the loader is ready
postMessage("loaded loader");

// Import the shims to enable module imports
importScripts(shimCodeUrl);

// Add the import map to the shim
importShim.addImportMap(importMap);

// Import the actual module for your worker
importShim("./worker.module.js")
  .then(() => {
    postMessage("Module worker Loaded");
  })
  .catch((e) =>
    setTimeout(() => {
      throw e;
    })
  );
