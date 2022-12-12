const SPECNUM = 50;
const SPECWIDTH = (2 * WORLD_HALF_SIZE) / SPECNUM;

class Specturm {
  constructor() {
    this.specList = [];
    this.pastAmplitude = [];
  }
  intialize() {
    for (let i = 0; i < SPECNUM; i++) {
      const x = -WORLD_HALF_SIZE + i * SPECWIDTH;
      this.specList.push(getGlowBox(x, -WORLD_HALF_SIZE));
      this.specList.push(getGlowBox(x, WORLD_HALF_SIZE));
      const z = -WORLD_HALF_SIZE + i * SPECWIDTH;
      this.specList.push(getGlowBox(-WORLD_HALF_SIZE, z, "side"));
      this.specList.push(getGlowBox(WORLD_HALF_SIZE, z, "side"));
    }
  }
  update() {
    // given a specturm d(array of 1024), update the height of boxes in speclist
    if (spectrum) {
      // let sum_list = [];
      // for (let i=0; i<this.specList.length; i++){
      //     // sum the intevals of the spectrum based on speclist num
      //     let sum = 0;
      //     // focus on inteval from 250-600
      //     for (let j=250; j<600; j++){
      //         sum += spectrum[(j+i)%1024];
      //     }
      //     sum_list.push(sum);
      // }
      // // normalize sum list
      // let sumAvg = sum_list.reduce((a, b) => a + b, 0) / sum_list.length ;
      // let ratio = Math.log(sumAvg/1000);
      // let max = Math.max(...sum_list);
      // let min = Math.min(...sum_list);
      // let normalized_sum_list = sum_list.map(x => (x-min)/(max-min));
      // // update the height of the boxes
      // for (let i=0; i<this.specList.length; i++){
      //     this.specList[i].scale.y = normalized_sum_list[(i+frameCount)%normalized_sum_list.length]*WORLD_HALF_SIZE/4*ratio;
      // }

      this.pastAmplitude.push(FFT_MAIN_SOUND.avg);
      if (this.pastAmplitude.length > WORLD_HALF_SIZE) {
        this.pastAmplitude.shift();
      }
      let min = Math.min(...this.pastAmplitude);
      for (let i = 0; i < this.specList.length; i++) {
        let height =
          this.pastAmplitude[Math.floor(i + Math.cos(frameCount)) % this.pastAmplitude.length] -
          min;
        this.specList[i].scale.y = height * WORLD_HALF_SIZE;
      }

      // hide objects if near screen
      for (let i = 0; i < this.specList.length; i++) {
        if (
          this.specList[i].position.z === -WORLD_HALF_SIZE &&
          this.specList[i].position.x > -WORLD_HALF_SIZE + 20 &&
          this.specList[i].position.x < WORLD_HALF_SIZE - 20
        ) {
          this.specList[i].visible = false;
        } else {
          this.specList[i].visible = true;
        }
      }

      //   console.log(this.pastAmplitude);
    }
  }
}

function getGlowBox(x, z, mode) {
  let randColor = new THREE.Color(0xffffff);
  randColor.setHex(Math.random() * 0xffffff);
  let geometry = new THREE.BoxGeometry(SPECWIDTH, 5, 1);
  let material = new THREE.MeshBasicMaterial({
    color: randColor,
    wireframe: false,
    // blending: THREE.AdditiveBlending,
  });
  let mesh = new THREE.Mesh(geometry, material);
  const dimensions = mesh.geometry.parameters;
  const height = dimensions.height;
  mesh.position.x = x;
  mesh.position.y = FLOOR_POSITION + height / 2;
  mesh.position.z = z;
  if (mode === "side") {
    mesh.rotation.y = Math.PI / 2;
  }
  mesh.layers.enable(1); // ***
  scene.add(mesh);
  return mesh;
}
