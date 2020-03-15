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
const D2R = Math.PI / 180; // degree to radian

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
const BODY_X = 0;
const BODY_Y = 50;
const BODY_Z = 0;

function setup() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    10000
  );
  camera.position.x = 100;
  camera.position.y = 100;
  camera.position.z = 400;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  if (1) {
    camera.animate = function (t) {
      const u = Math.sin(0.02 * t * D2R) * 90 + 45;
      //camera.position.x = 250*Math.sin(u*D2R);
      //camera.position.y = 150 + 50 * Math.cos(0.03*t*D2R);

      camera.position.x = dog.position.x + 200 + 100 * Math.sin(u * D2R);
      camera.position.y = dog.position.y + 200 + 100 * Math.sin(u * D2R);
      camera.position.z = dog.position.z + 300 + 100 * Math.cos(u * D2R);
      camera.lookAt(new THREE.Vector3(dog.position.x, BODY_Y, dog.position.z));
    };
  } else {
    camera.animate = function (t) { };
    const controls = new THREE.OrbitControls(camera);
  }

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
    var l = new THREE.Mesh(new THREE.PlaneGeometry(2050, i == 0 ? 3 : 1), blackMaterial);
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

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
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

function makeLeg(front, right) {
  const servo1 = makeServo();
  servo1.axis.animate = (t, self) => {
    //self.rotation.x = 20*Math.sin(0.1*t*D2R)*D2R;
    //self.rotation.x = 30*D2R * (right?-1:1);
  };

  const servo2 = makeServo();
  servo2.rotation.x = 180 * D2R;
  servo2.rotation.y = -90 * D2R;
  if (right) {
    servo2.rotation.y += 180 * D2R;
  }
  servo2.position.x = -(servo1.geometry.parameters.width / 2 + servo2.geometry.parameters.depth / 2 + SERVO2_OFFSET);
  servo2.position.y = servo2.axis.position.y;
  servo2.axis.animate = (t, self) => {
    //self.rotation.x = (20 * Math.sin(0.3*t*D2R)+ 20) * D2R * (right?-1:1);
    //self.rotation.x = (45) * D2R * (right?-1:1);
  };
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
  servo3.axis.animate = (t, self) => {
    //self.rotation.x = (-90 + 30 * Math.sin(0.2*t*D2R)+ 30) * D2R * (right?-1:1);
    //self.rotation.x =  -90 * D2R * (right?-1:1);
  };
  arm2.add(servo3);

  const arm3 = new THREE.Mesh(new THREE.BoxGeometry(4, ARM3_H, 4), blue2Material);
  arm3.position.x = 0;
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

  servo1.servo1 = servo1;
  servo1.servo2 = servo2;
  servo1.servo3 = servo3;
  servo1.ik_origin = ik_origin;

  return servo1;
}

