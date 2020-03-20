import Sim from "./sim.js";
import IK from "./ik.js";
import Motion from "./motion.js";

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
const D2R = Math.PI / 180; // degree to radian

const animate_callback = function (t, dog) {
  motion.default(t, dog);

  dog.legs.forEach(function (leg) {
    const angles = ik.calc_leg_angles(dog, leg, true);
    if(angles){
      const leg_number = (leg.left ? 0 : 1) + (leg.front ? 0 : 2);
      sim.set_servo_angles(leg_number, angles.angle1, angles.angle2, angles.angle3);
      //sim.set_servo_angles(leg_number, 30*D2R, 30*D2R, 30*D2R);
    }
  })
}
