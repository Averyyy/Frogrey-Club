/* eslint-disable */

///// three.js /////

let container, stats, gui, params, controls;
let scene, camera, renderer;
let time = 0;
let frame = 0;
const renderRatio = 0.5;

function initTHREE() {

  params = {
    near: 1,
    far: 300,
  }
  // scene
  scene = new THREE.Scene();
  let bgTexture = new THREE.TextureLoader().load("public/bg.jpg");
  bgTexture.minFilter = THREE.LinearFilter;
  // repeat texture
  bgTexture.wrapS = THREE.RepeatWrapping;
  scene.background = bgTexture;



  // camera (fov, ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 20, 20);

  // set the rotation of the camera to horizonal ... not working for some reason
  camera.rotation.x = -Math.PI / 2;



  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x111111);
  renderer.setPixelRatio(window.devicePixelRatio * renderRatio);   //set pixel ratio to 1/2
  renderer.setSize(window.innerWidth, window.innerHeight);

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls
  // let controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls = new THREE.PointerLockControls(camera, renderer.domElement);
  controls = new THREE.FlyControls(camera, renderer.domElement);
  // scene.add(controls.getObject());




  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);

  //AmbientLight
  Ambient = new THREE.AmbientLight(0x404040, 1);
  scene.add(Ambient);

  // //DirectionalLight
  // sunLight = new THREE.DirectionalLight(0xffffff, 0.2);
  // sunLight.position.set(0, 10, 0);
  // scene.add(sunLight);
  setupTHREE();
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  stats.update();
  time = performance.now();
  frame++;


  updateTHREE();
  renderer.render(scene, camera);
}

// event listeners
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}