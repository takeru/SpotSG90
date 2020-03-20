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

  let motion_name = null;
  let motion_args = null;
  let count = 0;
  Timer.repeat(() => {
    if(motion_name && motion[motion_name]){
      Digital.write(10, (count / 100) & 1);
      const t = Time.ticks;
      motion[motion_name](t, dog, motion_args);
      set_all_legs_angles();
      count++;
    }
  }, 25);

  const set_all_legs_angles = function(){
    dog.legs.forEach(function (leg, leg_number) {
      leg.angles = ik.calc_leg_angles(dog, leg, false);
      if (leg.angles) {
        servo.set_leg_angles(leg_number, leg.angles.angle1 / D2R, leg.angles.angle2 / D2R, leg.angles.angle3 / D2R);
      }
    });
  }

  let prev_t = null;
  let prev_count = null;
  Timer.repeat(() => {
    const t = Time.ticks;
    if (prev_t) {
      trace(`count=${count} loop/sec=${Math.round(1000 * (count - prev_count) / (t - prev_t))}\n`)
    }
    prev_t = t;
    prev_count = count;
  }, 5000);

  // Timer.repeat(() => {
  //   for (let leg_number = 0; leg_number < 4; leg_number++) {
  //     const a = dog.legs[leg_number].angles;
  //     if (a) {
  //       //trace(`a[${leg_number}]=${a.angle1},${a.angle2},${a.angle3}\n`)
  //     }
  //   }
  // }, 1000);

  this.set_params = function(_dog){
    /*
    const before = {
      "dog": {
        "position": dog.position.toArray(),
        "rotation": dog.rotation.toArray(),
        "legs": [
          dog.legs[0].target.position.toArray(),
          dog.legs[1].target.position.toArray(),
          dog.legs[2].target.position.toArray(),
          dog.legs[3].target.position.toArray()
        ]
      }
    }*/

    dog.position.x = _dog.position[0];
    dog.position.y = _dog.position[1];
    dog.position.z = _dog.position[2];
    dog.rotation.x = _dog.rotation[0];
    dog.rotation.y = _dog.rotation[1];
    dog.rotation.z = _dog.rotation[2];
    for(let i=0; i<4; i++){
      dog.legs[i].target.position.x = _dog.legs[i].position[0];
      dog.legs[i].target.position.y = _dog.legs[i].position[1];
      dog.legs[i].target.position.z = _dog.legs[i].position[2];
    }
    set_all_legs_angles();
    return {
      "dog": {
        "legs": [
          {"angles": dog.legs[0].angles},
          {"angles": dog.legs[1].angles},
          {"angles": dog.legs[2].angles},
          {"angles": dog.legs[3].angles}
        ]
      }
    }
  }

  this.sleep = ()=>{ servo.sleep(); };
  this.wakeup = ()=>{ servo.wakeup(); };

  this.cmd = function(cmd, request){
    if(cmd=="dog.sleep"){
      this.sleep();
      return {"result": "OK"};
    }
    if(cmd=="dog.wakeup"){
      this.wakeup();
      return {"result": "OK"};
    }
    if(cmd=="dog.motion"){
      motion_name = request.name;
      motion_args = request.args;
      return {"result": "OK"};
    }
    if(cmd=="dog.params"){
      return this.set_params(request.dog);
    }
    return {"ERROR": "dog: invalid command."};
  }
}

export default Dog;