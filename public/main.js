import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// smoother visuals
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
const viewport_div = document.getElementById("gl_viewport");
viewport_div.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 0.6;
controls.maxDistance = 20;

const gltf_loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let currentOrbitLine = null;

const fakeSatelliteData = [
    { id: 'satellite_1', position: { x: 2.5, y: -1, z: 1 } },
    { id: 'satellite_2', position: { x: -2, y: 2, z: 2 } },
    { id: 'satellite_3', position: { x: 3, y: 3, z: -1.5 } },
    { id: 'satellite_4', position: { x: 3.789, y: 2.012, z: -5.277 } },
];

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

function fetchSatelliteInfo(id) {
    return fetch(`/satellite_info/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching satellite info:', error);
            throw error;
        });
}

function fetchOrbitData(id) {
    return fetch(`/orbit_data/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching orbit data:', error);
            throw error;
        });
}

async function getOrbitData(id) {
    try {
      const orbitData = await fetchOrbitData(id);
      return orbitData;
    } catch (error) {
      console.error('Error retrieving orbit data:', error);
    }
  }

gltf_loader.load(
    'meshes/earth/earth.gltf',
    function (gltf) {
        const earthMesh = gltf.scene;
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
    const geometry = new THREE.SphereGeometry(0.025, 64, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satelliteMesh = new THREE.Mesh(geometry, material);

    satelliteMesh.position.set(satellite.position.x, satellite.position.y, satellite.position.z);
    satelliteMesh.name = satellite.id;

    scene.add(satelliteMesh);
}


async function displayOrbit(satellite){
    console.log(satellite)
    stopDisplayingOrbit()

    // get data for this satellite from db
    const data = await getOrbitData(satellite)

    // Ensure satellite data exists
    if (!data || data.length === 0) {
        console.error("No satellite data available.");
        return;
    }

    const orbitPathGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const tolerance = 50;  // might have to update and scale according to startposition
    const loopPosition = {
        x: data[0].position.x,
        y: data[0].position.y,
        z: data[0].position.z
    };

    
    for (const entry of data) {
        if (entry.tsince > 30) {    // go 30 steps forward before looking for the closing of the loop REDO THIS MECHANISM
            if (
                (entry.position.x >= loopPosition.x - tolerance && entry.position.x <= loopPosition.x + tolerance) &&
                (entry.position.y >= loopPosition.y - tolerance && entry.position.y <= loopPosition.y + tolerance) &&
                (entry.position.z >= loopPosition.z - tolerance && entry.position.z <= loopPosition.z + tolerance)
            ) {
                console.log("Loop completed")
                break; // Exit the loop entirely
            }
        }
        
        vertices.push(
            scalePosition(entry.position.x), // X coordinate
            scalePosition(entry.position.y), // Y coordinate
            scalePosition(entry.position.z)  // Z coordinate
        );
    }

    // To close the loop
    vertices.push(scalePosition(loopPosition.x), scalePosition(loopPosition.y), scalePosition(loopPosition.z))   

    orbitPathGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green
    const orbitLine = new THREE.Line(orbitPathGeometry, orbitMaterial);

    currentOrbitLine = orbitLine
    scene.add(orbitLine);

}

function stopDisplayingOrbit() {
    if (currentOrbitLine){
        scene.remove(currentOrbitLine);
    }
}

// Update this so it follows the right scale compared to the earth
function scalePosition(satellitePosition){
    return satellitePosition/1000
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
            document.getElementById('loading-skeleton').classList.remove('hidden');
            displayOrbit(clickedObject.name)

            fetchSatelliteInfo(clickedObject.name)
                .then(data => {
                    document.getElementById('loading-skeleton').classList.add('hidden');
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

const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-5, 2, 2);
scene.add(directionalLight);

window.addEventListener('resize', function () {
    let SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
});

function animate() {
    let SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    viewport_div.width;
    renderer.setViewport(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.clear();
    // renderer.setClearColor('#00031d');
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);