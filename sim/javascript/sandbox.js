import World from "./world.js";
import OIMO_THREE from "./OIMO_THREE.js";
const D2R = Math.PI / 180;

onload = function () {
  const sandbox = new SandBox();
  sandbox.start();
}

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
const matRed = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const matGreen = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const matBlue = new THREE.MeshLambertMaterial({ color: 0x0000ff });

const SandBox = function () {
  let world;
  let scene;
  let oimo_world;

  this.start = function (cb) {
    world = new World();
    world.setup();
    scene = world.scene;
    oimo_world = world.oimo_world;
    makeBalls();
    makeSeesaw();
    makeHinge();
    makeWeightScale();
    makeSlope();
    make4Legs();
    world.start((sim_t) => { });
  };

  const makeBalls = function () {
    const make_ball = function (parent, local, r, color, oimo_shape_config) {
      const group = new THREE.Group();
      const sp1 = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), new THREE.MeshLambertMaterial({
        color: color
      }));
      sp1.position.set(local.x, local.y, local.z);
      if (oimo_shape_config) {
        sp1.oimo_shape_config = {
          //density: 0, // Kg/m^3
          restitution: oimo_shape_config.restitution || 0.2,
        }
      }
      group.add(sp1);
      group.position.set(parent.x, parent.y, parent.z);

      OIMO_THREE.buildRigidBody(group);
      scene.add(group);
      oimo_world.addRigidBody(group.oimo_rigid_body);
      return group;
    }
    const x = -600;
    const z = -100;
    const b1 = make_ball({ "x": x, "y": 100, "z": z + 0 }, { "x": 0, "y": 0, "z": 0 }, 5, 0xff0000);
    const b2 = make_ball({ "x": x + 50, "y": 100, "z": z - 10 }, { "x": 0, "y": 0, "z": 10 }, 10, 0x00ff00);
    const b3 = make_ball({ "x": x + 100, "y": 100, "z": z + 20 }, { "x": 0, "y": 0, "z": -20 }, 20, 0xffff00);
    const b4 = make_ball({ "x": x + 200, "y": 100, "z": z - 40 }, { "x": 0, "y": 0, "z": 40 }, 40, 0x0000ff);
    const b11 = make_ball({ "x": x + 50, "y": 200, "z": z + 50 }, { "x": 0, "y": 0, "z": 0 }, 10, 0xff0000, { restitution: 0.01 });
    const b12 = make_ball({ "x": x + 100, "y": 200, "z": z + 50 }, { "x": 0, "y": 0, "z": 0 }, 10, 0x00ff00, { restitution: 1.0 });
  };

  const makeSeesaw = function () {
    const x = 0;
    const z = -150;
    if (".") {
      const group = new THREE.Group();
      group.oimo_rigid_body_config = {
        type: OIMO.RigidBodyType.STATIC
      }

      group.position.x = x;
      group.position.z = z;

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
      group.position.set(x, 0, z);
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

      group.position.x = x;
      group.position.y = 70;
      group.position.z = z;

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

      box1.position.x = x;
      box1.position.y = 90;
      box1.position.z = z;

      OIMO_THREE.buildRigidBody(box1);
      scene.add(box1);
      oimo_world.addRigidBody(box1.oimo_rigid_body);
    }
  };

  const makeHinge = function () {
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
    box2.oimo_shape_config = {
      //density: 0.1, // Kg/m^3
    }
    box2.position.set(x, y, z + l / 2);
    OIMO_THREE.buildRigidBody(box2);
    scene.add(box2);
    oimo_world.addRigidBody(box2.oimo_rigid_body);

    const box3 = new THREE.Mesh(new THREE.BoxGeometry(30, 5, l), matBlue);
    box3.oimo_shape_config = {
      //density: 0.1, // Kg/m^3
    }
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
      //c.limitMotor.setLimits(-180 * Math.PI / 180, 180 * Math.PI / 180);
      c.springDamper.setSpring(15, 0.5);
      //c.limitMotor.setLimits(-45 * D2R, 45 * D2R)
      c.limitMotor.setMotor(-45 * Math.PI / 180, 1.0);
      // const frequency    =  15;
      // const dampingRatio =  0.5;
      // c.springDamper.setSpring(frequency, dampingRatio);
      const j = new OIMO.RevoluteJoint(c);
      oimo_world.addJoint(j);
      // box1.animate = ()=>{
      //   const d = j.getAngle() / D2R;
      //   console.log("d=", d);
      // }
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
      c.limitMotor.setLimits(-90 * D2R, 90 * D2R)
      //c.limitMotor.setLimits(0 * D2R, 0 * D2R)
      //c.limitMotor.setLimits(-180 * Math.PI / 180, 180 * Math.PI / 180)
      //c.limitMotor.setMotor(-15 * Math.PI / 180, 5.0);
      c.springDamper.setSpring(15, 0.5);
      const j = new OIMO.RevoluteJoint(c);
      oimo_world.addJoint(j);
    }
  };

  const makeWeightScale = function () {
    const x = -300;
    const y = 100;
    const z = 0;

    const box1 = new THREE.Mesh(new THREE.BoxGeometry(100, 5, 100), whiteMaterial);
    box1.oimo_shape_config = {
      //density: 1/1000/1000/1000, // Kg/m^3
      //restitution: 1,
    }
    box1.position.set(x, y+10, z);
    OIMO_THREE.buildRigidBody(box1);
    scene.add(box1);
    oimo_world.addRigidBody(box1.oimo_rigid_body);

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(100, 5, 100), grayMaterial);
    box2.oimo_rigid_body_config = {
      //type: OIMO.RigidBodyType.STATIC
    }
    box2.position.set(x, y, z);
    OIMO_THREE.buildRigidBody(box2);
    scene.add(box2);
    oimo_world.addRigidBody(box2.oimo_rigid_body);

    for (let i = 0; i < 100; i++) {
      const box3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), redMaterial);
      const xx = (Math.random() * 2 - 1) * 20;
      const yy = (Math.random() * 2 - 1) * 20;
      const zz = (Math.random() * 2 - 1) * 20;
      box3.position.set(x + xx, y + 100 + yy, z + zz);
      OIMO_THREE.buildRigidBody(box3);
      scene.add(box3);
      oimo_world.addRigidBody(box3.oimo_rigid_body);
    }

    const worldAnchor = new OIMO.Vec3(box1.position.x / OIMO_THREE.SCALE, box1.position.y / OIMO_THREE.SCALE, box1.position.z / OIMO_THREE.SCALE);
    const worldAxis = new OIMO.Vec3(0, -1, 0);
    const c = new OIMO.PrismaticJointConfig()
    c.init(box1.oimo_rigid_body, box2.oimo_rigid_body, worldAnchor, worldAxis);
    const frequency = 15;
    const dampingRatio = 0.5;
    c.springDamper.setSpring(frequency, dampingRatio);
    c.limitMotor.setLimits(0, 0);
    const j = new OIMO.PrismaticJoint(c);
    oimo_world.addJoint(j);

    let n = 0;
    box1.animate = () => {
      if (n % 500 == 0) {
        const g = oimo_world.getGravity().y;
        const f1 = box1.oimo_rigid_body.getMass() * g;
        const f = j.getAppliedForce().y;
        const precision = 100;
        console.log("n=", n, "m=", Math.round(precision * (f + f1) / (-g) * 1000 * 1000 * 1000) / precision);
      }
      n++;
    }
  };

  const makeSlope = function () {
    const x = -200;
    const y =    0;
    const z =  200;

    const box1 = new THREE.Mesh(new THREE.BoxGeometry(200, 5, 100), whiteMaterial);
    box1.oimo_rigid_body_config = {
      type: OIMO.RigidBodyType.STATIC
      //density: 1/1000/1000/1000, // Kg/m^3
      //restitution: 1,
    }
    box1.position.set(x, y + 20, z);
    box1.rotation.z = -10 * D2R;
    OIMO_THREE.buildRigidBody(box1);
    scene.add(box1);
    oimo_world.addRigidBody(box1.oimo_rigid_body);

    const make = (zz, friction, mat) => {
      const box2 = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), mat);
      box2.oimo_shape_config = {
        friction: friction
      }
      box2.position.set(x - 80, y + 50, z + zz);
      OIMO_THREE.buildRigidBody(box2);
      scene.add(box2);
      oimo_world.addRigidBody(box2.oimo_rigid_body);
    }
    make(-30, 0.01, blueMaterial);
    make(-10, 0.10, blue2Material);
    make(10, 0.20, redMaterial);
    make(30, 0.50, greenMaterial);
  }

  const make4Legs = function () {
    const x = 300;
    const y = 230;
    const z = 0;

    const body = new THREE.Mesh(new THREE.BoxGeometry(200, 20, 100), blueMaterial);
    body.oimo_shape_config = {
      restitution: 0.0001,
      friction: 1.0
    }
    body.oimo_rigid_body_config = {
      //type: OIMO.RigidBodyType.STATIC
    }
    body.position.set(x, y, z);
    OIMO_THREE.buildRigidBody(body);
    scene.add(body);
    oimo_world.addRigidBody(body.oimo_rigid_body);
    console.log("body.geometry.parameters=", body.geometry.parameters)
    console.log("body.oimo_rigid_body...getHalfExtents=", body.oimo_rigid_body.getShapeList().getGeometry().getHalfExtents())

    const makeLeg = function (body, x, z, front, left) {
      const l1 = 60;
      const l2 = 40;
      const space1 = 0;
      const space2 = 0;
      const space3 = 0;
      const r = 10;
      const a = 10;

      const box1 = new THREE.Mesh(new THREE.BoxGeometry(a, l1, a), greenMaterial);
      box1.oimo_shape_config = {
        restitution: 0.0001,
        friction: 1.0
      }
      box1.position.set(x, body.position.y - body.geometry.parameters.height / 2 - l1 / 2 - space1, z);
      OIMO_THREE.buildRigidBody(box1);
      scene.add(box1);
      oimo_world.addRigidBody(box1.oimo_rigid_body);

      const box2 = new THREE.Mesh(new THREE.BoxGeometry(a, l2, a), redMaterial);
      box2.oimo_shape_config = {
        restitution: 0.0001,
        friction: 1.0
      }
      box2.position.set(x, box1.position.y - l1 / 2 - l2 / 2 - space2, z);
      OIMO_THREE.buildRigidBody(box2);
      scene.add(box2);
      oimo_world.addRigidBody(box2.oimo_rigid_body);

      const foot = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), blueMaterial);
      //const foot = new THREE.Mesh(new THREE.BoxGeometry(r * 2, r * 2, r * 2), blueMaterial);
      foot.position.set(x, box2.position.y - l2 / 2 - r - space3, z);
      foot.oimo_rigid_body_config = {
        //autoSleep: false
      }
      foot.oimo_shape_config = {
        restitution: 0.0001,
        friction: 1.0
      }
      OIMO_THREE.buildRigidBody(foot);
      scene.add(foot);
      oimo_world.addRigidBody(foot.oimo_rigid_body);

      const c1 = new OIMO.RevoluteJointConfig();
      c1.init(
        body.oimo_rigid_body,
        box1.oimo_rigid_body,
        new OIMO.Vec3(
          box1.position.x / OIMO_THREE.SCALE,
          ((body.position.y - body.geometry.parameters.height / 2) + (box1.position.y + box1.geometry.parameters.height / 2)) / 2 / OIMO_THREE.SCALE,
          box1.position.z / OIMO_THREE.SCALE
        ),
        new OIMO.Vec3(0, 0, 1)
      );
      c1.limitMotor.setLimits(-60 * D2R, 0 * D2R)
      //c1.springDamper.setSpring(0, 0);
      const frequency = 50;
      const dampingRatio = 0.1;
      c1.springDamper.setSpring(frequency, dampingRatio);
      const j1 = new OIMO.RevoluteJoint(c1);
      oimo_world.addJoint(j1);
      const cycle = 300;
      const torque = 1.5;
      const rate = 0.15;
      box1.animate = function (t, o) {
        if (front == left) { t += (cycle / 2); }
        const a = Math.max(0, Math.sin(2 * Math.PI * (t % cycle) / cycle));
        const target = -20 + a * -40;
        const speed = (1 / rate) * (target * D2R - j1.getAngle())
        j1.getLimitMotor().setMotor(speed, torque);
      };

      const c2 = new OIMO.RevoluteJointConfig();
      c2.init(
        box1.oimo_rigid_body,
        box2.oimo_rigid_body,
        new OIMO.Vec3(
          box2.position.x / OIMO_THREE.SCALE,
          ((box1.position.y - box1.geometry.parameters.height / 2) + (box2.position.y + box2.geometry.parameters.height / 2)) / 2 / OIMO_THREE.SCALE,
          box2.position.z / OIMO_THREE.SCALE
        ),
        new OIMO.Vec3(0, 0, 1)
      );
      c2.limitMotor.setLimits(0 * D2R, 120 * D2R)
      //c2.springDamper.setSpring(0, 0);
      c2.springDamper.setSpring(frequency, dampingRatio);
      const j2 = new OIMO.RevoluteJoint(c2);
      oimo_world.addJoint(j2);
      box2.animate = function (t, o) {
        if (front == left) { t += cycle / 2; }
        const a = Math.max(0, Math.sin(2 * Math.PI * (t % cycle) / cycle));
        const target = 40 + a * 80;
        const speed = (1 / rate) * (target * D2R - j2.getAngle())
        j2.getLimitMotor().setMotor(speed, torque);
      };

      if(true){
        const c3 = new OIMO.RevoluteJointConfig();
        c3.init(
          box2.oimo_rigid_body,
          foot.oimo_rigid_body,
          new OIMO.Vec3(
            box2.position.x / OIMO_THREE.SCALE,
            ((box2.position.y - box2.geometry.parameters.height / 2) + (foot.position.y + r)) / 2 / OIMO_THREE.SCALE,
            box2.position.z / OIMO_THREE.SCALE
          ),
          new OIMO.Vec3(0, 0, 1)
        );
        c3.limitMotor.setLimits(0 * D2R, 0 * D2R)
        c3.springDamper.setSpring(0, 0);
        //c3.limitMotor.setLimits(-60 * D2R, 0 * D2R)
        //c3.springDamper.setSpring(frequency, dampingRatio);
        const j3 = new OIMO.RevoluteJoint(c3);
        oimo_world.addJoint(j3);
      }else{
        const c3 = new OIMO.PrismaticJointConfig();
        c3.init(
          box2.oimo_rigid_body,
          foot.oimo_rigid_body,
          new OIMO.Vec3(
            box2.position.x / OIMO_THREE.SCALE,
            ((box2.position.y - box2.geometry.parameters.height / 2) + (foot.position.y + r)) / 2 / OIMO_THREE.SCALE,
            box2.position.z / OIMO_THREE.SCALE
          ),
          new OIMO.Vec3(0, 1, 0)
        );
        c3.limitMotor.setLimits(0, 0)
        c3.springDamper.setSpring(0, 0);
        const j3 = new OIMO.PrismaticJoint(c3);
        oimo_world.addJoint(j3);
      }
    }

    makeLeg(body, x+95, z+45, true, false);
    makeLeg(body, x+95, z-45, true, true);
    makeLeg(body, x-95, z+45, false, false);
    makeLeg(body, x-95, z-45, false, true);
  }
}
