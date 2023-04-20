/* eslint-disable */

///// three.js /////

let container, stats, gui, params, controls;
let scene, camera, renderer;
let time = 0;
let frame = 0;
let renderRatio = 0.3;

let lights = [];
let targetBox;

// this variable for github deployment, if true, it will load local video
let local = false;

let videoTexture;


// let elapsedTime = 0;
// let frameCount = 0;

// const clock = new THREE.Clock();

function initTHREE() {
  params = {
    near: 1,
    far: 300,
  };
  // scene
  scene = new THREE.Scene();
  // let bgTexture = new THREE.TextureLoader().load("public/bg.jpg");
  // bgTexture.minFilter = THREE.LinearFilter;
  // // repeat texture
  // bgTexture.wrapS = THREE.RepeatWrapping;
  // scene.background = bgTexture;


  // let videoSrc = `./assets/videos/video_plane.mp4`;
  // if (!local) videoSrc = `https://github.com/Averyyy/Frogrey-Club/blob/master/assets/videos/video1.mp4?raw=true`

  // const videoBg = document.createElement("video");
  // // console.log(videoSrc);
  // videoBg.src = videoSrc;
  // videoBg.loop = true;
  // videoBg.muted = true;
  // videoBg.play();
  // videoTexture = new THREE.VideoTexture(videoBg);
  // videoTexture.minFilter = THREE.LinearFilter;
  // videoTexture.magFilter = THREE.LinearFilter;
  // videoTexture.format = THREE.RGBAeeeFormat;
  // scene.background = videoTexture;





  targetBox = getBox();
  scene.add(targetBox);
  targetBox.visible = false;

  let tLight = new Light();
  tLight.setPosition(0, 30, 0);
  tLight.light.target = targetBox;
  lights.push(tLight);

  // camera (fov, ratio, near, far)
  camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 20, 20);
  camera.layers.enable(1);

  // set the rotation of the camera to horizonal ... not working for some reason
  camera.rotation.x = -Math.PI / 2;

  // renderer
  // renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#333333");
  renderer.setPixelRatio(window.devicePixelRatio * renderRatio); //set pixel ratio to 1/2
  renderer.setSize(window.innerWidth, window.innerHeight);

  // container
  container = document.getElementById("container-three");
  container.appendChild(renderer.domElement);

  // controls
  // let controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls = new THREE.PointerLockControls(camera, renderer.domElement);
  controls = new THREE.FlyControls(camera, renderer.domElement);
  // scene.add(controls.getObject());

  // COMPOSER
  renderScene = new THREE.RenderPass(scene, camera);

  effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
  effectFXAA.uniforms.resolution.value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.2;
  bloomPass.strength = 1;
  bloomPass.radius = 1.5;
  bloomPass.renderToScreen = true;

  composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);

  composer.addPass(renderScene);
  composer.addPass(effectFXAA);
  composer.addPass(bloomPass);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.toneMappingExposure = Math.pow(0.4, 3.0);

  // stats
  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  container.appendChild(stats.dom);

  //AmbientLight
  Ambient = new THREE.AmbientLight(0x404040, 0.5);
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

  // Update elapsedTime and frameCount
  // elapsedTime += clock.getDelta();
  // frameCount++;

  // // Calculate and display frame rate every second
  // if (elapsedTime >= 1) {
  //   const frameRate = frameCount / elapsedTime;
  //   // console.log("Frame rate:", frameRate);
  //   elapsedTime = 0;
  //   frameCount = 0;
  //   if (frameRate < 60) {
  //     renderRatio = 0.5;
  //     renderer.setPixelRatio(window.devicePixelRatio * renderRatio);
  //   }
  // }

  updateTHREE();
  // // update the lights
  for (let l of lights) {
    //l.move();
    l.update();
  }
  // update the target position
  let frequency = frame * 0.01;
  let radialDistance = 20;
  targetBox.position.x = cos(frequency) * radialDistance;
  targetBox.position.z = sin(frequency) * radialDistance;

  renderer.autoClear = false;
  renderer.clear();

  camera.layers.set(1);
  composer.render();

  renderer.clearDepth();
  camera.layers.set(0);
  renderer.render(scene, camera);
}

// event listeners
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
