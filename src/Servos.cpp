#include "Servos.h"

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
Adafruit_PWMServoDriver driver = Adafruit_PWMServoDriver(0x40, Wire);


void Servos::begin(void)
{
  Wire.begin(0, 26); // SDA=0, SCL=26
  driver.begin();
  driver.setOscillatorFrequency(26000000); // Get it from oscillator.ino
  driver.setPWMFreq(50);
  sleep(true);
}

void Servos::set_pulse_width(int servo_number, int pulse_width)
{
  driver.writeMicroseconds(servo_number, pulse_width);
}

void Servos::sleep(bool s)
{
  sleeping = s;
  if(sleeping){
    driver.sleep();
  }else{
    driver.wakeup();
  }
}

void Servos::calibration(int servo_number, CalibrationData c)
{
  calibration_data[servo_number] = c;
}

void Servos::set_leg_angles(int leg_number, int angle1, int angle2, int angle3)
{
  int angles[3] = {angle1,angle2,angle3};
  for(int n=0; n<3; n++){
    int servo_number = leg_number*3+n;
    int a = angles[n];
    CalibrationData c = calibration_data[servo_number];
    if(a<c.angle_min){ a = c.angle_min; }
    if(c.angle_max<a){ a = c.angle_max; }
    int pulse_width = c.pulse_width0 + (a-c.angle0) * (c.pulse_width1-c.pulse_width0)/(c.angle1-c.angle0);
    printf("servo_number=%d pulse_width=%d\n", servo_number, pulse_width);
    set_pulse_width(servo_number, pulse_width);
  }
}
