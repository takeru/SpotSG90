#ifndef _Kinematics_H_
#define _Kinematics_H_

#include <Arduino.h>

class Kinematics{
  public:
    bool leg_ik(int sign, float x, float y, float l1, float l2, float *theta1, float *theta2);
  private:
};

#endif
