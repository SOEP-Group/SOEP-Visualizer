import {
  Group,
  InstancedMesh,
  Matrix4,
  Vector3,
  Color,
  Quaternion,
  SphereGeometry,
  MeshBasicMaterial,
  Raycaster,
} from "three";
import { globalState } from "../globalState.js"; // Import global state for tracking selection mode

export class Satellites {
  instancedMesh;
  instanceCount;
  group;
  raycaster;
  instanceIdToSatelliteIdMap = {};
  instanceIdToDataMap = {}; // Map for storing satellite data
  baseColor = new Color().setHex(0xff0000);
  hoverColor = new Color(1, 1, 0);
  hoveredSatellite = -1;
  focusedSatellite = -1;

  constructor(data) {
    this.instanceCount = data.length;
    this.group = new Group();
    this.group.position.set(0, 0, 0);
    this.raycaster = new Raycaster();
    this.raycaster.precision = 0.2;

    this.createNewInstancedMesh();
    data.forEach((satellite) => {
      const position = new Vector3(
        satellite.position.x,
        satellite.position.y,
        satellite.position.z
      );
      this.addInstance(satellite.id, position, satellite);
    });
  }

  createNewInstancedMesh() {
    this.geometry = new SphereGeometry(0.01, 6, 6);
    this.material = new MeshBasicMaterial();

    const instancedMesh = new InstancedMesh(
      this.geometry,
      this.material,
      this.instanceCount
    );
    this.group.add(instancedMesh);
    this.instancedMesh = { mesh: instancedMesh, count: 0 };
  }

  addInstance(satellite_id, position = new Vector3(), satelliteData) {
    if (this.instancedMesh.count >= this.instanceCount) {
      console.warn("Max instances reached for", this.instancedMesh.mesh);
      return;
    }

    const instanceId = this.instancedMesh.count;
    const matrix = new Matrix4();
    matrix.compose(position, new Quaternion(), new Vector3(1, 1, 1));
    this.instancedMesh.mesh.setMatrixAt(instanceId, matrix);
    this.instancedMesh.mesh.instanceMatrix.needsUpdate = true;

    this.instanceIdToSatelliteIdMap[instanceId] = satellite_id;
    this.instanceIdToDataMap[instanceId] = satelliteData; // Save satellite data
    this.instancedMesh.count += 1;
    this.instancedMesh.mesh.geometry.computeBoundingBox();
    this.instancedMesh.mesh.geometry.computeBoundingSphere();

    this.instancedMesh.mesh.setColorAt(instanceId, this.baseColor);
    this.instancedMesh.mesh.instanceColor.needsUpdate = true;
  }

  checkForClick(mouse, camera) {
    this.raycaster.setFromCamera(mouse, camera);

    const intersects = this.raycaster.intersectObject(this.instancedMesh.mesh);
    if (intersects.length > 0) {
      const clickedInstanceId = intersects[0].instanceId;
      const satelliteData = this.instanceIdToDataMap[clickedInstanceId];

      if (globalState.get("pickingSatellite")) {
        const satelliteInputField = document.getElementById("satellite-pass");
        if (satelliteInputField && satelliteData.name) {
          satelliteInputField.value = satelliteData.name; // Update input field with satellite name
        }
        globalState.set({ pickingSatellite: false }); // Exit selection mode
        console.log(`Satellite selected: ${satelliteData.name}`);
      }

      return clickedInstanceId;
    }
    return null;
  }

  getIdByInstanceId(id) {
    return this.instanceIdToSatelliteIdMap[id];
  }

  resetColors() {
    for (let i = 0; i < this.instanceCount; i++) {
      if (i === this.focusedSatellite) {
        continue;
      }
      this.instancedMesh.mesh.setColorAt(i, this.baseColor);
    }
    this.instancedMesh.mesh.instanceColor.needsUpdate = true;
  }

  setHovered(id) {
    if (this.hoveredSatellite > -1 && this.hoveredSatellite !== id) {
      this.resetColors();
    }
    if (id > -1) {
      this.instancedMesh.mesh.setColorAt(id, this.hoverColor);
      this.hoveredSatellite = id;
      this.instancedMesh.mesh.instanceColor.needsUpdate = true;
    }
  }

  setFocused(id) {
    if (this.hoveredSatellite > -1 && this.hoveredSatellite !== id) {
      this.focusedSatellite = -1;
      this.resetColors();
    }

    if (id > -1) {
      this.instancedMesh.mesh.setColorAt(id, this.hoverColor);
      this.focusedSatellite = id;
      this.instancedMesh.mesh.instanceColor.needsUpdate = true;
    }
  }

  getGroup() {
    return this.group;
  }

  getPosition(instanceId) {
    const matrix = new Matrix4();
    this.instancedMesh.mesh.getMatrixAt(instanceId, matrix);
    const position = new Vector3();
    matrix.decompose(position, new Quaternion(), new Vector3(1, 1, 1));
    return position;
  }
}
