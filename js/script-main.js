const WORLD_HALF_SIZE = 100;
const FLOOR_POSITION = -20;
const screenSize = 130;
const lightDensity = 40;
// const FLOOR_HEIGHT = -10;
const C_GRAVITY = 0.2;

let ui = {
  // add yours
};

let laserbeamLeft = [];
let laserbeamRight = [];
let collisionArr = [];

let frog;
let frog_list = [];
let frog_audiences;

let user;
let bar_small;

let spec;

const FFT_MAIN_SOUND = {
  triggered: false,
  interval: false,
  intervalTime: 100,
  avg: 0.0,
  pavg: 0.0,
  diff: 0.0,
  threshold: 0.25,
  min: 20,
  max: 100,
  color: "#fb5858",
};

const FFT_SUB_SOUND = {
  triggered: false,
  interval: false,
  intervalTime: 30,
  avg: 0.0,
  pavg: 0.0,
  diff: 0.0,
  threshold: 0.25,
  min: 200,
  max: 250,
  color: "#ff0065",
};

function setupTHREE() {
  setupGUI();

  // load the model
  loadFrog("assets/frog.obj");
  // for (let i = 0; i < 10; i++) {
  //   loadSTL("assets/frog.stl", -50 + i * 10, FLOOR_POSITION + 3, 0);
  //   loadSTL("assets/frog.stl", -50 + i * 10, FLOOR_POSITION + 3, 10);
  //   loadSTL("assets/frog.stl", -50 + i * 10, FLOOR_POSITION + 3, -10);
  // }
  for (let i = 0; i < 100; i++) {
    load_frogs();
  }
  loadGLTF(
    "assets/bar_counter/scene.gltf",
    -WORLD_HALF_SIZE,
    FLOOR_POSITION,
    -WORLD_HALF_SIZE
  );
  // loadBar("assets/bar.obj");
  // console.log(bar_small)

  // ground
  let plane = getPlane("ground");
  plane.position.y = FLOOR_POSITION;
  plane.rotation.x = -PI / 2;
  // plane.layers.enable(1);
  collisionArr.push(plane);
  // screen
  let screen = getPlane("screen");
  screen.position.y = FLOOR_POSITION + (9 * screenSize) / 32;
  screen.position.z = -WORLD_HALF_SIZE;
  collisionArr.push(screen);

  // Character
  user = new Character();

  // 3rd person camera
  thirdPovCam = new ThirdPersonCamera(camera, params);

  frog_audiences = new frogAudiences();
  frog_audiences.init();

  spec = new Specturm();
  spec.intialize();
  // laserbeam left positions
  appendLaserToScene(generate_laserBeam_locations("left"), "left");
  // laserbeam right positions
  appendLaserToScene(generate_laserBeam_locations("right"), "right");
}

function updateTHREE() {
  // console.log(FFT_MAIN_SOUND)
  let soundDiff = map(FFT_MAIN_SOUND.diff, -0.01, 0.01, 0, 2);
  updateAudioInput();
  if (FFT_MAIN_SOUND.avg > 0.2) {
    onLaser();
    updateLaser("left", soundDiff, FFT_MAIN_SOUND.avg);
    updateLaser("right", soundDiff, FFT_MAIN_SOUND.avg);
  } else {
    offLaser();
  }
  user.update();
  thirdPovCam.update(user);
  spec.update();
  frog_audiences.update();

  // updateCameraFace(mouseX, thirdPovCam);

  // for (let i = 0; i < frog_list.length; i++) {
  //   small_jump(frog_list[i], 3);
  // }
  if (bar_small != undefined) {
    // bar_small.layers.set(1);
  }

  //
}

