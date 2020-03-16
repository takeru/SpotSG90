let sim;
const main = function () {
  sim = new Sim();
  sim.start(animate_callback);
}

onload = function () {
  main();
}

const calcIK = function (sign, x, y, l1, l2) {
  if (sign != -1 && sign != 1) { sign = 1; }
  let t1 = sign * Math.acos((x * x + y * y + l1 * l1 - l2 * l2) / (2 * l1 * Math.sqrt(x * x + y * y))) + Math.atan2(y, x);
  const t2 = Math.atan2(y - l1 * Math.sin(t1), x - l1 * Math.cos(t1)) - t1;
  if (t1 && t2) {
    return { theta1: t1, theta2: t2 };
  }
  return null;
}

const normalize_radian = function (t) {
  if (t < -Math.PI) { t += Math.PI * 2; }
  if (Math.PI <= t) { t -= Math.PI * 2; }
  return t;
}

const calc_leg = function (dog, leg, t) {
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

  const x = r2.x * (leg.left ? 1 : -1);
  const y = r2.y;
  const z = r2.z;
  const angle1 = Math.atan2(-z, -y);
  const y2 = -Math.sqrt(y * y + z * z);
  const theta = calcIK((leg.left ? -1 : 1), x, y2, leg.l1, leg.l2);
  if (theta) {
    const angle2 = normalize_radian(-theta.theta1 - 90 * D2R);
    const angle3 = normalize_radian(-theta.theta2 - 90 * D2R);
    const leg_number = (leg.left ? 0 : 1) + (leg.front ? 0 : 2);
    sim.set_servo_angles(leg_number, angle1, angle2, angle3);
  }
};

const animate_callback = function (t, dog) {
  const BODY_X = 0;
  const BODY_Y = 50;
  const BODY_Z = 0;

  const walk = function () {
    // 3333
    //     1111
    //        2222
    //            0000
    //               3333
    // <-----01-----><-----02----->
    const u = t * 0.008 + Math.PI * 2;
    for (let leg_number = 0; leg_number < 4; leg_number++) {
      let v = u;
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
      let x = -1200;
      const stepx = 50;
      x += (leg_number < 2 ? 30 : -120);
      if (leg_number == 0) x += stepx / 4;
      if (leg_number == 1) x -= stepx / 4;
      if (leg_number == 2) x += stepx / 4;
      if (leg_number == 3) x -= stepx / 4;
      x += cycle * stepx + progress * stepx;
      dog.legs[leg_number].target.position.x = x;
      dog.legs[leg_number].target.position.y = 5 * Math.sin(progress * Math.PI);
      dog.legs[leg_number].target.position.z = leg_number % 2 == 0 ? -50 : 50;
    }
    const bx = dog.legs.reduce((sum, leg) => sum + leg.target.position.x, 0) / 4 + 30;
    const bz = dog.legs.reduce((sum, leg) => sum + leg.target.position.z, 0) / 4;
    dog.position.set(bx, BODY_Y, bz);
  }

  const dance = function () {
    dog.position.x = BODY_X + 30 * Math.sin(t * 0.23 * D2R);
    dog.position.y = BODY_Y + 30 * Math.sin(t * 0.17 * D2R);
    dog.position.z = BODY_Z + 30 * Math.sin(t * 0.11 * D2R);
    dog.rotation.x = 10 * Math.sin(t * 0.27 * D2R) * D2R;
    dog.rotation.y = 10 * Math.sin(t * 0.31 * D2R) * D2R;
    dog.rotation.z = 10 * Math.sin(t * 0.37 * D2R) * D2R;
  }
  dance();
  walk();

  dog.legs.forEach(function (leg) {
    calc_leg(dog, leg, t);
  })
}
