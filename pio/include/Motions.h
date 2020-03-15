#ifndef _Motions_H_
#define _Motions_H_

#include <Arduino.h>

#define LEG_INVALID -1
#define LEG_A 0
#define LEG_B 1
#define LEG_C 2
#define LEG_D 3

typedef struct _LegPosition{
  int tick;
  int leg_number;
  int x;
  int y;
  int z;
} LegPosition;

class Motions{
  public:
    void begin();
    void select(LegPosition* motion_table);
    bool select(String name);
    void update(int tick, LegPosition *positions);

  private:
    LegPosition* _current_motion;
    void _find_begin_end_position(int tick, int leg_number, LegPosition** bp, LegPosition** ep);
};

#endif
