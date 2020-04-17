const OIMO_THREE = {};
const fixCenterOfGravity = true;

const SCALE = 1000.0;
OIMO_THREE.SCALE = SCALE;
OIMO_THREE.buildRigidBody = function (root) {
  const root_position = root.position.clone();
  const root_quaternion = root.quaternion.clone();
  root.position.set(0, 0, 0);
  root.quaternion.set(0, 0, 0, 1);
  root.updateMatrixWorld();

  const rbcnf = new OIMO.RigidBodyConfig();
  rbcnf.type = OIMO.RigidBodyType.DYNAMIC;
  if (root.oimo_rigid_body_config) {
    const c = root.oimo_rigid_body_config;
    if (c.type) {
      rbcnf.type = c.type;
    }
  }
  rbcnf.position = new OIMO.Vec3(root_position.x / SCALE, root_position.y / SCALE, root_position.z / SCALE);
  rbcnf.rotation = quaternionToMat3(new OIMO.Quat(root_quaternion.x, root_quaternion.y, root_quaternion.z, root_quaternion.w));

  const shcnfs = [];
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh !== true) {
      return;
    }
    const shcnf = new OIMO.ShapeConfig();
    if (obj.geometry instanceof THREE.BoxGeometry === true) {
      shcnf.geometry = new OIMO.BoxGeometry(new OIMO.Vec3(
        obj.geometry.parameters.width  / 2 / SCALE,
        obj.geometry.parameters.height / 2 / SCALE,
        obj.geometry.parameters.depth  / 2 / SCALE
      ));
    } else if (obj.geometry instanceof THREE.SphereGeometry === true) {
      shcnf.geometry = new OIMO.SphereGeometry(obj.geometry.parameters.radius / SCALE);
    } else {
      console.log("No support for geometry=", obj.geometry)
    }
    const position = new THREE.Vector3();
    obj.getWorldPosition(position);
    const quaternion = new THREE.Quaternion();
    obj.getWorldQuaternion(quaternion);
    shcnf.position = new OIMO.Vec3(position.x / SCALE, position.y / SCALE, position.z / SCALE);
    shcnf.rotation = quaternionToMat3(new OIMO.Quat(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
    if (obj.oimo_shape_config) {
      const c = obj.oimo_shape_config;
      if (c.density) {
        shcnf.density = c.density;
      }
      if (c.friction) {
        shcnf.friction = c.friction;
      }
      if (c.restitution) {
        shcnf.restitution = c.restitution;
      }
    }
    shcnfs.push(shcnf);
  });

  let centerOfGravity = null;
  if (fixCenterOfGravity && rbcnf.type == OIMO.RigidBodyType.DYNAMIC) {
    let totalVecMass = new OIMO.Vec3();
    let totalMass = 0;
    shcnfs.forEach((shcnf) => {
      const m = shcnf.geometry.getVolume() * shcnf.density;
      totalVecMass = totalVecMass.addScaled(shcnf.position, m);
      totalMass += m;
    });
    centerOfGravity = totalVecMass.scale(1.0 / totalMass);
    shcnfs.forEach((shcnf) => {
      shcnf.position = shcnf.position.sub(centerOfGravity);
    });

    const _cog = new THREE.Vector3(centerOfGravity.x, centerOfGravity.y, centerOfGravity.z);
    _cog.applyQuaternion(root_quaternion);
    rbcnf.position = rbcnf.position.add(new OIMO.Vec3(_cog.x, _cog.y, _cog.z));
  }

  const rigid_body = new OIMO.RigidBody(rbcnf);
  shcnfs.forEach((shcnf) => {
    const shape = new OIMO.Shape(shcnf);
    rigid_body.addShape(shape);
  });

  rigid_body.centerOfGravity = centerOfGravity;
  root.position.copy(root_position);
  root.quaternion.copy(root_quaternion);
  root.oimo_rigid_body = rigid_body;

  return root;
}

const quaternionToMat3 = function (quaternion) {
  const tr = new OIMO.Transform();
  tr.setOrientation(new OIMO.Quat(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
  return tr.getRotation();
}

OIMO_THREE.sync = function (obj) {
  if (!obj.oimo_rigid_body) {
    return;
  }
  obj.oimo_rigid_body.getOrientationTo(obj.quaternion);
  const pos = new THREE.Vector3()
  obj.oimo_rigid_body.getPositionTo(pos);
  const cog = obj.oimo_rigid_body.centerOfGravity;
  if (cog) {
    const _cog = new THREE.Vector3(cog.x, cog.y, cog.z);
    _cog.applyQuaternion(obj.quaternion);
    pos.x -= _cog.x;
    pos.y -= _cog.y;
    pos.z -= _cog.z;
  }

  obj.position.x = pos.x * SCALE;
  obj.position.y = pos.y * SCALE;
  obj.position.z = pos.z * SCALE;
}


export default OIMO_THREE;