function getBox() {
  const geometry = new THREE.BoxGeometry(30, 30, 30);
  const material = new THREE.MeshNormalMaterial({
    color: 0x00ff00,
    wireframe: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

function updateAudioInput() {
  // MAIN
  if (
    FFT_MAIN_SOUND.avg >= FFT_MAIN_SOUND.threshold &&
    FFT_MAIN_SOUND.diff > 0 &&
    !FFT_MAIN_SOUND.interval
  ) {
    FFT_MAIN_SOUND.triggered = true;
    // interval
    FFT_MAIN_SOUND.interval = true;
    setTimeout(() => {
      FFT_MAIN_SOUND.interval = false;
    }, FFT_MAIN_SOUND.intervalTime);
  } else {
    FFT_MAIN_SOUND.triggered = false;
  }
  // SUB
  if (
    FFT_SUB_SOUND.avg >= FFT_SUB_SOUND.threshold &&
    FFT_SUB_SOUND.diff > 0 &&
    !FFT_SUB_SOUND.interval
  ) {
    FFT_SUB_SOUND.triggered = true;
    // interval
    FFT_SUB_SOUND.interval = true;
    setTimeout(() => {
      FFT_SUB_SOUND.interval = false;
    }, FFT_SUB_SOUND.intervalTime);
  } else {
    FFT_SUB_SOUND.triggered = false;
  }
}

function setupGUI() {
  // gui
  gui = new dat.gui.GUI();

  let folderMainSound = gui.addFolder("MAIN SOUND");
  folderMainSound.open();
  folderMainSound.add(FFT_MAIN_SOUND, "triggered").listen();
  folderMainSound.add(FFT_MAIN_SOUND, "avg", 0, 1.0).step(0.01).listen();
  folderMainSound.add(FFT_MAIN_SOUND, "diff", 0, 1.0).step(0.01).listen();

  let folderMainSoundConfig = gui.addFolder("MAIN SOUND CONFIG");
  folderMainSoundConfig
    .add(FFT_MAIN_SOUND, "threshold", 0.0, 1.0)
    .step(0.01)
    .listen();
  folderMainSoundConfig
    .add(FFT_MAIN_SOUND, "min", 0, 1023)
    .step(1)
    .listen()
    .onChange(() => {
      FFT_MAIN_SOUND.min =
        FFT_MAIN_SOUND.min > FFT_MAIN_SOUND.max
          ? FFT_MAIN_SOUND.max - 1
          : FFT_MAIN_SOUND.min;
    });
  folderMainSoundConfig
    .add(FFT_MAIN_SOUND, "max", 0, 1023)
    .step(1)
    .listen()
    .onChange(() => {
      FFT_MAIN_SOUND.max =
        FFT_MAIN_SOUND.max < FFT_MAIN_SOUND.min
          ? FFT_MAIN_SOUND.min + 1
          : FFT_MAIN_SOUND.max;
    });

  let folderSubSound = gui.addFolder("SUB SOUND");
  folderSubSound.open();
  folderSubSound.add(FFT_SUB_SOUND, "triggered").listen();
  folderSubSound.add(FFT_SUB_SOUND, "avg", 0, 1.0).step(0.01).listen();
  folderSubSound.add(FFT_SUB_SOUND, "diff", 0, 1.0).step(0.01).listen();

  let folderSubSoundConfig = gui.addFolder("SUB SOUND CONFIG");
  folderSubSoundConfig
    .add(FFT_SUB_SOUND, "threshold", 0.0, 1.0)
    .step(0.01)
    .listen()
    .onChange(() => {});
  folderSubSoundConfig
    .add(FFT_SUB_SOUND, "min", 0, 1023)
    .step(1)
    .listen()
    .onChange(() => {
      FFT_SUB_SOUND.min =
        FFT_SUB_SOUND.min > FFT_SUB_SOUND.max
          ? FFT_SUB_SOUND.max - 1
          : FFT_SUB_SOUND.min;
    });
  folderSubSoundConfig
    .add(FFT_SUB_SOUND, "max", 0, 1023)
    .step(1)
    .listen()
    .onChange(() => {
      FFT_SUB_SOUND.max =
        FFT_SUB_SOUND.max < FFT_SUB_SOUND.min
          ? FFT_SUB_SOUND.min + 1
          : FFT_SUB_SOUND.max;
    });

  let folderVisuals = gui.addFolder("VISUALS");
  // add yours
}
