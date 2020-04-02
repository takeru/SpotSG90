import Timer from "timer";
import Time from "time";
import Digital from "pins/digital";

import THREE from "three-math"
import IK from 'ik'
import Motion from 'motion'
import Servo from "servo"
import Const from "const";

const Dog = function () {
  const ik = new IK(THREE);
  const motion = new Motion();
  const servo = new Servo();
  const D2R = Const.D2R;

  const makeLeg = function (front, left, ik_matrix4_array) {
    const leg = {
      target: {
        position: new THREE.Vector3()
      },
      ik_matrix4: new THREE.Matrix4().fromArray(ik_matrix4_array),
      left: left,
      front: front,
      l1: Const.L1,
      l2: Const.L2,
      l0: Const.L0
    };
    return leg;
  }
  const dog = {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    backbone:{
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    },
    legs: [
      // makeLeg(true, true, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.5, 22, -40, 1]),
      // makeLeg(true, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8.5, 22, 40, 1]),
      // makeLeg(false, true, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -91.5, 22, -40, 1]),
      // makeLeg(false, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -91.5, 22, 40, 1])
      makeLeg(true, true, [1,0,0,0,0,-1,1.2246467991473532e-16,0,0,-1.2246467991473532e-16,-1,0,8.5,-22,-40,1]),
      makeLeg(true, false, [1,0,0,0,0,-1,1.2246467991473532e-16,0,0,-1.2246467991473532e-16,-1,0,8.5,-22,40,1]),
      makeLeg(false, true, [1,0,0,0,0,-1,1.2246467991473532e-16,0,0,-1.2246467991473532e-16,-1,0,-91.5,-22,-40,1]),
      makeLeg(false, false, [1,0,0,0,0,-1,1.2246467991473532e-16,0,0,-1.2246467991473532e-16,-1,0,-91.5,-22,40,1])
    ]
  };

  let motion_params = null;
  let count = 0;
  const start_motion = function(name, speed, args){
    motion_params = {name: name, speed: speed, args: args, prev_ticks: Time.ticks, t: 0};
  }
  const update_motion = function(speed, args){
    motion_params.speed = speed;
    if(args){
      motion_params.args  = args;
    }
  }

  Timer.repeat(() => {
    if(motion_params && motion_params.name && motion[motion_params.name]){
      Digital.write(10, (count / 100) & 1);

      const ticks = Time.ticks;
      motion[motion_params.name](motion_params.t, dog, motion_params.args);
      motion_params.t += (ticks-motion_params.prev_ticks)*motion_params.speed;
      set_all_legs_angles();
      motion_params.prev_ticks = ticks;

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

  this.set_params = function(params){
    dog.position.x = params.position.x;
    dog.position.y = params.position.y;
    dog.position.z = params.position.z;
    dog.rotation.x = params.rotation.x;
    dog.rotation.y = params.rotation.y;
    dog.rotation.z = params.rotation.z;
    for(let i=0; i<4; i++){
      dog.legs[i].target.position.x = params.legs[i].target.position.x;
      dog.legs[i].target.position.y = params.legs[i].target.position.y;
      dog.legs[i].target.position.z = params.legs[i].target.position.z;
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

  this.set_tunes = function(tunes){
    dog.backbone.position.x = tunes.position.x;
    dog.backbone.position.y = tunes.position.y;
    dog.backbone.position.z = tunes.position.z;
    dog.backbone.rotation.x = tunes.rotation.x;
    dog.backbone.rotation.y = tunes.rotation.y;
    dog.backbone.rotation.z = tunes.rotation.z;
    for(let i=0; i<4; i++){
      dog.legs[i].target.position.tune = tunes.legs[i].target.position;
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

  let last_ping_t = null;
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
      start_motion(request.name, request.speed, request.args);
      return {"result": "OK"};
    }
    if(cmd=="dog.update_motion"){
      update_motion(request.speed, request.args);
      return {"result": "OK"};
    }
    if(cmd=="dog.set_params"){
      return this.set_params(request.params);
    }
    if(cmd=="dog.set_tunes"){
      return this.set_tunes(request.tunes);
    }
    if(cmd=="dog.ping"){
      last_ping_t = Time.ticks;
      return {"result": "OK"};
    }
    if (cmd.startsWith("dog.servo.")) {
      return servo.cmd(cmd, request);
    }
    return {"ERROR": `unknown command [${cmd}]`};
  }

  Timer.repeat(() => {
    if(last_ping_t){
      if(2000 < (Time.ticks - last_ping_t)){
        this.sleep();
        last_ping_t = null;
      }
    }
  }, 1000);
}

export default Dog;