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
controls.maxDistance = 10;

const gltf_loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const fakeSatelliteData = [
    { id: 'satellite_1', position: { x: 0.5, y: -1, z: 0.1 } },
    { id: 'satellite_2', position: { x: -2, y: 0.2, z: 0.2 } },
    { id: 'satellite_3', position: { x: 0.3, y: 0.3, z: -1.5 } },
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

gltf_loader.load(
    'meshes/earth/earth.gltf',
    function (gltf) {
        const earthMesh = gltf.scene;
        scene.add(earthMesh);

        loadAllSatellites();
    },
    // called while loading is progressing
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('An error happened', error);
    }
);

function loadAllSatellites() {
    fetchSatelliteData()    // fetch satellite_orbit_data for all satelite_id in satellite table, then getSatellitePosition(satelliteId), then add
        .then(data => {
            data.forEach(satellite => {
                addSatelliteToScene(satellite);
            });
        })
        .catch(error => console.error('Error loading satellites:', error));
}

// const { Client } = require('pg'); // Import the PostgreSQL client
// const moment = require('moment'); // For handling dates easily

// async function getSatellitePosition(satelliteId) {
//     const client = new Client({
//         user: 'your_user',
//         host: 'localhost',
//         database: 'your_database',
//         password: 'your_password',
//         port: 5432, // Default PostgreSQL port
//     });

//     await client.connect();

//     try {
//         // Retrieve the latest position and velocity before now
//         const latestQuery = `
//             SELECT tsince, x, y, z, xdot, ydot, zdot, epoch_time
//             FROM satellite_orbit_data
//             WHERE satellite_id = $1 AND epoch_time <= NOW()
//             ORDER BY epoch_time DESC
//             LIMIT 1;
//         `;
//         const { rows: latestRows } = await client.query(latestQuery, [satelliteId]);
//         const latestData = latestRows[0];

//         // Retrieve the next position after now
//         const nextQuery = `
//             SELECT tsince, x, y, z, xdot, ydot, zdot, epoch_time
//             FROM satellite_orbit_data
//             WHERE satellite_id = $1 AND epoch_time > NOW()
//             ORDER BY epoch_time ASC
//             LIMIT 1;
//         `;
//         const { rows: nextRows } = await client.query(nextQuery, [satelliteId]);
//         const nextData = nextRows[0];

//         // Current time in epoch format
//         const currentTime = moment();
//         const epochTime = moment(latestData.epoch_time);

//         // Calculate time elapsed in seconds since epoch
//         const elapsedSeconds = currentTime.diff(epochTime, 'seconds');

//         // Calculate new position using velocities if elapsed time is significant
//         if (elapsedSeconds > 0) {
//             const x = latestData.x + latestData.xdot * elapsedSeconds;
//             const y = latestData.y + latestData.ydot * elapsedSeconds;
//             const z = latestData.z + latestData.zdot * elapsedSeconds;

//             return { x, y, z };
//         } else {
//             // If no significant time has elapsed, return the latest known position
//             return { x: latestData.x, y: latestData.y, z: latestData.z };
//         }
//     } catch (err) {
//         console.error('Error retrieving satellite position:', err);
//     } finally {
//         await client.end();
//     }
// }

// // Example Usage
// getSatellitePosition('25544U98067A')
//     .then(position => {
//         console.log('Current Position:', position);
//     })
//     .catch(err => {
//         console.error(err);
//     });


// // Example Usage
// getSatellitePosition('25544U98067A')
//     .then(position => {
//         console.log('Current Position:', position);
//     })
//     .catch(err => {
//         console.error(err);
//     });

function addSatelliteToScene(satellite) {
    const geometry = new THREE.SphereGeometry(0.025, 64, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const satelliteMesh = new THREE.Mesh(geometry, material);

    // call to fuction that re-maps real position with redered position
    satelliteMesh.position.set(satellite.position.x, satellite.position.y, satellite.position.z);
    satelliteMesh.name = satellite.id;

    scene.add(satelliteMesh);
}

function plotOrbit(orbitData) {
    // Remove any existing orbit path, if needed
    if (scene.getObjectByName('satelliteOrbitPath')) {
        const oldOrbit = scene.getObjectByName('satelliteOrbitPath');
        scene.remove(oldOrbit);
    }

    console.log(orbitData);
    // Create a curve using orbit data points
    const orbitPoints = orbitData.map(point => new THREE.Vector3(point.x, point.y, point.z));
    const orbitCurve = new THREE.CatmullRomCurve3(orbitPoints);

    // Create a geometry and material for the orbit path
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(100)); // Higher number for smoother curve
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 }); // Set color of orbit path

    // Create the orbit line and add it to the scene
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLine.name = 'satelliteOrbitPath';  // Give it a name to manage later

    // Add to scene
    scene.add(orbitLine);
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

            fetchSatelliteInfo(clickedObject.name)
                .then(data => {
                    document.getElementById('loading-skeleton').classList.add('hidden');
                    openPopup(data);

                    if (data.orbitData) {
                        plotOrbit(data.orbitData);
                    }
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