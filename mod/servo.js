import PCA9685 from "pca9685"

export default class Servo {
  constructor() {
    this.pca9685 = new PCA9685({
      sda: 0,
      scl: 26,
      address: 0x40,
      prescale: 0
    });
    this.pca9685.sleep();
    this.pca9685.setOscillatorFrequency(26000000); // Get it from oscillator.ino
    this.pca9685.setPWMFreq(50);
  }

  sleep(){ this.pca9685.sleep(); }
  wakeup(){ this.pca9685.wakeup(); }

  set_pulse_width(servo_number, pulse_width) {
    this.pca9685.writeMicroseconds(servo_number, pulse_width);
  }

  set_leg_angles(leg_number, angle1, angle2, angle3) {
    const angles = [angle1, angle2, angle3];
    for (let n = 0; n < 3; n++) {
      const servo_number = leg_number * 3 + n;
      let a = angles[n];
      const c = calibration_data[servo_number];
      if (a < c.angle_min) { a = c.angle_min; }
      if (c.angle_max < a) { a = c.angle_max; }
      const pulse_width = c.pulse_width0 + (a - c.angle0) * (c.pulse_width1 - c.pulse_width0) / (c.angle1 - c.angle0);
      this.set_pulse_width(servo_number, pulse_width);
    }
  }

  update_calibration(c){
    const _c = calibration_data[c.servo_number];
    _c.angle0       = c.angle0;
    _c.pulse_width0 = c.pulse_width0;
    _c.angle1       = c.angle1;
    _c.pulse_width1 = c.pulse_width1;
    _c.angle_min    = c.angle_min;
    _c.angle_max    = c.angle_max;
    return _c;
  }

  cmd(cmd, request){
    if(cmd=="dog.servo.update_calibration"){
      const c = this.update_calibration(request.calibration);
      return {"result": "OK"};
    }
    if(cmd=="dog.servo.get_calibration"){
      if(!false){
        const c = calibration_data[request.servo_number];
        const _c = {};
        _c.angle0       = c.angle0;
        _c.pulse_width0 = c.pulse_width0;
        _c.angle1       = c.angle1;
        _c.pulse_width1 = c.pulse_width1;
        _c.angle_min    = c.angle_min;
        _c.angle_max    = c.angle_max;
        return {"result": "OK", "calibration": _c};
      }else{
        return {"result": "OK", "calibration": calibration_data[request.servo_number]};
      }
    }
    if(cmd=="dog.servo.set_pulse_width"){
      this.set_pulse_width(request.servo_number, request.pulse_width);
      return {"result": "OK", "servo_number": request.servo_number, "pulse_width": request.pulse_width};
    }
    if(cmd=="dog.servo.set_leg_angles"){
      this.set_leg_angles(request.leg_number, request.angle1, request.angle2, request.angle3);
      return {"result": "OK"};
    }

    return {"ERROR": `unknown command [${cmd}]`};
  }
}

const calibration_data = [
  {
    servo_number: 0, // A-1
    angle0:  0, pulse_width0: 1965,
    angle1: 30, pulse_width1: 1640,
    angle_min: -30,
    angle_max:  45
  },
  //-------------------------------------
  {
    servo_number: 1, // A-2
    angle0:  0, pulse_width0: 1900,
    angle1: 45, pulse_width1: 1395,
    angle_min:  -9,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 2, // A-3
    angle0:  0, pulse_width0:  700,
    angle1: 90, pulse_width1: 1750,
    angle_min: -30,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 3, // B-1
    angle0:  0, pulse_width0:  900,
    angle1: 30, pulse_width1: 1215,
    angle_min: -30,
    angle_max:  45
  },
  //-------------------------------------
  {
    servo_number: 4, // B-2
    angle0:  0, pulse_width0: 1000,
    angle1: 45, pulse_width1: 1525,
    angle_min:  -9,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 5, // B-3
    angle0:  0, pulse_width0: 2320,
    angle1: 90, pulse_width1: 1270,
    angle_min: -30,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 6, // C-1
    angle0:  0, pulse_width0: 2080,
    angle1: 30, pulse_width1: 1740,
    angle_min: -30,
    angle_max:  45
  },
  //-------------------------------------
  {
    servo_number: 7, // C-2
    angle0:  0, pulse_width0: 1965,
    angle1: 45, pulse_width1: 1360,
    angle_min:  -9,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 8, // C-3
    angle0:  0, pulse_width0:  700,
    angle1: 90, pulse_width1: 1675,
    angle_min: -30,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 9, // D-1
    angle0:  0, pulse_width0:  920,
    angle1: 30, pulse_width1: 1235,
    angle_min: -30,
    angle_max:  45
  },
  //-------------------------------------
  {
    servo_number: 10, // D-2
    angle0:  0, pulse_width0: 1000,
    angle1: 45, pulse_width1: 1595,
    angle_min:  -9,
    angle_max:  90
  },
  //-------------------------------------
  {
    servo_number: 11, // D-3
    angle0:  0, pulse_width0: 2300,
    angle1: 90, pulse_width1: 1200,
    angle_min: -30,
    angle_max:  90
  },
  //-------------------------------------
];
