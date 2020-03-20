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
    const u = t * 0.002 + Math.PI * 2;
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
    t = t * 0.3;
    for (let leg_number = 0; leg_number < 4; leg_number++) {
      dog.legs[leg_number].target.position.x = BODY_X + (leg_number < 2 ? 30 : -80);
      dog.legs[leg_number].target.position.y = 0;
      dog.legs[leg_number].target.position.z = BODY_Z + leg_number % 2 == 0 ? -50 : 50;
    }
    dog.position.x = BODY_X + 10 * Math.sin(t * 0.23 * D2R);
    dog.position.y = BODY_Y + 10 * Math.sin(t * 0.17 * D2R);
    dog.position.z = BODY_Z + 10 * Math.sin(t * 0.11 * D2R);
    dog.rotation.x = 5 * Math.sin(t * 0.27 * D2R) * D2R;
    dog.rotation.y = 5 * Math.sin(t * 0.31 * D2R) * D2R;
    dog.rotation.z = 5 * Math.sin(t * 0.37 * D2R) * D2R;
  }

  this.step = function (t, dog, args) {
    t = t * args.speed;
    dog.position.x = args.dog_x;
    dog.position.y = 65;
    dog.position.z = args.dog_z;
    dog.rotation.x =  0;
    dog.rotation.y =  0;
    dog.rotation.z =  0;
    for (let leg_number = 0; leg_number < 4; leg_number++) {
      dog.legs[leg_number].target.position.x = leg_number < 2      ?  45 : -90;
      dog.legs[leg_number].target.position.y = 0;
      dog.legs[leg_number].target.position.z = leg_number % 2 == 0 ? -50 :  50;
    }

    const n = Math.floor(t/1000) % 4;
    switch(n){
      case 1:
        dog.legs[0].target.position.y = 15;
        dog.legs[1].target.position.y = -5;
        dog.legs[2].target.position.y = -5;
        dog.legs[3].target.position.y = 15;
        break;
      case 3:
        dog.legs[0].target.position.y = -5;
        dog.legs[1].target.position.y = 15;
        dog.legs[2].target.position.y = 15;
        dog.legs[3].target.position.y = -5;
        break;
    }
  }

  this.default = function(t, dog){
    this.dance(t, dog);
    //this.walk(t, dog);
  }
};

export default Motion;
