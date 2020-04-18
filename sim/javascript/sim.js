import Const from "./const.js";
import World from "./world.js";
import OIMO_THREE from "./OIMO_THREE.js";
const D2R = Const.D2R;
import IK from "./ik.js";
import Motion from "./motion.js";

onload = function () {
  const sim = new Sim();
  sim.start();
}

const Sim = function () {
  let world;
  let scene;
  let oimo_world;
  let dog;

  this.start = function (cb) {
    world = new World();
    world.setup();
    scene = world.scene;
    oimo_world = world.oimo_world;
    dog = makeDog();
    makeObjects();

    const ik = new IK(THREE);
    const motion = new Motion();
    let flag = false;
    world.start((sim_t)=>{
      if(true || flag){
        motion.default(sim_t, dog);
        dog.legs.forEach(function (leg) {
          const angles = ik.calc_leg_angles(dog, leg, true);
          if(angles){
            const leg_number = (leg.left ? 0 : 1) + (leg.front ? 0 : 2);
            set_servo_angles(leg_number, angles.angle1, angles.angle2, angles.angle3);
          }
        });
      }
      flag = false;
    });
    setInterval(()=>{
      if(Math.random() < 0.3){
        flag = true;
      }
    }, 20);
  };

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
  }

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
};

export default Sim;