function getPlane(mode) {

    if (mode == 'ground') {
        const geometry = new THREE.PlaneGeometry(WORLD_HALF_SIZE * 2, WORLD_HALF_SIZE * 2, 32);
        // const texture = new THREE.TextureLoader().load('public/marble.jpg');
        const material = new THREE.MeshPhysicalMaterial({
            side: THREE.DoubleSide,
            // shininess: 150,
            // map: texture
            // color: 0xe47200
            metalness: 0.6, // won't work with transmission
            roughness: 0.3,
            transmission: 0.5, // Add transparency (a little more than that)
            thickness: 0.5, // Add refraction!
            // envMap: hdr

        });
        const mesh = new THREE.Mesh(geometry, material);

        // let posArray = geometry.attributes.position.array;
        // for (let i = 0; i < posArray.length; i += 3) {
        //     let x = posArray[i + 0];
        //     let y = posArray[i + 1];
        //     let z = posArray[i + 2];

        //     let xOffset = (x + WORLD_HALF_SIZE) * 0.02;
        //     let yOffset = (y + WORLD_HALF_SIZE) * 0.02;
        //     let amp = 3;
        //     let noiseValue = (noise(xOffset, yOffset) * amp) ** 3;

        //     posArray[i + 2] = noiseValue; // update the z value.
        // }
        scene.add(mesh);
        return mesh;
    } else if (mode == 'screen') {
        console.log(mode);
        const geometry = new THREE.PlaneGeometry(screenSize, 9 * screenSize / 16, 32);
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);
        return mesh;
    }
}

function getBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
        //color: 0xFFFFFF
    });
    const mesh = new THREE.Mesh(geometry, material);
    // mesh.castShadow = true; //default is false
    // mesh.receiveShadow = true; //default is false

    return mesh;
}

function LaserBeam(iconfig) {

    var config = {
        length: 1000,
        reflectMax: 1
    };
    config = { ...config, ...iconfig };

    this.object3d = new THREE.Object3D();
    this.reflectObject = null;
    this.pointLight = new THREE.PointLight(0xffffff, 2, 100);
    var raycaster = new THREE.Raycaster();
    var canvas = generateLaserBodyCanvas();
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    //texture
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        color: 0x4444aa,
        side: THREE.DoubleSide,
        depthWrite: false,
        transparent: true
    });
    var geometry = new THREE.PlaneGeometry(1, 0.1 * 5);
    geometry.rotateY(0.5 * Math.PI);

    //use planes to simulate laserbeam
    var i, nPlanes = 15;
    for (i = 0; i < nPlanes; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 1 / 2;
        mesh.rotation.z = i / nPlanes * Math.PI;
        this.object3d.add(mesh);
    }

    if (config.reflectMax > 0)
        this.reflectObject = new LaserBeam({
            ...config, ...{
                reflectMax: config.reflectMax - 1
            }
        });


    this.intersect = function (direction, objectArray = []) {

        raycaster.set(
            this.object3d.position.clone(),
            direction.clone().normalize()
        );

        var intersectArray = [];
        intersectArray = raycaster.intersectObjects(objectArray, true);

        //have collision
        if (intersectArray.length > 0) {
            this.object3d.scale.z = intersectArray[0].distance;
            this.object3d.lookAt(intersectArray[0].point.clone());
            this.pointLight.visible = true;

            //get normal vector
            var normalMatrix = new THREE.Matrix3().getNormalMatrix(intersectArray[0].object.matrixWorld);
            var normalVector = intersectArray[0].face.normal.clone().applyMatrix3(normalMatrix).normalize();

            //set pointLight under plane
            this.pointLight.position.x = intersectArray[0].point.x + normalVector.x * 0.5;
            this.pointLight.position.y = intersectArray[0].point.y + normalVector.y * 0.5;
            this.pointLight.position.z = intersectArray[0].point.z + normalVector.z * 0.5;

            //calculation reflect vector
            var reflectVector = new THREE.Vector3(
                intersectArray[0].point.x - this.object3d.position.x,
                intersectArray[0].point.y - this.object3d.position.y,
                intersectArray[0].point.z - this.object3d.position.z
            ).normalize().reflect(normalVector);

            //set reflectObject
            if (this.reflectObject != null) {
                this.reflectObject.object3d.visible = true;
                this.reflectObject.object3d.position.set(
                    intersectArray[0].point.x,
                    intersectArray[0].point.y,
                    intersectArray[0].point.z
                );

                //iteration reflect
                this.reflectObject.intersect(reflectVector.clone(), objectArray);
            }
        }
        //non collision
        else {
            this.object3d.scale.z = config.length;
            this.pointLight.visible = false;
            this.object3d.lookAt(
                this.object3d.position.x + direction.x,
                this.object3d.position.y + direction.y,
                this.object3d.position.z + direction.z
            );

            this.hiddenReflectObject();
        }
    }

    this.hiddenReflectObject = function () {
        if (this.reflectObject != null) {
            this.reflectObject.object3d.visible = false;
            this.reflectObject.pointLight.visible = false;
            this.reflectObject.hiddenReflectObject();
        }
    }

    this.setColor = function (color) {
        material.color.setHex(color);
        this.pointLight.color.setHex(color);
    }
    this.off = function () {
        this.hiddenReflectObject();
        this.object3d.visible = false;
        this.pointLight.visible = false;
    }
    this.on = function () {
        this.object3d.visible = true;
        this.pointLight.visible = true;
    }
    this.setIntensity = function (intensity) {
        this.object3d.opacity = map(intensity, 0, 5, 0, 1);
        this.pointLight.intensity = intensity;
    }

    return;

    function generateLaserBodyCanvas() {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 64;
        // set gradient
        var gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(  0,  0,  0,0.1)');
        gradient.addColorStop(0.1, 'rgba(160,160,160,0.3)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.9, 'rgba(160,160,160,0.3)');
        gradient.addColorStop(1.0, 'rgba(  0,  0,  0,0.1)');
        // fill the rectangle
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // return the just built canvas 
        return canvas;
    }

}

