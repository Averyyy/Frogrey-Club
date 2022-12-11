/* sound variables */
let P5_VISIBILITY = true;
let mic, fft;
let spectrum ;

// pos variables
let pos_array = []
let down = 0;
let nod = 0;

function setup() {
  userStartAudio();

  let canvas = createCanvas(100, 50);
  //canvas.mousePressed(userStartAudio); // ***
  canvas.parent("container-p5");
  // canvas.hide();

  background(0);
  pixelDensity(1);

  // sound
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  // three.js
  initTHREE();
  // console.log(cam);
  setupPoseNet();
}

function draw() {
  background(0);


  //update and display FFT spectrum
  spectrum = fft.analyze();
  let sumS = 0;
  let countS = 0;
  let sumB = 0;
  let countB = 0;
  for (let i = 0; i < spectrum.length; i++) {
    //
    let x = map(i, 0, spectrum.length, 0, width);
    let y = map(spectrum[i], 0, 255, height, 0);
    let amp = map(spectrum[i], 0, 255, 0.0, 1.0);

    if (i >= FFT_MAIN_SOUND.min && i <= FFT_MAIN_SOUND.max) {
      stroke(FFT_MAIN_SOUND.color);
      sumS += amp;
      countS++;
    } else if (i >= FFT_SUB_SOUND.min && i <= FFT_SUB_SOUND.max) {
      stroke(FFT_SUB_SOUND.color);
      sumB += amp;
      countB++;
    } else {
      stroke(150);
    }
    if (P5_VISIBILITY) line(x, height, x, y);
  }
  // update the average
  FFT_MAIN_SOUND.avg = 0;
  if (countS > 0) {
    FFT_MAIN_SOUND.avg = sumS / countS;
  }
  FFT_SUB_SOUND.avg = 0;
  if (countS > 0) {
    FFT_SUB_SOUND.avg = sumB / countB;
  }

  // update the differences
  FFT_MAIN_SOUND.diff = FFT_MAIN_SOUND.avg - FFT_MAIN_SOUND.pavg;
  FFT_SUB_SOUND.diff = FFT_SUB_SOUND.avg - FFT_SUB_SOUND.pavg;

  // store the previous averages
  FFT_MAIN_SOUND.pavg = FFT_MAIN_SOUND.avg;
  FFT_SUB_SOUND.pavg = FFT_SUB_SOUND.avg;

  // display the thresholds
  let ratio = width / spectrum.length;
  if (P5_VISIBILITY) {
    stroke(0, 255, 0);
    line(
      FFT_MAIN_SOUND.min * ratio,
      (1 - FFT_MAIN_SOUND.threshold) * height,
      FFT_MAIN_SOUND.max * ratio,
      (1 - FFT_MAIN_SOUND.threshold) * height
    );
    line(
      FFT_SUB_SOUND.min * ratio,
      (1 - FFT_SUB_SOUND.threshold) * height,
      FFT_SUB_SOUND.max * ratio,
      (1 - FFT_SUB_SOUND.threshold) * height
    );
  }
  updatePoseNet(); // ***
  let eyesAvgPosY = (pose.leftEye.y + pose.rightEye.y) / 2;
  // line(pose.nose.x, pose.nose.y, pose.nose.x, eyesAvgPosY);
  // line(pose.leftEye.x, pose.leftEye.y, pose.rightEye.x, pose.rightEye.y);

  let distance = pose.nose.y - eyesAvgPosY;

  if (frameCount % 10 === 0) {

    pos_array.push(distance.toFixed(2))
    while (pos_array.length > 3) {
      pos_array.shift();
    }
    // console.log(pos_array)  
  }
  // console.log(pos_array)
  if ((pos_array[0] - pos_array[1]) < -2.5) {
    // console.log("down");
    down = 1;
    nod = 0;
  } else {
    if (down === 1) {
      // console.log("nod")
      down = 0;
      nod = 1
    } else {
      nod = 0;
    }
  }

}

function mousePressed() {
  //
}

function keyPressed() {
  if (key == "h" || key == "H") {
    P5_VISIBILITY = !P5_VISIBILITY;
    let div = document.getElementById("container-p5");
    let txt = document.getElementById("text");
    if (P5_VISIBILITY) {
      div.style.display = "block";
      stats.dom.style.display = "block";
    } else {
      div.style.display = "none";
      stats.dom.style.display = "none";
    }
  }
}



