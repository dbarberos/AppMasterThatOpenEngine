import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min"

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
//*** ThreeJS viewer ***

//Set the scene

const scene = new THREE.Scene()
const viewerContainerFather = document.querySelector("#viewer-container-father") as HTMLElement
const viewerContainer = document.querySelector("#viewer-container") as HTMLElement

if (!viewerContainer) {
    throw new Error("Viewer container not found")
}

//Set the camera
const camera = new THREE.PerspectiveCamera(75)
// Relocate the camera
camera.position.z = 2
camera.position.x = 2
camera.position.y = 2


//Camera control to enable navigation
const cameraControl = new OrbitControls(camera, viewerContainer)
cameraControl.enableDamping = true  // Smooth camera movement
cameraControl.dampingFactor = 0.25

//Set the Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
// Attach the domElement to the DOM container. This is our "monitor"
viewerContainer.append(renderer.domElement)

//** Place mesh example **
//create the geometry
const boxGeometry = new THREE.BoxGeometry()
//Cretae the material for the Mesh
const material = new THREE.MeshStandardMaterial({
    color: 0x3498db,
    roughness: 0.5,
    metalness: 0.5,
})

//Create finally the the mesh
const cubeMesh = new THREE.Mesh(boxGeometry, material)

//** Create the Lighting **
const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.4
const directionalLight = new THREE.DirectionalLight()
const spotLight = new THREE.SpotLight(0xffffff, 500);
spotLight.angle = Math.PI / 5;
spotLight.penumbra = 0.2;
spotLight.position.set(2, 3, 3);
spotLight.castShadow = true;
spotLight.shadow.camera.near = 3;
spotLight.shadow.camera.far = 50;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;


// *** Add the light and other objects to the scene ***
scene.add(ambientLight, directionalLight, spotLight)


function resizeViewer() {
    const container = document.querySelector("#viewer-container") as HTMLElement
    
    //  Adapt the size of the viewer to the container
    const containerDimensions = container.getBoundingClientRect()
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    console.log("Resized to:", width, height);

    renderer.setSize(containerDimensions.width, containerDimensions.height)
    const aspectRatio = containerDimensions.width / containerDimensions.height
    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()
}

// ** Set the renderer to render the scene **
function renderScene() {
    cameraControl.update()  // Required for damping
    renderer.render(scene, camera)
    window.requestAnimationFrame(renderScene)
}

document.addEventListener("DOMContentLoaded", () => {
    resizeViewer();
});

function debounce(func: () => void, wait: number) {
    let timeout: number
    return () => {
        clearTimeout(timeout)
        timeout = window.setTimeout(func, wait)
    }
}
// Add resize event listener
const debouncedResize = debounce(resizeViewer, 350)
window.addEventListener("resize", () => {
    console.log("Resize event fired!")
    // This is still useful for initial sizing and other layout changes not related to viewerContainer
    requestAnimationFrame(debouncedResize);
});

// Load a objectS instead showing the cube
// const mtlLoader = new MTLLoader();
// mtlLoader.load("../../assets/Gear/Gear1.mtl", (materials) => {
//     materials.preload(); // Prepara los materiales para su uso

//     // Cargar el modelo OBJ después de que los materiales estén listos
//     const objLoader = new OBJLoader();
//     objLoader.setMaterials(materials); // Asigna los materiales al cargador OBJ
//     objLoader.load("../../assets/Gear/Gear1.obj", (object) => {
//         scene.add(object); // Agrega el objeto a la escena
//     });
// });



//Add "Helpers"
const axesHelper = new THREE.AxesHelper(5)
const gridHelper = new THREE.GridHelper(200, 100, "#808080", "#d1cdcd" )
gridHelper.material.transparent = true
gridHelper.material.opacity = 0.4
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
const spotLightHelper = new THREE.SpotLightHelper(spotLight, "yellow");


scene.add(axesHelper, gridHelper, directionalLightHelper,spotLightHelper)

// renderScene()

// *** Add the GUI ***
// Generate the folders
const gui = new GUI({ autoplace: false }) //Turn off automatic placement.
gui.domElement.style.display = 'none'; // Hide the GUI Control initialy

const meshControls = gui.addFolder('Model')
const lightControlsDirectional = gui.addFolder('Light directional')
const lightControlsSpot = gui.addFolder('Light spot')

//Show and Hide GUI Controls
let guiVisibility = false;

const toggleButton = document.createElement('button');
toggleButton.innerText = 'Toggle GUI';
toggleButton.style.position = 'absolute';
toggleButton.style.bottom = '30px';
toggleButton.style.right = '75px';

const projectDetailsPage = document.querySelector("#project-details")
if (projectDetailsPage) {
    projectDetailsPage.appendChild(toggleButton);
    viewerContainer.appendChild(gui.domElement); // Place the GUI inside the container
}

toggleButton.addEventListener('click', () => {
    guiVisibility = !guiVisibility;
    gui.domElement.style.display = guiVisibility ? 'block' : 'none'; // Hide and show the GUI
});

// Add event listeners to the GUI for mouse enter and leave
let isMouseOverGUI = false;
gui.domElement.addEventListener('mouseenter', () => {
    isMouseOverGUI = true;
    cameraControl.enabled = false;
})
gui.domElement.addEventListener('mouseleave', () => {
    isMouseOverGUI = false;
    cameraControl.enabled = true;
})


// cubeControls.add(cubeMesh.position, "x", -10, 10, 0.1)
// cubeControls.add(cubeMesh.position, "y", -10, 10, 0.1)
// cubeControls.add(cubeMesh.position, "z", -10, 10, 0.1)
// cubeControls.add(cubeMesh, "visible")
// cubeControls.addColor(cubeMesh.material, "color")
lightControlsDirectional.add(directionalLight.position, "x", -20, 20, 1)
lightControlsDirectional.add(directionalLight.position, "y", -20, 20, 1)
lightControlsDirectional.add(directionalLight.position, "z", -20, 20, 1)
lightControlsDirectional.add(directionalLight, "intensity", 0, 1, 0.01)
lightControlsDirectional.addColor(directionalLight, "color")
directionalLightHelper.visible = false
lightControlsDirectional.add(directionalLightHelper, "visible")

lightControlsSpot.add(spotLight.position, "x", -20, 20, 1)
lightControlsSpot.add(spotLight.position, "y", -20, 20, 1)
lightControlsSpot.add(spotLight.position, "z", -20, 20, 1)
lightControlsSpot.add(spotLight, "intensity", 0, 1, 0.01)
lightControlsSpot.add(spotLight, "angle", 0, Math.PI / 5, 0.01)
lightControlsSpot.add(spotLight, "penumbra", 0, 1, 0.01)
lightControlsSpot.addColor(spotLight, "color")
spotLightHelper.visible = true
lightControlsSpot.add(spotLightHelper, "visible")

const gltfLoader = new GLTFLoader();

gltfLoader.load("../../assets/models/scene.gltf", (gltfobject) => {
    console.log("Loaded GLTF object:", gltfobject);

    // loaded GLTF object to control
    const loadedMesh = gltfobject.scene.children[0]; // Adjust this index based on your model structure
    scene.add(gltfobject.scene);

    // Update GUI controls to manipulate the loaded GLTF mesh
    meshControls.add(loadedMesh.position, "x", -100, 100, 0.5);
    meshControls.add(loadedMesh.position, "y", -100, 100, 0.5);
    meshControls.add(loadedMesh.position, "z", -100, 100, 0.5);
    meshControls.add(loadedMesh, "visible");

}, undefined, (error) => {
    console.error("An error occurred while loading the GLTF model:", error);
});

renderScene()


