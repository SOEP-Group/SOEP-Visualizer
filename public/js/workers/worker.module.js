import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class WorkerClass {
  constructor() {
    this.loader = new GLTFLoader();
  }

  loadModel(modelPath) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => resolve(gltf.scene.toJSON()),
        undefined,
        (error) => reject(error)
      );
    });
  }

  async onMessage(event) {
    const { modelPath } = event.data;
    if (modelPath) {
      try {
        const modelData = await this.loadModel(modelPath);
        postMessage({ type: "modelLoaded", modelData });
      } catch (error) {
        postMessage({ type: "error", error: error.message });
      }
    }
  }
}

const workerInstance = new WorkerClass();

self.addEventListener("message", (evt) => workerInstance.onMessage(evt));
postMessage("Module worker Loaded");
