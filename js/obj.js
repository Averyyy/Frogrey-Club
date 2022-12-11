function loadFrog(filepath) {
    // load .obj file
    const loader = new THREE.OBJLoader(); // NOT! THREE.ObjectLoader();

    loader.load(
        // resource URL
        filepath,
        // onLoad callback

        // Here the loaded data is assumed to be an object
        function (obj) {
            // Add the loaded object to the scene
            frog = obj;
            for (let child of frog.children) {
                //child.material = new THREE.MeshBasicMaterial();
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0x00FF00,

                    // wireframe: true
                });
            }
            console.log(frog);
            frog.scale.x = 0.2;
            frog.scale.y = 0.2;
            frog.scale.z = 0.2;
            frog.rotation.x = -PI / 2;
            frog.position.y = FLOOR_POSITION;
            scene.add(frog);
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
        }
    );
}

function loadBar(filepath) {
    // load .obj file
    const loader = new THREE.OBJLoader(); // NOT! THREE.ObjectLoader();

    loader.load(
        // resource URL
        filepath,
        // onLoad callback

        // Here the loaded data is assumed to be an object
        function (obj) {
            // Add the loaded object to the scene
            bar = obj;
            for (let child of bar.children) {
                //child.material = new THREE.MeshBasicMaterial();
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0x00FF00,
                    // wireframe: true
                });
            }
            console.log(bar);
            bar.scale.x = 0.2;
            bar.scale.y = 0.2;
            bar.scale.z = 0.2;
            bar.rotation.x = -PI / 2;
            bar.position.y = FLOOR_POSITION;
            scene.add(bar);
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '%  bar loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
        }
    );
}
function loadSTL(filepath, x, y, z) {
    // load .stl file
    const loader = new THREE.STLLoader();

    loader.load(
        // resource URL
        filepath,
        // onLoad callback

        // Here the loaded data is assumed to be an object
        function (geometry) {
            // Add the loaded object to the scene
            let material = new THREE.MeshPhongMaterial({
                color: 0x00FF00,
                specular: 0x111111,
                shininess: 200
            });
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.rotation.set(-PI / 2, 0, 0);
            mesh.scale.set(0.2, 0.2, 0.2);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            bar_small = mesh;
            scene.add(mesh);
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded GLTF');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
        }
    );
}


function loadGLTF(filepath, x, y, z) {
    // load .gltf file
    const loader = new THREE.GLTFLoader();

    loader.load(
        // resource URL
        filepath,
        // onLoad callback

        // Here the loaded data is assumed to be an object
        function (gltf) {
            // Add the loaded object to the scene
            const material = new THREE.MeshPhysicalMaterial({
                side: THREE.DoubleSide,
                // map: texture
                // color: 0xe47200
                metalness: 0, // won't work with transmission
                roughness: 0.1,
                transmission: 0.7, // Add transparency (a little more than that)
                thickness: 0.5, // Add refraction!
                color: 0xFFFFFF,
                // wireframe: true
            });
            let model = gltf.scene;
            model.traverse((o) => {
                if (o.isMesh) {
                    o.material = material;
                }
            });
            let mesh = model;
            // mesh.material = material;
            mesh.rotation.set(0, 0, 0);
            mesh.scale.set(0.2, 0.2, 0.2);
            // mesh.position.set(x, y, z);
            mesh.position.set(x + 20, y, z + 20);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            bar_small = mesh;
            bar_small.layers.toggle(1);
            scene.add(bar_small);
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% bar loaded');
        },

        // onError callback
        function (err) {
            console.error('An error happened');
        }
    );
}

function small_jump(obj, speed) {
    if (Math.random() > 0.5 && nod) {
        obj.position.y += speed;
        if (obj.position.y > speed) {
            obj.position.y = FLOOR_POSITION + 3;
        }
    } else {
        obj.position.y -= speed;
        if (obj.position.y < FLOOR_POSITION + 3) {
            obj.position.y = FLOOR_POSITION + 3;
        }
    }

}