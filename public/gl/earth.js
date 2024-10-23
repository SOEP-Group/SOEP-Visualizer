import {
  Mesh,
  Color,
  Group,
  TextureLoader,
  ShaderMaterial,
  SRGBColorSpace,
  AdditiveBlending,
  MeshPhongMaterial,
  MeshBasicMaterial,
  IcosahedronGeometry,
  MeshStandardMaterial,
} from "three";

import { clock } from "./renderer.js";

export class Earth {
  group;
  loader;
  animate;
  planetGroup;
  planetGeometry;
  currRotation;

  constructor({
    planetSize = 1,
    planetAngle = 0,
    planetRotationDirection = "clockwise",
    planetTexture = "/images/earth/earth_color.jpg",
    sunStartingPosition,
    rotationSpeedMultiplier = 1.0, // Used for debugging, leave it at 1 to properly simulate
  } = {}) {
    this.planetSize = planetSize;
    this.planetAngle = planetAngle;
    this.planetTexture = planetTexture;
    this.planetRotationSpeed =
      ((2 * Math.PI) / 86400) * rotationSpeedMultiplier;
    this.planetRotationDirection = planetRotationDirection;
    this.currRotation = -sunStartingPosition.azimuth;

    this.group = new Group();
    this.planetGroup = new Group();
    this.loader = new TextureLoader();
    this.planetGeometry = new IcosahedronGeometry(this.planetSize, 12);

    this.createPlanet();

    this.createPlanetLights();
    this.createPlanetClouds();
    this.createGlow();

    this.animate = this.createAnimateFunction();
    this.animate();
  }

  createPlanet() {
    const map = this.loader.load(this.planetTexture);
    const planetMaterial = new MeshPhongMaterial({ map });
    planetMaterial.map.colorSpace = SRGBColorSpace;
    const planetMesh = new Mesh(this.planetGeometry, planetMaterial);
    this.planetGroup.add(planetMesh);
    this.planetGroup.rotation.y = this.currRotation;
    this.planetGroup.rotation.z = this.planetAngle;
    this.group.add(this.planetGroup);
  }

  createPlanetLights() {
    const planetLightsMaterial = new MeshBasicMaterial({
      map: this.loader.load("/images/earth/earth_lights.jpg"),
      blending: AdditiveBlending,
    });
    const planetLightsMesh = new Mesh(
      this.planetGeometry,
      planetLightsMaterial
    );
    this.planetGroup.add(planetLightsMesh);

    this.group.add(this.planetGroup);
  }

  createPlanetClouds() {
    const planetCloudsMaterial = new MeshStandardMaterial({
      map: this.loader.load("/images/earth/earth_clouds.jpg"),
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
    });
    const planetCloudsMesh = new Mesh(
      this.planetGeometry,
      planetCloudsMaterial
    );
    planetCloudsMesh.scale.setScalar(1.003);
    this.planetGroup.add(planetCloudsMesh);

    this.group.add(this.planetGroup);
  }

  createGlow() {
    const planetSpecularMaterial = new MeshStandardMaterial({
      transparent: true,
      blending: AdditiveBlending,
      metalnessMap: this.loader.load("/images/earth/earth_specular.tif"),
    });
    const planetSpecularMesh = new Mesh(
      this.planetGeometry,
      planetSpecularMaterial
    );
    this.planetGroup.add(planetSpecularMesh);
    this.group.add(this.planetGroup);
  }

  updatePlanetRotation(dt) {
    if (this.planetRotationDirection === "clockwise") {
      this.planetGroup.rotation.y -= this.planetRotationSpeed * dt;
    } else if (this.planetRotationDirection === "counterclockwise") {
      this.planetGroup.rotation.y += this.planetRotationSpeed * dt;
    }
  }

  createAnimateFunction() {
    return () => {
      requestAnimationFrame(this.animate);
      this.updatePlanetRotation(clock.getDelta());
    };
  }

  getPlanet() {
    return this.group;
  }
}
