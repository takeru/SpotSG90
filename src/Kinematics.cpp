#include "Kinematics.h"

float normalize_theta_range(float t){
  if(t < -PI){ return t + PI*2; }
  if(PI <  t){ return t - PI*2; }
  return t;
}

bool Kinematics::leg_ik(int sign, float x, float y, float l1, float l2, float *theta1, float *theta2)
{
  if(sign!=-1 && sign!=1){ sign=1; }
  float t1 = sign * acos((x*x+y*y+l1*l1-l2*l2)/(2*l1 * sqrt(x*x+y*y))) + atan(y/x);
  if(x<0){ t1 += PI; }
  float t2 = atan((y-l1 * sin(t1))/(x-l1 * cos(t1)))-t1;
  if(isnan(t1) || isnan(t2)){
    *theta1 = NAN;
    *theta2 = NAN;
    return false;
  }else{
    *theta1 = normalize_theta_range(t1);
    *theta2 = normalize_theta_range(t2);
    return true;
  }
}