function LaserBeamWithoutLight(iconfig) {

    var config = {
        length: 1000,
        reflectMax: 1
    };
    config = { ...config, ...iconfig };

    this.object3d = new THREE.Object3D();
    this.reflectObject = null;
    // this.pointLight = new THREE.PointLight(0xffffff, 2, 100);
    var raycaster = new THREE.Raycaster();
    var canvas = generateLaserBodyCanvas();
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    //texture
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        color: 0x4444aa,
        side: THREE.DoubleSide,
        depthWrite: false,
        transparent: true
    });
    var geometry = new THREE.PlaneGeometry(1, 0.1 * 5);
    geometry.rotateY(0.5 * Math.PI);

    //use planes to simulate laserbeam
    var i, nPlanes = 15;
    for (i = 0; i < nPlanes; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 1 / 2;
        mesh.rotation.z = i / nPlanes * Math.PI;
        this.object3d.add(mesh);
    }

    if (config.reflectMax > 0)
        this.reflectObject = new LaserBeam({
            ...config, ...{
                reflectMax: config.reflectMax - 1
            }
        });


    this.intersect = function (direction, objectArray = []) {

        raycaster.set(
            this.object3d.position.clone(),
            direction.clone().normalize()
        );

        var intersectArray = [];
        intersectArray = raycaster.intersectObjects(objectArray, true);

        //have collision
        if (intersectArray.length > 0) {
            this.object3d.scale.z = intersectArray[0].distance;
            this.object3d.lookAt(intersectArray[0].point.clone());
            // this.pointLight.visible = true;

            //get normal vector
            var normalMatrix = new THREE.Matrix3().getNormalMatrix(intersectArray[0].object.matrixWorld);
            var normalVector = intersectArray[0].face.normal.clone().applyMatrix3(normalMatrix).normalize();

            //set pointLight under plane
            // this.pointLight.position.x = intersectArray[0].point.x + normalVector.x * 0.5;
            // this.pointLight.position.y = intersectArray[0].point.y + normalVector.y * 0.5;
            // this.pointLight.position.z = intersectArray[0].point.z + normalVector.z * 0.5;

            //calculation reflect vector
            // var reflectVector = new THREE.Vector3(
            //     intersectArray[0].point.x - this.object3d.position.x,
            //     intersectArray[0].point.y - this.object3d.position.y,
            //     intersectArray[0].point.z - this.object3d.position.z
            // ).normalize().reflect(normalVector);

            // //set reflectObject
            // if (this.reflectObject != null) {
            //     this.reflectObject.object3d.visible = true;
            //     this.reflectObject.object3d.position.set(
            //         intersectArray[0].point.x,
            //         intersectArray[0].point.y,
            //         intersectArray[0].point.z
            //     );

            //     //iteration reflect
            //     this.reflectObject.intersect(reflectVector.clone(), objectArray);
            // }
        }
        //non collision
        else {
            this.object3d.scale.z = config.length;
            // this.pointLight.visible = false;
            this.object3d.lookAt(
                this.object3d.position.x + direction.x,
                this.object3d.position.y + direction.y,
                this.object3d.position.z + direction.z
            );

            this.hiddenReflectObject();
        }
    }

    this.hiddenReflectObject = function () {
        if (this.reflectObject != null) {
            this.reflectObject.object3d.visible = false;
            this.reflectObject.pointLight.visible = false;
            this.reflectObject.hiddenReflectObject();
        }
    }

    this.setColor = function (color) {
        material.color.setHex(color);
        // this.pointLight.color.setHex(color);
    }
    this.off = function () {
        this.hiddenReflectObject();
        this.object3d.visible = false;
        // this.pointLight.visible = false;
    }
    this.on = function () {
        this.object3d.visible = true;
        // this.pointLight.visible = true;
    }

    return;

    function generateLaserBodyCanvas() {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 64;
        // set gradient
        var gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(  0,  0,  0,0.1)');
        gradient.addColorStop(0.1, 'rgba(160,160,160,0.3)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.9, 'rgba(160,160,160,0.3)');
        gradient.addColorStop(1.0, 'rgba(  0,  0,  0,0.1)');
        // fill the rectangle
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // return the just built canvas 
        return canvas;
    }

}
function add2Scene(obj) {
    scene.add(obj.object3d);
    scene.add(obj.pointLight);

    // if (obj.reflectObject != null) {
    //     add2Scene(obj.reflectObject);
    // }
}

