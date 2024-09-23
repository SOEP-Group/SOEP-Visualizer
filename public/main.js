import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 0.6;
const gltf_loader = new GLTFLoader();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const textureLoader = new THREE.TextureLoader();

// Get current month and corresponding image name
const date = new Date();
const month = date.getMonth();
const monthNames = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
];
const imageName = `meshes/earth/earth_${monthNames[month]}.jpg`;
console.log("Selected image for the current month:", imageName);

const fakeSatelliteData = [
    { id: 'satellite_1', position: { x: 0.5, y: -1, z: 0.1 } },
    { id: 'satellite_2', position: { x: -2, y: 0.2, z: 0.2 } },
    { id: 'satellite_3', position: { x: 0.3, y: 0.3, z: -1.5 } },
];

const mockSatelliteData = {
    'satellite_1': {
        name: 'Satellite Alpha',
        launchDate: '2020-01-01',
    },
    'satellite_2': {
        name: 'Satellite Beta',
        launchDate: '2021-05-15',
    },
    'satellite_3': {
        name: 'Satellite C',
        launchDate: '2022-12-15',
    },
};

async function fetchSatelliteData() {
    try {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(fakeSatelliteData);
            }, 1000); // Simulate network delay
            // reject("Network Error: Unable to fetch satellite data"); Have this reject in future
        });
    } catch (error) {
        console.error("Error fetching satellite data:", error);
        return [];
    }
}

function fetchSatelliteInfo(id) {   // will remake and move this!
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (mockSatelliteData[id]) {
                resolve(mockSatelliteData[id]);
            } else {
                reject('Satellite not found');
            }
        }, 500); // Simulate network delay
    });
}

gltf_loader.load(
    'meshes/earth/earth.gltf',
    function (gltf) {
        const earthMesh = gltf.scene;
        earthMesh.children[0].name = "earth";
        textureLoader.load(imageName, function (texture) {
            texture.flipY = false;
            earthMesh.children[0].material.map = texture;
            earthMesh.children[0].material.needsUpdate = true;
        });
        scene.add(earthMesh);

        loadSatellites();
    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('An error happened', error);
    }
);

function loadSatellites() {
    fetchSatelliteData()
        .then(data => {
            data.forEach(satellite => {
                addSatelliteToScene(satellite);
            });
        })
        .catch(error => console.error('Error loading satellites:', error));
}

function addSatelliteToScene(satellite) {
    const geometry = new THREE.SphereGeometry(0.025, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satelliteMesh = new THREE.Mesh(geometry, material);

    satelliteMesh.position.set(satellite.position.x, satellite.position.y, satellite.position.z);
    satelliteMesh.name = satellite.id;

    scene.add(satelliteMesh);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    const dynamicContentDiv = document.getElementById("dynamic-content");

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        if (clickedObject.name === "earth") {
            console.log("Earth mesh clicked!");

            dynamicContentDiv.classList.remove("hidden");
            htmx.ajax('GET', '/test', {
                target: '#dynamic-content'
            });
        }

        if (clickedObject.name.startsWith("satellite_")) {
            console.log("Satellite clicked:", clickedObject.name);

            fetchSatelliteInfo(clickedObject.name)
                .then(data => {
                    openPopup(data);
                })
                .catch(error => {
                    console.error('Error fetching satellite info:', error);
                    openPopup({
                        name: 'Error',
                        launchDate: 'Error'
                    });
                });
        }

    } else {
        dynamicContentDiv.classList.add("hidden");
    }
}

window.addEventListener('click', onMouseClick, false);


renderer.setSize(window.innerWidth, window.innerHeight);
const viewport_div = document.getElementById("gl_viewport");
viewport_div.appendChild(renderer.domElement);

camera.position.z = 5;

const light = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
scene.add(directionalLight);

window.addEventListener('resize', function () {
    let SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

    // Update camera aspect ratio to match new screen dimensions
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();  // Recalculate projection matrix after aspect change

    // Update renderer size to match new screen size
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
});


function animate() {
    let SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    viewport_div.width
    renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.clear();
    // renderer.setClearColor('#00031d');
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);