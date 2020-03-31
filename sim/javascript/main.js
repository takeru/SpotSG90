import Sim from "./sim.js";
import IK from "./ik.js";
import Motion from "./motion.js";
import Const from "./const.js";
const D2R = Const.D2R;
let sim;
const main = function () {
  sim = new Sim();
  sim.start(animate_callback);
}

onload = function () {
  main();
}

const ik = new IK(THREE);
const motion = new Motion();

let flag = false;
const animate_callback = function (t, dog) {
  /*
  dog.position.y = 150;
  dog.legs.forEach(function (leg) {
    const leg_number = (leg.left ? 0 : 1) + (leg.front ? 0 : 2);
    sim.set_servo_angles(leg_number, 0, 0, 0);
    sim.set_servo_angles(leg_number, 15*D2R, 30*D2R, 30*D2R);
    sim.set_servo_angles(leg_number, 15*D2R, 45*D2R, 90*D2R);
  })
  return;
  */

  if(flag){
    motion.default(t, dog);
    dog.legs.forEach(function (leg) {
      const angles = ik.calc_leg_angles(dog, leg, true);
      if(angles){
        const leg_number = (leg.left ? 0 : 1) + (leg.front ? 0 : 2);
        sim.set_servo_angles(leg_number, angles.angle1, angles.angle2, angles.angle3);
      }
    });
    flag = false;
  }
}

setInterval(()=>{
  if(Math.random() < 0.3){
    flag = true;
  }
}, 20);
