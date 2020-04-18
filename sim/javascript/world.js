import OIMO_THREE from "./OIMO_THREE.js";
const D2R = Math.PI/180;

const World = function () {
  let scene;
  let oimo_world;
  let camera;
  let renderer;

  this.setup = function (cb) {
    scene = new THREE.Scene();
    oimo_world = new OIMO.World();
    //oimo_world.setGravity(new OIMO.Vec3(0, -9.80665, 0));

    this.makeGround();
    this.makeCamera();
    this.makeRenderer();
    this.scene = scene;
    this.oimo_world = oimo_world;
  }

  this.start = function(cb){
    let prev_timestamp;
    let sim_t = 0;
    function animate(timestamp) {
      requestAnimationFrame(animate);
      if (prev_timestamp) {
        let delta_time = timestamp - prev_timestamp;
        const rate = 0.5;
        delta_time = Math.floor(delta_time * rate)
        if (20 < delta_time) {
          delta_time = 20;
        }
        while (0 < delta_time) {
          let dt = delta_time;
          if (1 < dt) { dt = 1; }
          delta_time -= dt;

          sim_t += dt;
          scene.traverse(function (obj) {
            if (obj.animate) { obj.animate(sim_t, obj); }
          });
          if (camera.animate) {
            camera.animate(sim_t, camera);
          }
          if (cb) {
            cb(sim_t);
          }
          oimo_world.step(dt / 1000.0);
        }
        for (let obj of scene.children) {
          OIMO_THREE.sync(obj);
        }
        renderer.render(scene, camera);
      }
      prev_timestamp = timestamp;
    };
    requestAnimationFrame(animate);
  }

  this.makeCamera = function() {
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      10000
    );
    if (false) {
      camera.animate = function (t) {
        const u = Math.sin(0.02 * t * D2R) * 90 + 45;
        //camera.position.x = 250*Math.sin(u*D2R);
        //camera.position.y = 150 + 50 * Math.cos(0.03*t*D2R);

        camera.position.x = dog.position.x + 200 + 100 * Math.sin(u * D2R);
        camera.position.y = dog.position.y + 200 + 100 * Math.sin(u * D2R);
        camera.position.z = dog.position.z + 300 + 100 * Math.cos(u * D2R);
        camera.lookAt(new THREE.Vector3(dog.position.x, 50, dog.position.z));
      };
    } else {
      camera.position.x = 100;
      camera.position.y = 100;
      camera.position.z = 400;
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      const controls = new THREE.OrbitControls(camera);
    }
  }

  this.makeGround = function() {
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(200, 300, 400);
    directionalLight.intensity = 2;
    scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    ambientLight.intensity = 0.5;
    scene.add(ambientLight);

    const meshNormalMaterial = new THREE.MeshNormalMaterial();
    const grayMaterial = new THREE.MeshLambertMaterial({ color: 0x444444, transparent: true, opacity: 0.8 });
    const blackMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
  
    if ("ground") {
      const w = 2000;
      const h = 10;
      const d = 500;

      const group = new THREE.Group();
      group.oimo_rigid_body_config = {
        type: OIMO.RigidBodyType.STATIC
      }

      const box1 = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), grayMaterial);
      box1.position.set(0, -h / 2, 0);
      group.add(box1);

      const box2 = new THREE.Mesh(new THREE.BoxGeometry(200, 10, 100), grayMaterial);
      box2.position.set(400, 10, 0);
      group.add(box2);

      OIMO_THREE.buildRigidBody(group);
      scene.add(group);
      oimo_world.addRigidBody(group.oimo_rigid_body);
    }

    for (let i = -20; i <= 20; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(i == 0 ? 3 : 1, 550), blackMaterial);
      l.position.set(i * 50, 0.1, 0);
      l.rotation.x -= 90 * D2R;
      scene.add(l);
    }
    for (let i = -5; i <= 5; i++) {
      let l = new THREE.Mesh(new THREE.PlaneGeometry(2050, i == 0 ? 3 : 1), blackMaterial);
      l.position.set(0, 0.1, i * 50);
      l.rotation.x -= 90 * D2R;
      scene.add(l);
    }

    const origin = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), meshNormalMaterial);
    origin.animate = (t) => {
      origin.rotation.x += 5 * D2R;
      origin.rotation.y += 8 * D2R;
    };
    scene.add(origin);
  }

  this.makeRenderer = function(){
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  }
}

export default World;
