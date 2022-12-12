class frogAudiences {
  constructor() {
    this.frogList = [];
  }
  init() {
    this.frogList = frog_list;
  }
  update() {
    for (let i = 0; i < this.frogList.length; i++) {
      this.frogList[i].update();
    }
  }
}

class frogClass {
  constructor(mesh) {
    let random_directions = [
      Math.random() > 0.5 ? 1 : -1,
      Math.random() > 0.5 ? 1 : -1,
    ];
    this.position = new THREE.Vector3(
      Math.random() * WORLD_HALF_SIZE * random_directions[0],
      FLOOR_POSITION + 3,
      Math.random() * WORLD_HALF_SIZE * random_directions[1]
    );

    this.velocity = new THREE.Vector3(Math.random() * 1, 0, Math.random() * 1);
    this.direction = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      Math.PI * 0
    );
    this.moveVel = map(Math.random(), 0, 1, 1, 3);
    this.moveAcc = map(Math.random(), 0, 1, 0.8, 1);
    this.jumpAcc = 1.5;
    this.jumpVel = 0;
    this.isJumped = false;
    this.rotateVel = map(Math.random(), 0, 1, 0.01, 0.02);

    this.mesh = mesh;
    this.group = new THREE.Group();
    this.group.add(this.mesh);
    scene.add(this.group);
    this.initialize();
  }

  initialize() {
    this.group.position.copy(this.position);
    this.group.quaternion.copy(this.direction);
    this.group.scale.set(0.2, 0.2, 0.2);
  }
  applyGravity() {
    this.velocity.y -= 0.01;
  }
  rotate() {
    let randomRadio = Math.random() * 0.5;
    let quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      randomRadio * this.rotateVel
    );
    this.direction.multiply(quaternion);
  }
  move() {
    if (this.position.x < -WORLD_HALF_SIZE) {
      this.position.x = -WORLD_HALF_SIZE;
    }
    if (this.position.x > WORLD_HALF_SIZE) {
      this.position.x = WORLD_HALF_SIZE;
    }
    if (this.position.z < -WORLD_HALF_SIZE) {
      this.position.z = -WORLD_HALF_SIZE;
    }
    if (this.position.z > WORLD_HALF_SIZE) {
      this.position.z = WORLD_HALF_SIZE;
    }
    if (this.position.y < FLOOR_POSITION + 3) {
      this.position.y = FLOOR_POSITION + 3;
    }
    this.velocity.applyQuaternion(this.direction);
    this.velocity.normalize();
    this.velocity.multiplyScalar(this.moveVel);
    this.position.add(this.velocity);
  }
  jump() {
    if (!this.isJumped) {
      this.isJumped = true;
      this.jumpVel += this.jumpAcc;
    }

    if (this.position.y > FLOOR_POSITION + 3) {
      this.applyGravity();
    } else {
      this.position.y += this.jumpVel;
      this.isJumped = false;
      this.jumpVel = 0;
    }
  }
  random_move() {
    if (Math.random() > 0.5) {
      this.rotate();
    }
    if (Math.random() > 0.4) {
      this.jump();
    }
    if (Math.random() > 0.9) {
      this.move();
    }
  }
  update() {
    this.random_move();
    this.group.position.x = this.position.x;
    this.group.position.y = this.position.y;
    this.group.position.z = this.position.z;

    this.group.setRotationFromQuaternion(this.direction);
  }
}
