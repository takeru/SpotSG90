import Timer from "timer";
import Time from "time";
import Digital from "pins/digital";

import THREE from "three-math"
import IK from 'ik'
import Motion from 'motion'
import Servo from "servo"

const Dog = function () {
  const ik = new IK(THREE);
  const motion = new Motion();
  const servo = new Servo();
  servo.sleep(false);
  const D2R = Math.PI / 180; // degree to radian

  const ARM2_H = 43;
  const ARM3_H = 57;
  const makeLeg = function (front, left, ik_matrix4_array) {
    const leg = {
      target: {
        position: new THREE.Vector3()
      },
      ik_matrix4: new THREE.Matrix4().fromArray(ik_matrix4_array),
      left: left,
      front: front,
      l1: ARM2_H,
      l2: ARM3_H
    };
    return leg;
  }
  const dog = {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    legs: [
      makeLeg(true, true, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 38.5, 22, -40, 1]),
      makeLeg(true, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 38.5, 22, 40, 1]),
      makeLeg(false, true, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -91.5, 22, -40, 1]),
      makeLeg(false, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -91.5, 22, 40, 1])
    ]
  };

  let count = 0;
  Timer.repeat(() => {
    Digital.write(10, (count / 100) & 1);

    const t = Time.ticks;
    motion.default(t, dog);
    dog.legs.forEach(function (leg, leg_number) {
      leg.angles = ik.calc_leg_angles(dog, leg, t);
      if (leg.angles) {
        servo.set_leg_angles(leg_number, leg.angles.angle1 / D2R, leg.angles.angle2 / D2R, leg.angles.angle3 / D2R);
      }
    });
    count++;
  }, 1);

  let prev_t = null;
  let prev_count = null;
  Timer.repeat(() => {
    const t = Time.ticks;
    if (prev_t) {
      trace(`count=${count} loop/sec=${Math.round(1000 * (count - prev_count) / (t - prev_t))}}\n`)
    }
    prev_t = t;
    prev_count = count;
  }, 5000);

  Timer.repeat(() => {
    for (let leg_number = 0; leg_number < 4; leg_number++) {
      const a = dog.legs[leg_number].angles;
      if (a) {
        //trace(`a[${leg_number}]=${a.angle1},${a.angle2},${a.angle3}\n`)
      }
    }
  }, 1000);
}

export default Dog;