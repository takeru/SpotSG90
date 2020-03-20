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
}


const calibration_data = [
  {
    servo_number: 0, // A-1
    angle0: 0, pulse_width0: 1575,
    angle1: 45, pulse_width1: 2075,
    angle_min: -18,
    angle_max: 45
  },
  {
    servo_number: 1, // A-2
    angle0: 0, pulse_width0: 1075,
    angle1: 90, pulse_width1: 2175,
    angle_min: -9,
    angle_max: 90
  },
  {
    servo_number: 2, // A-3
    angle0: 0, pulse_width0: 1280,
    angle1: 90, pulse_width1: 2300,
    angle_min: -30,
    angle_max: 90
  },
  //-------------------------------------
  {
    servo_number: 3, // B-1
    angle0: 0, pulse_width0: 1525,
    angle1: 45, pulse_width1: 1025,
    angle_min: -18,
    angle_max: 45
  },
  {
    servo_number: 4, // B-2
    angle0: 0, pulse_width0: 2275,
    angle1: 90, pulse_width1: 1175,
    angle_min: -9,
    angle_max: 90
  },
  {
    servo_number: 5, // B-3
    angle0: 0, pulse_width0: 1950,
    angle1: 90, pulse_width1: 925,
    angle_min: -30,
    angle_max: 90
  },
  //-------------------------------------
  {
    servo_number: 6, // C-1
    angle0: 0, pulse_width0: 1470,
    angle1: 45, pulse_width1: 1970,
    angle_min: -18,
    angle_max: 45
  },
  {
    servo_number: 7, // C-2
    angle0: 0, pulse_width0: 1125,
    angle1: 90, pulse_width1: 2225,
    angle_min: -9,
    angle_max: 90
  },
  {
    servo_number: 8, // C-3
    angle0: 0, pulse_width0: 1175,
    angle1: 90, pulse_width1: 2275,
    angle_min: -30,
    angle_max: 90
  },
  //-------------------------------------
  {
    servo_number: 9, // D-1
    angle0: 0, pulse_width0: 1525,
    angle1: 45, pulse_width1: 1025,
    angle_min: -18,
    angle_max: 45
  },
  {
    servo_number: 10, // D-2
    angle0: 0, pulse_width0: 2200,
    angle1: 90, pulse_width1: 1100,
    angle_min: -9,
    angle_max: 90
  },
  {
    servo_number: 11, // D-3
    angle0: 0, pulse_width0: 1865,
    angle1: 90, pulse_width1: 840,
    angle_min: -30,
    angle_max: 90
  },
];
