import Const from "./const.js";
import OIMO_THREE from "./OIMO_THREE.js";
const D2R = Const.D2R;

const Sim = function () {
  let camera, scene, renderer;
  let dog;
  let oimo_world;

  const meshNormalMaterial = new THREE.MeshNormalMaterial();
  const redMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000, transparent: true, opacity: 0.8 });
  const greenMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 1.0 });
  const blueMaterial = new THREE.MeshLambertMaterial({ color: 0x0044ff, transparent: true, opacity: 0.7 });
  const blue2Material = new THREE.MeshLambertMaterial({ color: 0x0055ff, transparent: true, opacity: 0.7 });
  const blue3Material = new THREE.MeshLambertMaterial({ color: 0x0066ff, transparent: true, opacity: 0.7 });
  const yellowMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
  const orangeMaterial = new THREE.MeshLambertMaterial({ color: 0xff4400, transparent: true, opacity: 0.3 });
  const grayMaterial = new THREE.MeshLambertMaterial({ color: 0x444444, transparent: true, opacity: 0.8 });
  const whiteMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.5 });
  const blackMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
  const wireframeMaterial = new THREE.MeshPhongMaterial({ color: 0x00FFFF, wireframe: true });
  const redWireframeMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, wireframe: true });
  const yellowWireframeMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00, wireframe: true });
  const matRed = new THREE.MeshLambertMaterial({
    color: 0xff0000
  });
  const matGreen = new THREE.MeshLambertMaterial({
    color: 0x00ff00
  });
  const matBlue = new THREE.MeshLambertMaterial({
    color: 0x0000ff
  });

  const SERVO_W = 27;
  const SERVO_H = 35;
  const SERVO_D = 16;
  const SERVO_AXIS_OFFSET = 7;
  const SERVO2_OFFSET_X = 5;
  const SERVO2_OFFSET_Y = Const.L0;
  const ARM2_H = Const.L1;
  const ARM3_H = Const.L2;
  const BACKBONE_W = 157;
  const BACKBONE_H = 5;
  const BACKBONE_D = 27;
  const SHOULDER_OFFSET = -30;
  const SHOULDER_W = 27;
  const SHOULDER_H = 5;
  const SHOULDER_D = 96;
  const WAIST_W = 27;
  const WAIST_H = 5;
  const WAIST_D = 96;

  function setup() {
    oimo_world = new OIMO.World();
    //oimo_world.setGravity(new OIMO.Vec3(0, -9.80665, 0));
    makeCamera();
    makeWorld();
    dog = makeDog();
    makeObjects();

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

  function makeWorld() {
    scene = new THREE.Scene();

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(200, 300, 400);
    directionalLight.intensity = 2;
    scene.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
    ambientLight.intensity = 0.5;
    scene.add(ambientLight);

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

  function makeServo() {
    // blueMaterial
    const box = new THREE.Mesh(new THREE.BoxGeometry(SERVO_W, SERVO_H, SERVO_D), wireframeMaterial);
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
    if (left) {
      servo2.rotation.y = -90 * D2R;
    } else {
      servo2.rotation.y = 90 * D2R;
    }
    servo2.rotation.z = 180 * D2R;

    servo2.position.x = -(servo1.geometry.parameters.width / 2 + servo2.geometry.parameters.depth / 2 + SERVO2_OFFSET_X);
    servo2.position.y = -SERVO_AXIS_OFFSET + SERVO2_OFFSET_Y;
    servo1.axis.add(servo2);

    const ik_origin = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), greenMaterial);
    ik_origin.position.x = servo2.position.x;
    ik_origin.position.y = SERVO_AXIS_OFFSET;
    servo1.add(ik_origin);

    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(SERVO_W + 0.5, ARM2_H, 10), blue3Material);
    arm2.position.y = arm2.geometry.parameters.height / 2;
    servo2.axis.add(arm2);

    const servo3 = makeServo();
    servo3.position.y = arm2.geometry.parameters.height / 2 - servo3.geometry.parameters.height / 2 + (servo3.geometry.parameters.height / 2 - SERVO_AXIS_OFFSET);
    arm2.add(servo3);

    const arm3 = new THREE.Mesh(new THREE.BoxGeometry(4, ARM3_H, 4), blue2Material);
    arm3.position.y = arm3.geometry.parameters.height / 2;
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
    leg.l0 = Const.L0;

    return leg;
  }

  function makeDog() {
    const dog = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 20), yellowMaterial);
    const backbone = new THREE.Mesh(new THREE.BoxGeometry(BACKBONE_W, BACKBONE_H, BACKBONE_D), blueMaterial);
    dog.add(backbone);

    if ("m5stickc") {
      const m5stickc = new THREE.Mesh(new THREE.BoxGeometry(48, 14, 24), orangeMaterial);
      const lcd = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 13), blackMaterial);
      m5stickc.add(lcd);
      lcd.position.set(-7, 7, 0);
      backbone.add(m5stickc);
      m5stickc.rotation.x = 180 * D2R;
      m5stickc.position.set(50, -8, 0);
    }

    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(SHOULDER_W, SHOULDER_H, SHOULDER_D), blue2Material);
    shoulder.position.set(((BACKBONE_W - SHOULDER_W) / 2) + SHOULDER_OFFSET, (BACKBONE_H + SHOULDER_H) / 2, 0);
    backbone.add(shoulder);

    const waist = new THREE.Mesh(new THREE.BoxGeometry(WAIST_W, WAIST_H, WAIST_D), blue3Material);
    waist.position.set(-((BACKBONE_W - WAIST_W) / 2), (BACKBONE_H + WAIST_H) / 2, 0);
    backbone.add(waist);

    const legs = [];
    for (let fb = 0; fb < 2; fb++) {
      for (let lr = 0; lr < 2; lr++) {
        //const leg_number = fb * 2 + lr;
        const leg = makeLeg(fb == 0, lr == 0);
        const sw = [shoulder, waist][fb];
        const h = fb == 0 ? SHOULDER_H : WAIST_H;
        const d = fb == 0 ? SHOULDER_D : WAIST_D;
        leg.position.set(0, -(SERVO_H / 2 + h / 2), (d / 2 - SERVO_D / 2) * (lr * 2 - 1));
        leg.rotation.x = 180 * D2R;
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

    dog.backbone = backbone;
    dog.legs = legs;
    scene.add(dog);

    if (1) {
      const target = new THREE.Mesh(new THREE.BoxGeometry(BACKBONE_W, BACKBONE_H, BACKBONE_D), yellowWireframeMaterial);
      scene.add(target);
      dog.target = target;
    }

    return dog;
  }

  const makeObjects = function () {
    if ("yellow-ball") {
      const sp1 = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), yellowMaterial);
      sp1.position.set(-200, 150, -100);
      //sp1.oimo_shape_config = {}
      OIMO_THREE.buildRigidBody(sp1);
      scene.add(sp1);
      sp1.oimo_rigid_body.name = "yb";
      oimo_world.addRigidBody(sp1.oimo_rigid_body);
    }

    const make_ball = function (parent, local, r, color) {
      const group = new THREE.Group();
      const sp1 = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), new THREE.MeshLambertMaterial({
        color: color
      }));
      sp1.position.set(local.x, local.y, local.z);
      sp1.oimo_shape_config = {
        //density: 0, // Kg/m^3
        //restitution: 1,
      }
      group.add(sp1);
      group.position.set(parent.x, parent.y, parent.z);

      OIMO_THREE.buildRigidBody(group);
      scene.add(group);
      oimo_world.addRigidBody(group.oimo_rigid_body);
      return group;
    }
    const b1 = make_ball({ "x": -150, "y": 100, "z": 0 }, { "x": 0, "y": 0, "z": 0 }, 5, 0xff0000);
    const b2 = make_ball({ "x": -100, "y": 100, "z": 0 }, { "x": 0, "y": 0, "z": 1 }, 10, 0x00ff00);
    const b3 = make_ball({ "x": 100, "y": 100, "z": 0 }, { "x": 0, "y": 0, "z": -10 }, 20, 0xffff00);
    const b4 = make_ball({ "x": 200, "y": 100, "z": 0 }, { "x": 0, "y": 0, "z": 0 }, 40, 0x0000ff);

    if ("T") {
      if (".") {
        const group = new THREE.Group();
        group.oimo_rigid_body_config = {
          type: OIMO.RigidBodyType.STATIC
        }

        group.position.x = 200;
        group.position.z = 100;

        const box1 = new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), new THREE.MeshLambertMaterial({
          color: 0xffff00
        }));
        group.add(box1);

        OIMO_THREE.buildRigidBody(group);
        scene.add(group);
        oimo_world.addRigidBody(group.oimo_rigid_body);
      }

      const rotate = 22;
      if ("|") {
        const group = new THREE.Group();
        group.oimo_rigid_body_config = {
          //type: OIMO.RigidBodyType.STATIC
        }
        group.position.set(200, 0, 100);
        group.rotation.y = rotate * Math.PI / 180;

        const size = 10;
        const box1 = new THREE.Mesh(new THREE.BoxGeometry(size, 50, size), new THREE.MeshLambertMaterial({
          color: 0xff4400
        }));
        box1.position.set(45, 25, 0);
        group.add(box1);

        OIMO_THREE.buildRigidBody(group);
        scene.add(group);
        oimo_world.addRigidBody(group.oimo_rigid_body);
      }
      if ("-") {
        const group = new THREE.Group();
        group.rotation.y = rotate * Math.PI / 180;

        const box1 = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), matRed);
        group.add(box1);

        const box2 = new THREE.Mesh(new THREE.BoxGeometry(90, 10, 10), matBlue);
        box2.position.set(50, 0, 0);
        group.add(box2);

        group.position.x = 200;
        group.position.y = 70;
        group.position.z = 100;

        OIMO_THREE.buildRigidBody(group);
        scene.add(group);
        oimo_world.addRigidBody(group.oimo_rigid_body);
      }
      if ("/") {
        const box1 = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), matBlue);
        box1.rotation.y = rotate * Math.PI / 180;

        const box2 = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 10), matRed);
        box2.position.set(25, 0, 0);

        const box3 = new THREE.Mesh(new THREE.BoxGeometry(50, 10, 10), matGreen);
        box3.position.set(45, 0, 0);

        box1.add(box2);
        box2.add(box3);

        box1.position.x = 200;
        box1.position.y = 90;
        box1.position.z = 100;

        OIMO_THREE.buildRigidBody(box1);
        scene.add(box1);
        oimo_world.addRigidBody(box1.oimo_rigid_body);
      }
    }

    if ("RevoluteJoint") {
      const x = -200;
      const y = 120;
      const z = 0;
      const l = 30;

      const box1 = new THREE.Mesh(new THREE.BoxGeometry(30, 5, 5), matRed);
      box1.position.set(x, y, z);
      box1.oimo_rigid_body_config = {
        type: OIMO.RigidBodyType.STATIC
      }
      OIMO_THREE.buildRigidBody(box1);
      scene.add(box1);
      oimo_world.addRigidBody(box1.oimo_rigid_body);

      const box2 = new THREE.Mesh(new THREE.BoxGeometry(30, 5, l), matGreen);
      box2.position.set(x, y, z + l / 2);
      OIMO_THREE.buildRigidBody(box2);
      scene.add(box2);
      oimo_world.addRigidBody(box2.oimo_rigid_body);

      const box3 = new THREE.Mesh(new THREE.BoxGeometry(30, 5, l), matBlue);
      box3.position.set(x, y, z + l / 2 + l);
      OIMO_THREE.buildRigidBody(box3);
      scene.add(box3);
      oimo_world.addRigidBody(box3.oimo_rigid_body);

      if (1) {
        const worldAnchor = new OIMO.Vec3(box1.position.x / OIMO_THREE.SCALE, box1.position.y / OIMO_THREE.SCALE, box1.position.z / OIMO_THREE.SCALE);
        const worldAxis = new OIMO.Vec3(1, 0, 0);
        const c = new OIMO.RevoluteJointConfig();
        c.init(
          box1.oimo_rigid_body,
          box2.oimo_rigid_body,
          worldAnchor,
          worldAxis
        );
        c.limitMotor.setLimits(-180 * Math.PI / 180, 180 * Math.PI / 180);
        c.springDamper.setSpring(4, 1.0);
        const j = new OIMO.RevoluteJoint(c);
        oimo_world.addJoint(j);
      }
      if (1) {
        const worldAnchor = new OIMO.Vec3(box2.position.x / OIMO_THREE.SCALE, box2.position.y / OIMO_THREE.SCALE, (box2.position.z + l / 2) / OIMO_THREE.SCALE);
        const worldAxis = new OIMO.Vec3(1, 0, 0);
        const c = new OIMO.RevoluteJointConfig();
        c.init(
          box2.oimo_rigid_body,
          box3.oimo_rigid_body,
          worldAnchor,
          worldAxis
        );
        c.limitMotor.setLimits(-180 * Math.PI / 180, 180 * Math.PI / 180)
        //c.limitMotor.setMotor(-15 * Math.PI / 180, 5.0);
        c.springDamper.setSpring(4, 1.0);
        const j = new OIMO.RevoluteJoint(c);
        oimo_world.addJoint(j);
      }
    }
  }

  let animate_callback = null;
  let prev_timestamp;
  let sim_t = 0;
  function animate(timestamp) {
    requestAnimationFrame(animate);
    if (prev_timestamp) {
      let delta_time = timestamp - prev_timestamp;
      const rate = 0.5;
      delta_time = Math.floor(delta_time * rate)
      if(20 < delta_time){
        delta_time = 20;
      }
      while(0<delta_time){
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
        if (animate_callback) {
          if (dog) {
            animate_callback(sim_t, dog);
          }
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

  function set_servo_angles(leg_number, angle1, angle2, angle3) {
    const leg = dog.legs[leg_number];
    if (leg.left) {
      leg.servo1.axis.rotation.x = angle1;
      leg.servo2.axis.rotation.x = angle2;
      leg.servo3.axis.rotation.x = -angle3;
    } else {
      leg.servo1.axis.rotation.x = -angle1;
      leg.servo2.axis.rotation.x = -angle2;
      leg.servo3.axis.rotation.x = angle3;
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