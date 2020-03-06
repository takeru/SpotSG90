
#ifndef _Servos_H_
#define _Servos_H_
class CalibrationData{
  public:
    int angle0       =    0;
    int pulse_width0 =  500;
    int angle1       =  180;
    int pulse_width1 = 2500;
    int angle_min    =    0;
    int angle_max    =  180;
};

class Servos{
  public:
    void begin(void);
    void set_pulse_width(int servo_number, int pulse_width);
    void sleep(bool s);
    void calibration(int servo_number, CalibrationData c);
    void set_leg_angles(int leg_number, int angle1, int angle2, int angle3);

    CalibrationData calibration_data[12];
  private:
    bool sleeping;
};

#endif
