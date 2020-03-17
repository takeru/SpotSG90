const Motion = function () {
  const BODY_X = 0;
  const BODY_Y = 50;
  const BODY_Z = 0;

  this.walk = function (t, dog) {
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
      const stepx = 20;
      x += (leg_number < 2 ? 30 : -120);
      if (leg_number == 0) x += stepx / 4;
      if (leg_number == 1) x -= stepx / 4;
      if (leg_number == 2) x += stepx / 4;
      if (leg_number == 3) x -= stepx / 4;
      x += cycle * stepx + progress * stepx;
      dog.legs[leg_number].target.position.x = x;
      dog.legs[leg_number].target.position.y = 20 * Math.sin(progress * Math.PI);
      dog.legs[leg_number].target.position.z = leg_number % 2 == 0 ? -50 : 50;
    }
    const bx = dog.legs.reduce((sum, leg) => sum + leg.target.position.x, 0) / 4 + 30;
    const bz = dog.legs.reduce((sum, leg) => sum + leg.target.position.z, 0) / 4;
    dog.position.set(bx, BODY_Y, bz);
  }

  const D2R = Math.PI / 180; // degree to radian
  this.dance = function (t, dog) {
    dog.position.x = BODY_X + 30 * Math.sin(t * 0.23 * D2R);
    dog.position.y = BODY_Y + 30 * Math.sin(t * 0.17 * D2R);
    dog.position.z = BODY_Z + 30 * Math.sin(t * 0.11 * D2R);
    dog.rotation.x = 10 * Math.sin(t * 0.27 * D2R) * D2R;
    dog.rotation.y = 10 * Math.sin(t * 0.31 * D2R) * D2R;
    dog.rotation.z = 10 * Math.sin(t * 0.37 * D2R) * D2R;
  }

  this.default = function(t, dog){
    //this.dance(t, dog);
    this.walk(t, dog);
  }
};

export default Motion;