function makeDog() {
  const backbone = new THREE.Mesh(new THREE.BoxGeometry(BACKBONE_W, BACKBONE_H, BACKBONE_D), blueMaterial);

  const m5stickc = new THREE.Mesh(new THREE.BoxGeometry(48, 14, 24), orangeMaterial);
  m5stickc.position.set(50, 8, 0);
  const lcd = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 13), blackMaterial);
  lcd.position.set(-7, 7, 0);
  m5stickc.add(lcd);
  backbone.add(m5stickc);

  const shoulder = new THREE.Mesh(new THREE.BoxGeometry(SHOULDER_W, SHOULDER_H, SHOULDER_D), blue2Material);
  shoulder.position.set(((BACKBONE_W - SHOULDER_W) / 2), -(BACKBONE_H + SHOULDER_H) / 2, 0);
  backbone.add(shoulder);

  const waist = new THREE.Mesh(new THREE.BoxGeometry(WAIST_W, WAIST_H, WAIST_D), blue3Material);
  waist.position.set(-((BACKBONE_W - WAIST_W) / 2), -(BACKBONE_H + WAIST_H) / 2, 0);
  backbone.add(waist);

  const legs = [];
  for (let fb = 0; fb < 2; fb++) {
    for (let lr = 0; lr < 2; lr++) {
      const leg_number = fb * 2 + lr;
      const leg = makeLeg(fb == 0, lr == 1);
      const sw = [shoulder, waist][fb];
      const h = fb == 0 ? SHOULDER_H : WAIST_H;
      const d = fb == 0 ? SHOULDER_D : WAIST_D;
      leg.position.set(0, (SERVO_H / 2 + h / 2), (d / 2 - SERVO_D / 2) * (lr * 2 - 1));
      sw.add(leg);
      legs.push(leg);

      const ik_matrix4 = new THREE.Matrix4();
      [sw, leg, leg.ik_origin].forEach((obj) => {
        ik_matrix4.multiply((new THREE.Matrix4()).setPosition(obj.position));
        ik_matrix4.multiply((new THREE.Matrix4()).makeRotationFromEuler(obj.rotation));
      });
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
  legs[0].target.position.set(40, 0, -50);
  legs[1].target.position.set(40, 0, 50);
  legs[2].target.position.set(-80, 0, -50);
  legs[3].target.position.set(-80, 0, 50);

  const calc_leg = function (leg_number, t) {
    const leg = legs[leg_number];
    const target = leg.target;
    const m = new THREE.Matrix4();
    m.multiply((new THREE.Matrix4()).setPosition(dog.position));
    m.multiply((new THREE.Matrix4()).makeRotationFromEuler(dog.rotation));
    m.multiply(leg.ik_matrix4);

    const result_global = leg.result_global;
    const result_local = leg.result_local;

    // local to global
    const r1 = new THREE.Vector3(0, 0, 0);
    r1.applyMatrix4(m);
    result_global.position.copy(r1);

    // global to local
    const r2 = new THREE.Vector3();
    r2.copy(target.position);
    const inv = new THREE.Matrix4();
    inv.getInverse(m);
    r2.applyMatrix4(inv);
    result_local.position.copy(r2);

    const x = r2.x * (leg_number % 2 == 0 ? 1 : -1);
    const y = r2.y;
    const z = r2.z;
    const angle1 = Math.atan(z / y);
    leg.servo1.axis.rotation.x = angle1;
    const y2 = -Math.sqrt(y * y + z * z);
    const theta = calcIK((leg_number % 2 == 0 ? -1 : 1), x, y2, ARM2_H, ARM3_H, leg_number == 99);
    if (theta) {
      const angle2 = normalize_radian(-theta.theta1 - 90 * D2R);
      const angle3 = normalize_radian(-theta.theta2);
      leg.servo2.axis.rotation.x = angle2;
      leg.servo3.axis.rotation.x = angle3;
    }
  };

  const dog = backbone;
  dog.position.set(BODY_X, BODY_Y, BODY_Z);
  dog.animate = (t) => {
    const bx = legs.reduce((sum, leg) => sum + leg.target.position.x, 0) / 4 + 30;
    const bz = legs.reduce((sum, leg) => sum + leg.target.position.z, 0) / 4;
    dog.position.set(bx, BODY_Y, bz);

    //legs[1].target.position.x = 40 + 30 * Math.sin(t*0.23*D2R);

    // 3333
    //     1111
    //        2222
    //            0000
    //               3333
    // <--01--      ><--02-->
    const u = t * 0.008 + Math.PI * 2;
    for (let leg_number = 0; leg_number < 4; leg_number++) {
      let v = u;
      //-([3,1,2,0][leg_number] * Math.PI/2);
      if (leg_number == 0) v -= 11 / 14 * Math.PI * 2;
      if (leg_number == 1) v -= 4 / 14 * Math.PI * 2;
      if (leg_number == 2) v -= 7 / 14 * Math.PI * 2;
      if (leg_number == 3) v -= 0 / 14 * Math.PI * 2;
      const cycle = Math.floor(v / (Math.PI * 2));
      v = v % (Math.PI * 2);
      let progress = 0;
      if (v < 0) {
        progress = 0;
      } else if (0 <= v && v < Math.PI * 2 * 4 / 14) {
        progress = 1.0 * v / (Math.PI * 2 * 4 / 14);
      } else {
        progress = 1;
      }
      var x = -1200;
      const stepx = 50;
      x += (leg_number < 2 ? 30 : -120);
      if (leg_number == 0) x += stepx / 4;
      if (leg_number == 1) x -= stepx / 4;
      if (leg_number == 2) x += stepx / 4;
      if (leg_number == 3) x -= stepx / 4;
      x += cycle * stepx + progress * stepx;
      legs[leg_number].target.position.x = x;
      legs[leg_number].target.position.y = 5 * Math.sin(progress * Math.PI);
    }

		/*
    dog.position.x = BODY_X + 30 * Math.sin(t*0.23*D2R);
    dog.position.y = BODY_Y + 30 * Math.sin(t*0.17*D2R);
    dog.position.z = BODY_Z + 30 * Math.sin(t*0.11*D2R);
    dog.rotation.x = 10*Math.sin(t*0.27*D2R)*D2R;
    dog.rotation.y = 10*Math.sin(t*0.31*D2R)*D2R;
    dog.rotation.z = 10*Math.sin(t*0.37*D2R)*D2R;
    */

    for (let leg_number = 0; leg_number < 4; leg_number++) {
      calc_leg(leg_number, t);
    }
  };
  scene.add(dog);
  return dog;
}

const normalize_radian = function (t) {
  if (t < -Math.PI) { t += Math.PI * 2; }
  if (Math.PI <= t) { t -= Math.PI * 2; }
  return t;
}

const calcIK = function (sign, x, y, l1, l2, debug) {
  if (sign != -1 && sign != 1) { sign = 1; }
  let t1 = sign * Math.acos((x * x + y * y + l1 * l1 - l2 * l2) / (2 * l1 * Math.sqrt(x * x + y * y))) + Math.atan2(y, x);
  const t2 = Math.atan2(y - l1 * Math.sin(t1), x - l1 * Math.cos(t1)) - t1;
  if (debug) { console.log(sign, x, y, l1, l2, t1 / D2R, atan / D2R, t2 / D2R); }
  if (t1 && t2) {
    return { theta1: t1, theta2: t2 };
  }
  return null;
}

function makeObjects() {
  dog = makeDog();
  const spG = new THREE.SphereGeometry(50, 32, 32);
  const sp = new THREE.Mesh(spG, yellowMaterial);
  sp.position.set(-200, 50, -100);
  scene.add(sp);
}

function animate(timestamp) {
  requestAnimationFrame(animate);
  scene.traverse(function (obj) {
    if (obj instanceof THREE.Mesh === true) {
      if (obj.animate) { obj.animate(timestamp, obj); }
    }
  });
  camera.animate(timestamp, camera);

  renderer.render(scene, camera);
}

onload = function () {
  setup();
  makeObjects();
  animate();
}
