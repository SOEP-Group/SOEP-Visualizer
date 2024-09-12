import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
const gltf_loader = new GLTFLoader();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

gltf_loader.load(
	'meshes/earth/earth.gltf',
	function ( gltf ) {

		const earthMesh = gltf.scene;
        earthMesh.children[0].name = "earth"; 
        console.log(earthMesh)
        scene.add(earthMesh);
        

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	function ( error ) {

		console.log( 'An error happened' );

	}
);

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
    } else {
        dynamicContentDiv.classList.add("hidden");
    }
}

window.addEventListener('click', onMouseClick, false);


renderer.setSize( window.innerWidth, window.innerHeight );
const viewport_div = document.getElementById("gl_viewport");
viewport_div.appendChild( renderer.domElement );

camera.position.z = 5;

const light = new THREE.AmbientLight( 0xffffff, 1 );
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

window.addEventListener('resize', function() {
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
    renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.clear();
    renderer.setClearColor('#00031d');
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );