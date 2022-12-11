const redColorMap = [0xff0000, 0xff004d, 0xff005a, 0xff0067, 0xff0074]
const blueColorMap = [0x0000ff, 0x004dff, 0x005aff, 0x0067ff, 0x0074ff]
function generate_laserBeam_locations(mode) {
    let laserbeam_left = [];
    let laserbeam_right = [];
    let laserbeam_top = [];
    let laserbeam_front_left = [];
    let laserbeam_front_right = [];
    let laserbeam_front_top = [];

    // laserbeam left positions
    if (mode == 'left') {
        for (let i = 0; i < (WORLD_HALF_SIZE * 2 / lightDensity); i++) {
            for (let j = 0; j < (WORLD_HALF_SIZE / lightDensity); j++) {
                laserbeam_left.push(
                    {
                        x: -WORLD_HALF_SIZE,
                        y: FLOOR_POSITION + 15 + j * lightDensity / 2,
                        z: -3 * WORLD_HALF_SIZE / 4 + i * lightDensity
                    }
                )
            }

        }

        return laserbeam_left;
    }

    if (mode == 'right') {
        for (let i = 0; i < (WORLD_HALF_SIZE * 2 / lightDensity); i++) {
            for (let j = 0; j < (WORLD_HALF_SIZE / lightDensity); j++) {
                laserbeam_right.push(
                    {
                        x: WORLD_HALF_SIZE,
                        y: FLOOR_POSITION + 15 + j * lightDensity / 2,
                        z: -3 * WORLD_HALF_SIZE / 4 + i * lightDensity
                    }
                )
            }

        }

        return laserbeam_right;
    }


}

function appendLaserToScene(locations, mode) {
    // console.log(mode)
    if (mode == 'left') {
        for (let i = 0; i < locations.length; i++) {
            let laserbeam = new LaserBeam({ reflectMax: 5 });
            laserbeam.object3d.position.set(locations[i].x, locations[i].y, locations[i].z);
            laserbeamLeft.push(laserbeam);
            add2Scene(laserbeam);
        }
    } else if (mode == 'right') {
        for (let i = 0; i < locations.length; i++) {
            let laserbeam = new LaserBeam({ reflectMax: 5 });
            laserbeam.object3d.position.set(locations[i].x, locations[i].y, locations[i].z);
            laserbeamRight.push(laserbeam);
            // console.log(laserbeamRight)
            add2Scene(laserbeam);
        }
    }
}

function updateLaser(mode = 'left', intensity, loudness) {
    let zMapping = map(loudness, 0, 1, 2, 2.3);
    let yMapping = -10;

    // why am I doing this? Because this p5 map function is shit!!! Even I could do better then it..
    let colorIndex = Math.floor(map(intensity, 0, 1, 0, 4));
    colorIndex = colorIndex > 4 ? 4 : colorIndex;
    colorIndex = colorIndex < 0 ? 0 : colorIndex;

    if (mode == 'left') {
        for (let i = 0; i < laserbeamLeft.length; i++) {
            laserbeamLeft[i].intersect(
                new THREE.Vector3(10, yMapping, -4.5 + Math.cos(frameCount * zMapping * Math.PI / 180) * 5),
                collisionArr
            )

            laserbeamLeft[i].hiddenReflectObject();
            // laserbeamLeft[i].setColor(0xff0000);
            laserbeamLeft[i].setColor(redColorMap[colorIndex]);
            laserbeamLeft[i].setIntensity(intensity);


        }
    }
    if (mode == 'right') {
        for (let i = 0; i < laserbeamRight.length; i++) {
            laserbeamRight[i].intersect(
                new THREE.Vector3(-10, yMapping, -4.5 + Math.cos(frameCount * zMapping * Math.PI / 180) * 3),
                collisionArr
            )

            // laserbeamRight[i].hiddenReflectObject();
            // laserbeamRight[i].setColor(0x0000ff);
            laserbeamRight[i].setColor(blueColorMap[colorIndex]);
            laserbeamRight[i].setIntensity(intensity);


        }
    }

}

function offLaser() {
    for (let i = 0; i < laserbeamLeft.length; i++) {
        laserbeamLeft[i].off();
    }
    for (let i = 0; i < laserbeamRight.length; i++) {
        laserbeamRight[i].off();
    }
}
function onLaser() {
    for (let i = 0; i < laserbeamLeft.length; i++) {
        laserbeamLeft[i].on();
    }
    for (let i = 0; i < laserbeamRight.length; i++) {
        laserbeamRight[i].on();
    }
}

function updateCameraFace(mouseX, thirdPovCam) {
    let x = map(mouseX, 0, windowWidth, -1, 1);
    // x = thirdPovCam.idealOffset.x > 100 ? 0 : x;
    // x = thirdPovCam.idealOffset.x < -100 ? 0 : x;
    // let y = map(mouseY, 0, windowHeight, -0.5, 0.5);
    x = x < 0.3 && x > -0.3 ? 0 : x;
    x = x > 1 ? 0 : x;
    x = x < -1 ? 0 : x;
    if (thirdPovCam.idealOffset.x <= 100 && thirdPovCam.idealOffset.x >= -100) {
        thirdPovCam.idealOffset.x += x;
    } else if (thirdPovCam.idealOffset.x > 100) {
        thirdPovCam.idealOffset.x = 100;
    } else if (thirdPovCam.idealOffset.x < -100) {
        thirdPovCam.idealOffset.x = -100;
    }
}