import {
  Mesh,
  Group,
  ShaderMaterial,
  SRGBColorSpace,
  Color,
  RepeatWrapping,
  MeshStandardMaterial,
  AdditiveBlending,
  BackSide,
  NormalBlending,
  Raycaster,
  SphereGeometry,
  Vector3,
} from "three";

import * as THREE from "three";

import { camera, clock, controls } from "./renderer.js";
import { glState, textureLoader } from "./index.js";
import { gstime } from "../../libs/satellite.js/dist/satellite.es.js";

export class Earth {
  group;
  animate;
  planetGroup;
  planetGeometry;
  currRotation;
  orbitalDistance;
  orbitalSpeed;
  currentOrbitAngle;
  cloudsMesh;
  isPickingLocation = false;
  raycaster = new Raycaster();
  planetMesh;

  constructor({
    planetSize = 1,
    planetAngle = 0,
    planetRotationDirection = "clockwise",
    planetTexture = "Albedo.jpg",
    orbitalDistance = 100, // Arbitrary distance from the sun
    rotationSpeedMultiplier = 1.0, // Used for debugging, leave it at 1 to properly simulate
    orbitalSpeedMultiplier = 1.0, // For speeding up orbit during testing
  } = {}) {
    this.planetSize = planetSize;
    this.planetAngle = planetAngle;
    this.planetTexture = planetTexture;
    this.orbitalDistance = -orbitalDistance;
    this.planetRotationSpeed =
      ((2 * Math.PI) / 86400) * rotationSpeedMultiplier;
    this.planetRotationDirection = planetRotationDirection;
    this.orbitalSpeed =
      ((2 * Math.PI) / (365.25 * 24 * 60 * 60)) * orbitalSpeedMultiplier;
    this.currentOrbitAngle = this.calculateInitialOrbitAngle();

    this.group = new Group();
    this.group.position.set(this.orbitalDistance, 0, 0);
    this.planetGroup = new Group();
    this.planetGeometry = new SphereGeometry(this.planetSize, 64, 64);

    this.createPlanet();
    this.createAtmosphere();

    this.animate = this.createAnimateFunction();
    this.animate();
  }

