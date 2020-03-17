const D2R = Math.PI / 180; // degree to radian

const Sim = function () {
  let camera, scene, renderer;
  let dog;

  const meshNormalMaterial = new THREE.MeshNormalMaterial();
  const redMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000, transparent: true, opacity: 0.8 });
  const greenMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
  const blueMaterial = new THREE.MeshLambertMaterial({ color: 0x0044ff, transparent: true, opacity: 0.7 });
  const blue2Material = new THREE.MeshLambertMaterial({ color: 0x0055ff, transparent: true, opacity: 0.7 });
  const blue3Material = new THREE.MeshLambertMaterial({ color: 0x0066ff, transparent: true, opacity: 0.7 });
  const yellowMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
  const orangeMaterial = new THREE.MeshLambertMaterial({ color: 0xff4400, transparent: true, opacity: 0.3 });
  const grayMaterial = new THREE.MeshLambertMaterial({ color: 0x444444, transparent: true, opacity: 0.8 });
  const whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5 });
  const blackMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });

  const SERVO_W = 27;
  const SERVO_H = 35;
  const SERVO_D = 16;
  const SERVO_AXIS_OFFSET = 7;
  const SERVO2_OFFSET = 5;
  const ARM2_H = 43;
  const ARM3_H = 57;
  const BACKBONE_W = 157;
  const BACKBONE_H = 5;
  const BACKBONE_D = 27;
  const SHOULDER_W = 27;
  const SHOULDER_H = 5;
  const SHOULDER_D = 96;
  const WAIST_W = 27;
  const WAIST_H = 5;
  const WAIST_D = 96;

  function setup() {
    makeCamera();
    makeWorld();

    dog = makeDog();

    const sp = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), yellowMaterial);
    sp.position.set(-200, 50, -100);
    scene.add(sp);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  };

  function makeCamera() {
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      10000
    );
    if (1) {
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

  function makeWorld() {
    scene = new THREE.Scene();

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(200, 300, 400);
    directionalLight.intensity = 2;
    scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    ambientLight.intensity = 0.5;
    scene.add(ambientLight);

    const plG = new THREE.PlaneGeometry(2000, 500);
    const pl = new THREE.Mesh(plG, grayMaterial);
    pl.position.set(0, 0, 0);
    pl.rotation.x -= 90 * D2R;
    scene.add(pl);
    for (let i = -20; i <= 20; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(i == 0 ? 3 : 1, 550), blackMaterial);
      l.position.set(i * 50, 2, 0);
      l.rotation.x -= 90 * D2R;
      scene.add(l);
    }
    for (let i = -5; i <= 5; i++) {
      let l = new THREE.Mesh(new THREE.PlaneGeometry(2050, i == 0 ? 3 : 1), blackMaterial);
      l.position.set(0, 2, i * 50);
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

  function makeServo() {
    const box = new THREE.Mesh(new THREE.BoxGeometry(SERVO_W, SERVO_H, SERVO_D), blueMaterial);
    const axis = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), grayMaterial); // Group

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, SERVO_W), whiteMaterial);
    bar.position.x = 3;
    bar.rotation.z += 90 * D2R;
    axis.add(bar);

    axis.position.y = SERVO_AXIS_OFFSET;
    box.add(axis);
    box.axis = axis;
    return box;
  }

  function makeLeg(front, left) {
    const servo1 = makeServo();
    const servo2 = makeServo();
    servo2.rotation.x = 180 * D2R;
    servo2.rotation.y = -90 * D2R;
    if (!left) {
      servo2.rotation.y += 180 * D2R;
    }
    servo2.position.x = -(servo1.geometry.parameters.width / 2 + servo2.geometry.parameters.depth / 2 + SERVO2_OFFSET);
    servo2.position.y = servo2.axis.position.y;
    servo1.axis.add(servo2);

    const ik_origin = new THREE.Mesh(new THREE.BoxGeometry(1, 20, 1), greenMaterial);
    ik_origin.position.x = servo2.position.x;
    ik_origin.position.y = SERVO_AXIS_OFFSET;
    servo1.add(ik_origin);

    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(SERVO_W + 0.5, ARM2_H, 10), blue3Material);
    arm2.position.y = arm2.geometry.parameters.height / 2;
    servo2.axis.add(arm2);

    const servo3 = makeServo();
    servo3.position.y = arm2.geometry.parameters.height / 2 - servo3.geometry.parameters.height / 2 + (servo3.geometry.parameters.height / 2 - servo3.axis.position.y);
    arm2.add(servo3);

    const arm3 = new THREE.Mesh(new THREE.BoxGeometry(4, ARM3_H, 4), blue2Material);
    arm3.rotation.x = 90 * D2R;
    arm3.position.z = arm3.geometry.parameters.height / 2;
    servo3.axis.add(arm3);

    if (1) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(30, 100), orangeMaterial);
      pl.position.set(0, 0, 0);
      pl.rotation.y = 90 * D2R;
      arm3.add(pl);
    }

    const foot = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), redMaterial);
    foot.position.set(0, arm3.geometry.parameters.height / 2, 0);
    arm3.add(foot);

    const leg = servo1;
    leg.servo1 = servo1;
    leg.servo2 = servo2;
    leg.servo3 = servo3;
    leg.ik_origin = ik_origin;
    leg.l1 = ARM2_H;
    leg.l2 = ARM3_H;
    leg.front = front;
    leg.left = left;

    return leg;
  }

  function makeDog() {
    const backbone = new THREE.Mesh(new THREE.BoxGeometry(BACKBONE_W, BACKBONE_H, BACKBONE_D), blueMaterial);

    if ("m5stickc") {
      const m5stickc = new THREE.Mesh(new THREE.BoxGeometry(48, 14, 24), orangeMaterial);
      m5stickc.position.set(50, 8, 0);
      const lcd = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 13), blackMaterial);
      lcd.position.set(-7, 7, 0);
      m5stickc.add(lcd);
      backbone.add(m5stickc);
    }

    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(SHOULDER_W, SHOULDER_H, SHOULDER_D), blue2Material);
    shoulder.position.set(((BACKBONE_W - SHOULDER_W) / 2), -(BACKBONE_H + SHOULDER_H) / 2, 0);
    backbone.add(shoulder);

    const waist = new THREE.Mesh(new THREE.BoxGeometry(WAIST_W, WAIST_H, WAIST_D), blue3Material);
    waist.position.set(-((BACKBONE_W - WAIST_W) / 2), -(BACKBONE_H + WAIST_H) / 2, 0);
    backbone.add(waist);

    const legs = [];
    for (let fb = 0; fb < 2; fb++) {
      for (let lr = 0; lr < 2; lr++) {
        //const leg_number = fb * 2 + lr;
        const leg = makeLeg(fb == 0, lr == 0);
        const sw = [shoulder, waist][fb];
        const h = fb == 0 ? SHOULDER_H : WAIST_H;
        const d = fb == 0 ? SHOULDER_D : WAIST_D;
        leg.position.set(0, (SERVO_H / 2 + h / 2), (d / 2 - SERVO_D / 2) * (lr * 2 - 1));
        sw.add(leg);
        legs.push(leg);

        const ik_matrix4 = new THREE.Matrix4();
        [sw, leg, leg.ik_origin].forEach((obj, index) => {
          console.log("fb=", fb, "lr=", lr, "index=", index, "position=[", obj.position.toArray().toString(), "] rotation=[", obj.rotation.toArray().toString(), "]");
          ik_matrix4.multiply((new THREE.Matrix4()).setPosition(obj.position));
          ik_matrix4.multiply((new THREE.Matrix4()).makeRotationFromEuler(obj.rotation));
        });
        console.log("fb=", fb, "lr=", lr, "ik_matrix4=[", ik_matrix4.toArray().toString(), "]");
        leg.ik_matrix4 = ik_matrix4;

        const target = new THREE.Mesh(new THREE.BoxGeometry(20, 3, 3), meshNormalMaterial);
        target.animate = (t) => {
          target.rotation.x += 5 * D2R;
          target.rotation.y += 8 * D2R;
        };
        scene.add(target);
        leg.target = target;

        const result_global = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 50), redMaterial);
        scene.add(result_global);
        leg.result_global = result_global;

        const result_local = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 1), yellowMaterial);
        leg.ik_origin.add(result_local);
        leg.result_local = result_local;
      }
    }

    const dog = backbone;
    dog.legs = legs;
    scene.add(dog);
    return dog;
  }

  let animate_callback = null;
  function animate(timestamp) {
    requestAnimationFrame(animate);
    // scene.traverse(function (obj) {
    //   if (obj instanceof THREE.Mesh === true) {
    //     if (obj.animate) { obj.animate(timestamp, obj); }
    //   }
    // });
    if (camera.animate) {
      camera.animate(timestamp, camera);
    }
    if (animate_callback) {
      animate_callback(timestamp, dog);
    }

    renderer.render(scene, camera);
  };

  function set_servo_angles(leg_number, angle1, angle2, angle3) {
    const leg = dog.legs[leg_number];
    if(leg.left){
      leg.servo1.axis.rotation.x = angle1;
      leg.servo2.axis.rotation.x = angle2;
      leg.servo3.axis.rotation.x = angle3-180*D2R;
    }else{
      leg.servo1.axis.rotation.x = -angle1;
      leg.servo2.axis.rotation.x = -angle2;
      leg.servo3.axis.rotation.x = -angle3;
    }
  }

  this.start = function (cb) {
    animate_callback = cb;
    setup();
    requestAnimationFrame(animate);
  };
  this.set_servo_angles = function () { set_servo_angles.apply(this, arguments); };
};

export default Sim;