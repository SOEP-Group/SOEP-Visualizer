import {
  Mesh,
  Group,
  ShaderMaterial,
  SRGBColorSpace,
  Color,
  RepeatWrapping,
  IcosahedronGeometry,
  MeshStandardMaterial,
  AdditiveBlending,
  BackSide,
  NormalBlending,
} from "three";
import { camera, clock, controls } from "./renderer.js";
import { glState, textureLoader } from "./index.js";

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
    this.orbitalDistance = orbitalDistance;
    this.planetRotationSpeed =
      ((2 * Math.PI) / 86400) * rotationSpeedMultiplier;
    this.planetRotationDirection = planetRotationDirection;
    this.currRotation = this.calculateEarthRotationInRadians();
    this.orbitalSpeed =
      ((2 * Math.PI) / (365.25 * 24 * 60 * 60)) * orbitalSpeedMultiplier;
    this.currentOrbitAngle = this.calculateInitialOrbitAngle();

    this.group = new Group();
    this.group.position.set(this.orbitalDistance, 0, 0);
    this.planetGroup = new Group();
    this.planetGeometry = new IcosahedronGeometry(this.planetSize, 12);

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
    const referenceTime = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0
    );
    const elapsedTimeInSeconds = (now - referenceTime) / 1000;
    const angularSpeed = (2 * Math.PI) / 86164;
    const rotationAngle = angularSpeed * elapsedTimeInSeconds;

    return rotationAngle % (2 * Math.PI);
  }
  calculateInitialOrbitAngle() {
    const now = new Date();
    const startOfYear = new Date(now.getUTCFullYear(), 0, 1);
    const elapsedTimeInSeconds = (now - startOfYear) / 1000;
    return (this.orbitalSpeed * elapsedTimeInSeconds) % (2 * Math.PI);
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
    const planetMesh = new Mesh(this.planetGeometry, planetMaterial);
    this.planetGroup.add(planetMesh);
    this.planetGroup.rotation.y = this.currRotation;
    this.planetGroup.rotation.z = this.planetAngle;
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
    // Update Earth's rotation (daily cycle)
    const rotationChange = this.planetRotationSpeed * dt;
    if (this.planetRotationDirection === "clockwise") {
      this.planetGroup.rotation.y -= rotationChange;
    } else {
      this.planetGroup.rotation.y += rotationChange;
    }
  }

  updatePlanetOrbit(dt) {
    // Update Earth's position in orbit (annual cycle)
    this.currentOrbitAngle += this.orbitalSpeed * dt;
    this.group.position.set(
      this.orbitalDistance * Math.cos(this.currentOrbitAngle),
      0,
      this.orbitalDistance * Math.sin(this.currentOrbitAngle)
    );
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

  getGroup() {
    return this.group;
  }

  reload() {
    this.createPlanet();
  }
}