  dispose() {
    this.animate = null;
    this.group.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
          if (object.material.map) object.material.map.dispose();
          if (object.material.bumpMap) object.material.bumpMap.dispose();
          if (object.material.alphaMap) object.material.alphaMap.dispose();
          if (object.material.emissiveMap)
            object.material.emissiveMap.dispose();
        }
      }
    });

    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }

  calculateEarthRotationInRadians() {
    const now = new Date();
    const gmst = gstime(now);
    return gmst;
  }

  calculateInitialOrbitAngle() {
    const now = new Date();

    // Reference time: start of the year (UTC)
    const startOfYear = new Date(now.getUTCFullYear(), 0, 1);

    // Time elapsed since the start of the year (in seconds)
    const elapsedTimeInSeconds = (now - startOfYear) / 1000;

    // Earth's orbital angular speed (one full orbit per year)
    const angularSpeed = (2 * Math.PI) / (365.25 * 24 * 60 * 60); // radians per second

    // Orbit angle since the start of the year
    const orbitAngle = angularSpeed * elapsedTimeInSeconds;

    // Ensure angle is within [0, 2π]
    return orbitAngle % (2 * Math.PI);
  }

  async createPlanet() {
    const curr_text_dir = glState.get("currentGraphics").textures.earth;
    const [albedoMap, cloudsMap, oceanMap, bumpMap, lightsMap] =
      await Promise.all([
        textureLoader.loadAsync(curr_text_dir + this.planetTexture),
        textureLoader.loadAsync(curr_text_dir + "Clouds.png"),
        textureLoader.loadAsync(curr_text_dir + "Ocean.png"),
        textureLoader.loadAsync(curr_text_dir + "Bump.jpg"),
        textureLoader.loadAsync(curr_text_dir + "Lights.png"),
      ]);

    const planetMaterial = new MeshStandardMaterial({
      map: albedoMap,
      bumpMap: bumpMap,
      bumpScale: 0.03,
      roughnessMap: oceanMap,
      metalness: 0.1,
      metalnessMap: oceanMap,
      emissiveMap: lightsMap,
      emissive: new Color(0xffff88),
    });

    planetMaterial.onBeforeCompile = function (shader) {
      shader.uniforms.tClouds = { value: cloudsMap };
      shader.uniforms.tClouds.value.wrapS = RepeatWrapping;
      shader.uniforms.uv_xOffset = { value: 0 };
      shader.uniforms.fresnelBias = { value: 0.1 };
      shader.uniforms.fresnelScale = { value: 0.3 };
      shader.uniforms.fresnelPower = { value: 0.7 };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
        #include <common>
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `
        #include <worldpos_vertex>
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vViewDirection = normalize(cameraPosition - vWorldPosition);
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
         #include <common>
        uniform sampler2D tClouds;
        uniform float uv_xOffset;
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        varying vec3 vWorldPosition;
        varying vec3 vViewDirection;

        float fresnelEffect(vec3 normal, vec3 viewDirection) {
        float fresnelTerm = fresnelBias + fresnelScale * pow(1.0 - dot(normal, viewDirection), fresnelPower);
        return fresnelTerm;
        }
      `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
          float roughnessFactor = roughness;

          #ifdef USE_ROUGHNESSMAP

            vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
            // reversing the black and white values because we provide the ocean map
            texelRoughness = vec4(1.0) - texelRoughness;

            // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
            roughnessFactor *= clamp(texelRoughness.g, 0.5, 1.0);

          #endif
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `
        #include <emissivemap_fragment>
        #ifdef USE_EMISSIVEMAP

        for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
            vec3 lightDirection = normalize(pointLights[i].position - vWorldPosition);
            float dotProduct = clamp(dot(vNormal, lightDirection), 0.0, 1.0);
            float pointLightEffect = 1.0 - dotProduct;
            float brightnessMultiplier = 1.5;
            float baseEmissive = 0.3;
            emissiveColor *= baseEmissive + pointLightEffect * brightnessMultiplier;
        }

        totalEmissiveRadiance *= emissiveColor.rgb;

        #endif
        float fresnel = fresnelEffect(normalize(vNormal), normalize(vViewDirection));
        float cloudsMapValue = texture2D(tClouds, vec2(vMapUv.x - uv_xOffset, vMapUv.y)).r;

        diffuseColor.rgb *= max(1.0 - cloudsMapValue, 0.2 );
        diffuseColor.rgb += fresnel * vec3(0.3, 0.6, 1.0);
      `
      );
    };
    planetMaterial.map.colorSpace = SRGBColorSpace;
    this.planetMesh = new Mesh(this.planetGeometry, planetMaterial);
    this.planetGroup.add(this.planetMesh);
    this.group.add(this.planetGroup);

    const planetCloudsMaterial = new MeshStandardMaterial({
      map: cloudsMap,
      blending: AdditiveBlending,
      transparent: true,
      opacity: 1,
    });

    this.cloudsMesh = new Mesh(this.planetGeometry, planetCloudsMaterial);
    this.cloudsMesh.scale.setScalar(1.003);
    this.cloudsMesh.renderOrder = 1;
    this.planetGroup.add(this.cloudsMesh);
    this.group.rotation.z = -this.planetAngle;
  }

  createAtmosphere() {
    const uniforms = {
      rim_color: { value: new Color(0x40a2f7) },
      facing_color: { value: new Color(0x000000) },
      fresnelBias: { value: 0.1 },
      fresnelScale: { value: 1.0 },
      fresnelPower: { value: 4.0 },
    };
    const vs = `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    
    varying float vReflectionFactor;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    
      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal);
    
      vec3 I = worldPosition.xyz - cameraPosition;
    
      vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower);
    
      gl_Position = projectionMatrix * mvPosition;
    }
    `;
    const fs = `
    uniform vec3 rim_color;
    uniform vec3 facing_color;
    
    varying float vReflectionFactor;
    
    void main() {
      float f = clamp( vReflectionFactor, 0.0, 1.0 );
      gl_FragColor = vec4(mix(facing_color, rim_color, vec3(f)), f);
    }
    `;
    const fresnelMat = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vs,
      fragmentShader: fs,
      transparent: true,
      blending: AdditiveBlending,
    });

    const atmoMesh = new Mesh(this.planetGeometry, fresnelMat);
    atmoMesh.renderOrder = 2;
    atmoMesh.scale.setScalar(1.01);
    this.group.add(atmoMesh);
  }

  updatePlanetRotation(dt) {
    this.planetGroup.setRotationFromEuler(
      new THREE.Euler(0, this.calculateEarthRotationInRadians(), 0)
    );
  }

  updatePlanetOrbit(dt) {
    this.currentOrbitAngle += this.orbitalSpeed * dt;
    const x = this.orbitalDistance * Math.cos(this.currentOrbitAngle);
    const z = this.orbitalDistance * Math.sin(this.currentOrbitAngle);

    this.group.position.set(x, 0, z);
  }

  updateCloudsRotation(dt) {
    let rotationSpeed = 0.03;
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += rotationSpeed * dt;
    }
  }

  updateCloudsOpacity(dt) {
    if (!controls || !this.cloudsMesh) {
      return;
    }

    let zoomFactor =
      (controls.target.distanceTo(controls.object.position) -
        controls.minDistance) /
      (controls.maxDistance - controls.minDistance);

    zoomFactor = Math.max(0, Math.min(zoomFactor, 1));

    const fadeThreshold = 0.2;
    if (zoomFactor < fadeThreshold) {
      const fadeFactor = zoomFactor / fadeThreshold;
      this.cloudsMesh.material.opacity = fadeFactor;
    } else {
      this.cloudsMesh.material.opacity = 1;
    }
    if (zoomFactor !== this.prevZoomFactor) {
      this.cloudsMesh.material.needsUpdate = true;
    }
    this.prevZoomFactor = zoomFactor;
  }

  createAnimateFunction() {
    return () => {
      if (this.animate) {
        requestAnimationFrame(this.animate);
        const dt = clock.getDelta();
        this.updatePlanetRotation(dt);
        this.updatePlanetOrbit(dt);
        this.updateCloudsRotation(dt);
        this.updateCloudsOpacity(dt);
      }
    };
  }

  // Use this to get the full group of all geometry involving earth
  getGroup() {
    return this.group;
  }

  // Use this to get the roup that rotates
  getPlanetGroup() {
    return this.planetGroup;
  }

  reload() {
    this.dispose();
    this.createPlanet();
  }

  togglePickingLocation() {
    this.isPickingLocation = !this.isPickingLocation;
  }

  checkForClick(mouse, camera) {
    if (!this.isPickingLocation) return null;
    this.raycaster.setFromCamera(mouse, camera);

    const intersects = this.raycaster.intersectObject(this.planetMesh);

    if (intersects.length > 0) {
      return { lat: 0.0, long: 0.0 };
    }
    return null;
  }

  getLocation(mouse, camera) {
    if (!this.isPickingLocation) return null;
    this.raycaster.setFromCamera(mouse, camera);
    const intersects = this.raycaster.intersectObject(this.planetMesh);

    if (intersects.length > 0) {
      let world_coordinates = intersects[0].point;
      let local_coordinates = this.planetGroup.worldToLocal(world_coordinates);

      let normalized = local_coordinates.clone().normalize();

      let lat = THREE.MathUtils.radToDeg(Math.asin(normalized.y));

      let long =
        THREE.MathUtils.radToDeg(Math.atan2(normalized.x, normalized.z)) - 90;

      // Ensure longitude is within [-180, 180] range
      if (long < -180) long += 360;
      if (long > 180) long -= 360;

      return { lat: lat, long: long };
    }

    return null;
  }
}