class Cube {
    constructor() {
        this.pos = createVector();
        this.vel = createVector();
        this.acc = createVector();
        this.scl = createVector(1, 1, 1);
        this.mass = this.scl.x * this.scl.y * this.scl.z;
        this.rot = createVector();
        this.rotVel = createVector();
        this.rotAcc = createVector();
        this.mesh = getBox();
    }
    setPosition(x, y, z) {
        this.pos = createVector(x, y, z);
        return this;
    }
    setTranslation(x, y, z) {
        this.mesh.geometry.translate(x, y, z);
        return this;
    }
    setVelocity(x, y, z) {
        this.vel = createVector(x, y, z);
        return this;
    }
    setRotationAngle(x, y, z) {
        this.rot = createVector(x, y, z);
        return this;
    }
    setRotationVelocity(x, y, z) {
        this.rotVel = createVector(x, y, z);
        return this;
    }
    setScale(w, h = w, d = w) {
        const minScale = 0.01;
        if (w < minScale) w = minScale;
        if (h < minScale) h = minScale;
        if (d < minScale) d = minScale;
        this.scl = createVector(w, h, d);
        this.mass = this.scl.x * this.scl.y * this.scl.z;
        return this;
    }
    move() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    rotate() {
        this.rotVel.add(this.rotAcc);
        this.rot.add(this.rotVel);
        this.rotAcc.mult(0);
    }
    applyForce(f) {
        let force = f.copy();
        force.div(this.mass);
        this.acc.add(force);
    }
    update() {
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.mesh.rotation.set(this.rot.x, this.rot.y, this.rot.z);
        this.mesh.scale.set(this.scl.x, this.scl.y, this.scl.z);
    }
}

class Laser {
    constructor() {
        this.pos = createVector();
        this.dir = createVector();
        this.color = Three.Color("rgb(255, 255, 255)");
        this.intensity = 1; //from 0 to 256
        this.mesh = new getLaser();
    }
    setPosition(x, y, z) {
        this.pos = createVector(x, y, z);

        return this;
    }
    setDirection(x, y, z) {
        this.dir = createVector(x, y, z);
        return this;
    }
    setColor(r, g, b) {
        this.color = Three.Color("rgb(" + r + ", " + g + ", " + b + ")");
        return this;
    }
    setIntensity(i) {
        this.intensity = i;
        return this;
    }
    update() {
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.mesh.scale.set(this.dir.x, this.dir.y, this.dir.z);
        this.mesh.material.color = this.color;
        this.mesh.material.intensity = this.intensity;
    }

}

class ThirdPersonCamera {
    constructor(camera) {
        this.camera = camera;
        this.position = new THREE.Vector3();
        this.lookAtVector = new THREE.Vector3();
        this.idealOffset = new THREE.Vector3(0, 10, 40);
        this.idealLookAt = new THREE.Vector3(0, 0, -100);
    }
    calculateOffset(target) {
        const offset = new THREE.Vector3().copy(this.idealOffset);
        offset.applyQuaternion(target.direction);
        offset.add(target.position);
        return offset;
    }
    calculateLookAt(target) {
        const lookAt = new THREE.Vector3().copy(this.idealLookAt);
        lookAt.applyQuaternion(target.direction);
        lookAt.add(target.position);
        return lookAt;
    }
    update(target) {
        const offset = this.calculateOffset(target);
        const lookAt = this.calculateLookAt(target);

        const amt = 0.05;
        this.position.lerp(offset, amt);
        this.lookAtVector.lerp(lookAt, amt);

        this.camera.position.copy(this.position);
        this.camera.lookAt(this.lookAtVector);
    }
}

