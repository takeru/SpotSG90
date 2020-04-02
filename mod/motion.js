const Motion = function () {
  const BODY_X =   0;
  const BODY_Y = 110;
  const BODY_Z =   0;

  this.walk1 = function (t, dog) {
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
    dog.position.z = BODY_Z + 30 * Math.sin(t * 0.11 * D2R);
    dog.rotation.x = 5 * Math.sin(t * 0.27 * D2R) * D2R;
    dog.rotation.y = 5 * Math.sin(t * 0.31 * D2R) * D2R;
    dog.rotation.z = 5 * Math.sin(t * 0.37 * D2R) * D2R;
  }

  this.step = function (t, dog, args) {
    dog.position.x =  0;
    dog.position.y = BODY_Y;
    dog.position.z =  0;
    dog.rotation.x =  0;
    dog.rotation.y =  0;
    dog.rotation.z =  0;
    for (let leg_number = 0; leg_number < 4; leg_number++) {
      dog.legs[leg_number].target.position.x = leg_number < 2      ?  15 : -90;
      dog.legs[leg_number].target.position.y = 0;
      dog.legs[leg_number].target.position.z = leg_number % 2 == 0 ? -30 :  30;
    }

    const n = Math.floor(t/1000) % 4;
    let m0 = Math.floor(t) % 1000 / 1000.0;
    let m1 = 1.0-m0;
    const LA = args.LA;//15;
    const LB = args.LB;//25;
    const RA = args.RA;//15;
    const RB = args.RB;//25;
    switch(n){
      case 0:
        dog.legs[0].target.position.y  =   LA * m0;
        dog.legs[1].target.position.y  =    0 * m0;
        dog.legs[2].target.position.y  =    0 * m0;
        dog.legs[3].target.position.y  =   RA * m0;

        dog.legs[0].target.position.x +=  -LB * m1;
        dog.legs[1].target.position.x +=   RB * m1;
        dog.legs[2].target.position.x +=   LB * m1;
        dog.legs[3].target.position.x +=  -RB * m1;
        break;
      case 1:
        dog.legs[0].target.position.y  =   LA * m1;
        dog.legs[1].target.position.y  =    0 * m0;
        dog.legs[2].target.position.y  =    0 * m0;
        dog.legs[3].target.position.y  =   RA * m1;

        dog.legs[0].target.position.x +=   LB * m0;
        dog.legs[1].target.position.x +=  -RB * m0;
        dog.legs[2].target.position.x +=  -LB * m0;
        dog.legs[3].target.position.x +=   RB * m0;
        break;
      case 2:
        dog.legs[1].target.position.y  =   RA * m0;
        dog.legs[0].target.position.y  =    0 * m0;
        dog.legs[3].target.position.y  =    0 * m0;
        dog.legs[2].target.position.y  =   LA * m0;

        dog.legs[1].target.position.x +=  -RB * m1;
        dog.legs[0].target.position.x +=   LB * m1;
        dog.legs[3].target.position.x +=   RB * m1;
        dog.legs[2].target.position.x +=  -LB * m1;
        break;
      case 3:
        dog.legs[1].target.position.y  =   RA * m1;
        dog.legs[0].target.position.y  =    0 * m0;
        dog.legs[3].target.position.y  =    0 * m0;
        dog.legs[2].target.position.y  =   LA * m1;

        dog.legs[1].target.position.x +=   RB * m0;
        dog.legs[0].target.position.x +=  -LB * m0;
        dog.legs[3].target.position.x +=  -RB * m0;
        dog.legs[2].target.position.x +=   LB * m0;
        break;
    }
  }

  this.prev_t = null;
  this.walk = function (t, dog, args) {
    if(t==0){
      this.prev_t = null;
    }
    const leg_position = function(dog, leg){
      const l = (leg.front ?  15 : -85);
      const w = (leg.left  ? -30 :  30);
      return {
        x: dog.position.x +  Math.cos(dog.rotation.y) * l + Math.sin(dog.rotation.y) * w,
        z: dog.position.z + -Math.sin(dog.rotation.y) * l + Math.cos(dog.rotation.y) * w
      }
    }

    const dt = t - this.prev_t;
    if(this.prev_t){
      const cycle_ms = 2000; // left=1000 + right=1000
      const t0 = Math.floor(t) % cycle_ms; // 0-1999
      const lr = t0 < (cycle_ms/2) ? 0 : 1; // left=0,right=1
      const t1 = t0 % (cycle_ms/2); // 0-999
      const t2 = (cycle_ms/2) - t1; // 1000-1
      const progress = t1 / (cycle_ms/2);

      const move = function(dog, speed, dt){
        dog.position.x +=  Math.cos(dog.rotation.y) * speed.px / 1000.0 * dt;
        dog.position.x +=  Math.sin(dog.rotation.y) * speed.pz / 1000.0 * dt;
        dog.position.y =   BODY_Y;
        dog.position.z += -Math.sin(dog.rotation.y) * speed.px / 1000.0 * dt;
        dog.position.z +=  Math.cos(dog.rotation.y) * speed.pz / 1000.0 * dt;

        dog.rotation.x =  0;
        dog.rotation.y += speed.ry / 1000.0 * dt;
        dog.rotation.z =  0;
      }

      // move body
      move(dog, args.speed, dt);

      // estimated body position & rotation at next landing point
      const dog2 = {
        position: dog.position.clone(),
        rotation: dog.rotation.clone()
      }
      const repeat = 3;
      for(let i=0; i<repeat; i++){
        move(dog2, args.speed, t2/repeat);
      }
      if(dog.target){ // for sim
        dog.target.position.copy(dog2.position);
        dog.target.rotation.copy(dog2.rotation);
      }

      for(let leg_number=0; leg_number<4; leg_number++){
        const leg = dog.legs[leg_number];
        if(lr==0 && (leg_number==1 || leg_number==2)){ continue; }
        if(lr==1 && (leg_number==0 || leg_number==3)){ continue; }

        const p = leg_position(dog2, leg);
        leg.target.position.y = args.h * (1-2*Math.abs(progress-0.5));

        const progress2 = Math.min(1.0, dt / t2);
        leg.target.position.x = leg.target.position.x * (1.0-progress2) + p.x * progress2;
        leg.target.position.z = leg.target.position.z * (1.0-progress2) + p.z * progress2;
      }
    }else{
      dog.position.x =  0;
      dog.position.y =  BODY_Y;
      dog.position.z =  0;
      dog.rotation.x =  0;
      dog.rotation.y =  0;
      dog.rotation.z =  0;
      dog.legs.forEach((leg, leg_number)=>{
        const p = leg_position(dog, leg);
        leg.target.position.x = p.x; dog.position.x;
        leg.target.position.z = p.z; dog.position.z;
      });
    }
    this.prev_t = t;
  }

  this.default = function(t, dog){
    //this.walk1(t, dog);
    //this.step(t, dog, {LA: 15, LB: 0, RA: 15, RB: 20});
    //this.dance(t, dog);
    this.walk(t, dog, {
      speed:{
        px: 10,
        pz: 10,
        ry: -10 * D2R
      },
      h: 10
    });

  }
};

export default Motion;
