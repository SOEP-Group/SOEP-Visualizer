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

export class Earth {
  group;
  loader;
  animate;
  planetGroup;
  planetGeometry;

  constructor({
    planetSize = 1,
    planetAngle = 0,
    planetRotationSpeed = 1,
    planetRotationDirection = "clockwise",
    planetTexture = "/images/earth/earth_color.jpg",
  } = {}) {
    this.planetSize = planetSize;
    this.planetAngle = planetAngle;
    this.planetTexture = planetTexture;
    this.planetRotationSpeed = planetRotationSpeed;
    this.planetRotationDirection = planetRotationDirection;

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
    this.planetGroup.rotation.z = -this.planetAngle;
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

  updatePlanetRotation() {
    if (this.planetRotationDirection === "clockwise") {
      this.planetGroup.rotation.y -= this.planetRotationSpeed;
    } else if (this.planetRotationDirection === "counterclockwise") {
      this.planetGroup.rotation.y += this.planetRotationSpeed;
    }
  }

  createAnimateFunction() {
    return () => {
      requestAnimationFrame(this.animate);
      this.updatePlanetRotation();
    };
  }

  getPlanet() {
    return this.group;
  }
}
