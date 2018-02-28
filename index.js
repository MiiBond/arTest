import * as THREE from 'three';
import { ARUtils, ARPerspectiveCamera, ARView } from 'three.ar.js';

// async function init() {
//   const display = await ARUtils.getARDisplay();
//   const renderer = new WebGLRenderer({ alpha: true });
//   const arView = new ARView(display, renderer);

//   // And so forth...
// }

var vrDisplay, vrControls, arView;
var canvas, camera, scene, renderer;
var BOX_DISTANCE = 1.5;
var BOX_SIZE = 0.25;
var BOX_QUANTITY = 6;
var boxesAdded = false;
/**
 * Use the `getARDisplay()` utility to leverage the WebVR API
 * to see if there are any AR-capable WebVR VRDisplays. Returns
 * a valid display if found. Otherwise, display the unsupported
 * browser message.
 */
THREE.ARUtils.getARDisplay().then(function (display) {
  if (display) {
    vrDisplay = display;
    init();
  } else {
    THREE.ARUtils.displayUnsupportedMessage();
  }
});
function init() {
  // Setup the three.js rendering environment
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  canvas = renderer.domElement;
  document.body.appendChild(canvas);
  scene = new THREE.Scene();
  // Creating the ARView, which is the object that handles
  // the rendering of the camera stream behind the three.js
  // scene
  arView = new THREE.ARView(vrDisplay, renderer);
  // The ARPerspectiveCamera is very similar to THREE.PerspectiveCamera,
  // except when using an AR-capable browser, the camera uses
  // the projection matrix provided from the device, so that the
  // perspective camera's depth planes and field of view matches
  // the physical camera on the device.
  camera = new THREE.ARPerspectiveCamera(
    vrDisplay,
    60,
    window.innerWidth / window.innerHeight,
    vrDisplay.depthNear,
    vrDisplay.depthFar
  );
  // VRControls is a utility from three.js that applies the device's
  // orientation/position to the perspective camera, keeping our
  // real world and virtual world in sync.
  vrControls = new THREE.VRControls(camera);
  // Bind our event handlers
  window.addEventListener('resize', onWindowResize, false);
  // Kick off the render loop!
  update();
}
/**
 * The render loop, called once per frame. Handles updating
 * our scene and rendering.
 */
function update() {
  // Clears color from the frame before rendering the camera (arView) or scene.
  renderer.clearColor();
  // Render the device's camera stream on screen first of all.
  // It allows to get the right pose synchronized with the right frame.
  arView.render();
  // Update our camera projection matrix in the event that
  // the near or far planes have updated
  camera.updateProjectionMatrix();
  // Update our perspective camera's positioning
  vrControls.update();
  // If we have not added boxes yet, and we have positional
  // information applied to our camera (it can take a few seconds),
  // and the camera's Y position is not undefined or 0, create boxes
  if (!boxesAdded && !camera.position.y) {
    addBoxes();
  }
  // Render our three.js virtual scene
  renderer.clearDepth();
  renderer.render(scene, camera);
  // Kick off the requestAnimationFrame to call this function
  // when a new VRDisplay frame is rendered
  vrDisplay.requestAnimationFrame(update);
}
/**
 * On window resize, update the perspective camera's aspect ratio,
 * and call `updateProjectionMatrix` so that we can get the latest
 * projection matrix provided from the device
 */
function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
/**
 * Once we have position information applied to our camera,
 * create some boxes at the same height as the camera
 */
function addBoxes () {
  // Create some cubes around the origin point
  for (var i = 0; i < BOX_QUANTITY; i++) {
    var angle = Math.PI * 2 * (i / BOX_QUANTITY);
    var geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(Math.cos(angle) * BOX_DISTANCE, camera.position.y - 0.25, Math.sin(angle) * BOX_DISTANCE);
    scene.add(cube);
  }
  // Flip this switch so that we only perform this once
  boxesAdded = true;
}