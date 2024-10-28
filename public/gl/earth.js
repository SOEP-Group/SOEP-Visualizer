import {
    Mesh,
    Group,
    TextureLoader,
    SRGBColorSpace,
    AdditiveBlending,
    Color,
    Vector3,
    RepeatWrapping,
    ShaderMaterial,
    FileLoader,
    BackSide,
    IcosahedronGeometry,
    MeshStandardMaterial,
} from "three";
import { clock, currentGraphics } from "./renderer.js";
import { loadingManager } from "../main.js";

function loadShader(url) {
    const loader = new FileLoader();
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, null, reject);
    });
}

export class Earth {
    group;
    loader;
    animate;
    planetGroup;
    planetGeometry;
    currRotation;
    orbitalDistance;
    orbitalSpeed;
    currentOrbitAngle;

    constructor({
        planetSize = 1,
        planetAngle = 0,
        planetRotationDirection = "clockwise",
        planetTexture = "Albedo.jpg",
        orbitalDistance = 100, // Arbitrary distance from the sun
        rotationSpeedMultiplier = 1.0, // Used for debugging, leave it at 1 to properly simulate
        orbitalSpeedMultiplier = 1.0, // For speeding up orbit during testing
    } = {}) {
        this.loader = new TextureLoader(loadingManager);
        this.loader.setPath(currentGraphics.textures.earth);
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

        this.animate = this.createAnimateFunction();
        this.animate();
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

    createPlanet() {
        const cloudsMap = this.loader.load("Clouds.png");
        const planetCloudsMaterial = new MeshStandardMaterial({
            alphaMap: cloudsMap,
            transparent: true,
        });
        const planetCloudsMesh = new Mesh(
            this.planetGeometry,
            planetCloudsMaterial
        );
        planetCloudsMesh.scale.setScalar(1.01);
        this.planetGroup.add(planetCloudsMesh);

        const oceanMap = this.loader.load("Ocean.png");
        const planetMaterial = new MeshStandardMaterial({
            map: this.loader.load(this.planetTexture),
            bumpMap: this.loader.load("Bump.jpg"),
            bumpScale: 0.03,
            roughnessMap: oceanMap,
            metalness: 0.1,
            metalnessMap: oceanMap,
            emissiveMap: this.loader.load("Lights.png"),
            emissive: new Color(0xffff88),
        });

        planetMaterial.onBeforeCompile = function(shader) {
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

        float intensity = 1.4 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );
        vec3 atmosphere = vec3( 0.3, 0.6, 1.0 ) * pow(intensity, 5.0);

        diffuseColor.rgb += atmosphere;
      `
            );
        };
        planetMaterial.map.colorSpace = SRGBColorSpace;
        const planetMesh = new Mesh(this.planetGeometry, planetMaterial);
        this.planetGroup.add(planetMesh);
        this.planetGroup.rotation.y = this.currRotation;
        this.planetGroup.rotation.z = this.planetAngle;
        this.group.add(this.planetGroup);
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

    createAnimateFunction() {
        return () => {
            requestAnimationFrame(this.animate);
            const dt = clock.getDelta();
            this.updatePlanetRotation(dt);
            this.updatePlanetOrbit(dt);
        };
    }

    getPlanet() {
        return this.group;
    }

    reload() {
        this.createPlanet();
    }
}