class Character {
    constructor() {
        this.position = new THREE.Vector3();
        this.position.y = FLOOR_POSITION;
        this.direction = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  Math.PI * 0);
        this.moveVel = 0.5;
        this.rotateVel = 0.02;
        this.jumpVel = 0.0;
        //
        this.runAcc = 1;
        this.walkAcc = 1.0;
        this.jumpAcc = 2.3;
        this.isJumped = false;
        //
        this.mesh = getBox();
        this.mesh.scale.set(10, 20, 2);
        // scene.add(this.mesh);
        //
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            rotateLeft: false,
            rotateRight: false,
            space: false,
            shift: false,
        }
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }
    update() {
        this.rotate();
        this.move();
        this.jump();
        //
        this.mesh.position.x = this.position.x;
        this.mesh.position.y = this.position.y;
        this.mesh.position.z = this.position.z;

        this.mesh.setRotationFromQuaternion(this.direction);
        // this.mesh.rotation.x = PI/2
        // this.mesh.rotation.y = PI;
    }
    jump() {
        // if (this.keys.space) {
        if (nod) {
            if (!this.isJumped) {
                this.isJumped = true;
                this.jumpVel += this.jumpAcc;

            }
        }
        // fall
        this.position.y += this.jumpVel;
        if (this.position.y > FLOOR_POSITION) {
            this.jumpVel -= C_GRAVITY;
        } else {
            this.position.y = FLOOR_POSITION;
            this.isJumped = false;
            this.jumpVel = 0.0;
        }
    }
    move() {
        // walk or run
        if (this.keys.shift) {
            this.moveVel = this.runAcc;
        } else {
            this.moveVel = this.walkAcc;
        }

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

        // forward or backward
        // console.log(this.position)
        if (this.keys.forward) {
            const vector = new THREE.Vector3(0, 0, 1); // ***
            vector.applyQuaternion(this.direction);
            vector.normalize();
            vector.multiplyScalar(-this.moveVel); // negative
            this.position.add(vector);
        }
        if (this.keys.backward) {
            const vector = new THREE.Vector3(0, 0, 1); // ***
            vector.applyQuaternion(this.direction);
            vector.normalize();
            vector.multiplyScalar(this.moveVel); // positive
            this.position.add(vector);
        }
        // left or right
        if (this.keys.left) {
            const vector = new THREE.Vector3(1, 0, 0); // ***
            vector.applyQuaternion(this.direction);
            vector.normalize();
            vector.multiplyScalar(-this.moveVel); // negative
            this.position.add(vector);
        }
        if (this.keys.right) {
            const vector = new THREE.Vector3(1, 0, 0); // ***
            vector.applyQuaternion(this.direction);
            vector.normalize();
            vector.multiplyScalar(+this.moveVel); // positive
            this.position.add(vector);
        }
    }
    rotate() {
        // rotate left or right
        if (this.keys.rotateLeft) {
            let axis = new THREE.Vector3(0, 1, 0);
            let quaternion = new THREE.Quaternion().setFromAxisAngle(axis, this.rotateVel); // positive
            this.direction.multiply(quaternion);
        }
        if (this.keys.rotateRight) {
            let axis = new THREE.Vector3(0, 1, 0);
            let quaternion = new THREE.Quaternion().setFromAxisAngle(axis, -this.rotateVel); // negative
            this.direction.multiply(quaternion);
        }
    }
    onKeyDown(event) {
        // controls.lock(); // *** this should be triggered by user interaction
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'KeyQ':
                this.keys.rotateLeft = true;
                break;
            case 'KeyE':
                this.keys.rotateRight = true;
                break;
            case 'Space':
                this.keys.space = true;
                break;
            case 'ShiftLeft':
                this.keys.shift = true;
                break;
        }
        /*
        switch (event.keyCode) {
          case 87: // w
            this.keys.forward = true;
            break;
          case 65: // a
            this.keys.left = true;
            break;
          case 83: // s
            this.keys.backward = true;
            break;
          case 68: // d
            this.keys.right = true;
            break;
          case 32: // SPACE
            this.keys.space = true;
            break;
          case 16: // SHIFT
            this.keys.shift = true;
            break;
        }
        */
    };

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'KeyQ':
                this.keys.rotateLeft = false;
                break;
            case 'KeyE':
                this.keys.rotateRight = false;
                break;
            case 'Space':
                this.keys.space = false;
                break;
            case 'ShiftLeft':
                this.keys.shift = false;
                break;
        }
    }
};