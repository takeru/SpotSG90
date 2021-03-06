const IK = function (THREE) {
  const D2R = Math.PI / 180; // degree to radian

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
  this.normalize_radian = normalize_radian;

  this.calc_leg_angles = function (dog, leg, debug) {
    const m = new THREE.Matrix4();
    m.multiply((new THREE.Matrix4()).setPosition(dog.position));
    m.multiply((new THREE.Matrix4()).makeRotationFromEuler(dog.rotation));
    m.multiply((new THREE.Matrix4()).setPosition(dog.backbone.position));
    m.multiply((new THREE.Matrix4()).makeRotationFromEuler(dog.backbone.rotation));
    m.multiply(leg.ik_matrix4);

    if(debug){
      // local to global
      const r1 = new THREE.Vector3(0, 0, 0);
      r1.applyMatrix4(m);
      leg.result_global.position.copy(r1);
    }

    // global to local
    const r2 = new THREE.Vector3();
    r2.copy(leg.target.position);
    const inv = new THREE.Matrix4();
    inv.getInverse(m);
    r2.applyMatrix4(inv);
    if(debug){
      leg.result_local.position.copy(r2);
    }
    if(leg.target.position.tune){
      r2.x += leg.target.position.tune.x;
      r2.y += leg.target.position.tune.y;
      r2.z += leg.target.position.tune.z;
    }

    const x = r2.x * (leg.left ? 1 : -1);
    const y = r2.y;
    const z = r2.z;
    let angle1 = Math.atan2(-z, -y);
    const y2 = -(Math.sqrt(y * y + z * z) - leg.l0);
    const theta = calcIK((leg.left ? -1 : 1), x, y2, leg.l1, leg.l2);
    if (theta) {
      let angle2 = null;
      let angle3 = null;
    if(leg.left){
        angle1 = normalize_radian       (angle1 + 180 * D2R);
        angle2 = normalize_radian(-theta.theta1 -  90 * D2R);
        angle3 = normalize_radian( theta.theta2 +   0 * D2R);
      }else{
        angle1 = normalize_radian(      -angle1 + 180 * D2R);
        angle2 = normalize_radian( theta.theta1 +  90 * D2R);
        angle3 = normalize_radian(-theta.theta2 +   0 * D2R);
      }
      return {angle1: angle1, angle2: angle2, angle3: angle3};
    }
    return null;
  };
}

export default IK;
