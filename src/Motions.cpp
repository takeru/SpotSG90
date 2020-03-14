#include "Motions.h"

LegPosition _motion_table_reset[] = {
  // {time, leg, x, y, z},
  {   0, LEG_A, 0, 0, -70},
  {   0, LEG_B, 0, 0, -70},
  {   0, LEG_C, 0, 0, -70},
  {   0, LEG_D, 0, 0, -70},

  {-1, LEG_INVALID, 0, 0, 0}// END
};

LegPosition _motion_table_demo[] = {
  // {time, leg, x, y, z},
  {   0, LEG_A, 0, 0, -90},
  {   0, LEG_B, 0, 0, -90},
  {   0, LEG_C, 0, 0, -90},
  {   0, LEG_D, 0, 0, -90},

  {1000, LEG_A, 0, 0, -99},
  {1000, LEG_B, 0, 0, -70},
  {1000, LEG_C, 0, 0, -99},
  {1000, LEG_D, 0, 0, -70},

  {2000, LEG_A, 0, 0, -70},
  {2000, LEG_B, 0, 0, -99},
  {2000, LEG_C, 0, 0, -70},
  {2000, LEG_D, 0, 0, -99},

  {3000, LEG_A, 0, 0, -90},
  {3000, LEG_B, 0, 0, -90},
  {3000, LEG_C, 0, 0, -60},
  {3000, LEG_D, 0, 0, -60},

  {4000, LEG_A, 0, 0, -60},
  {4000, LEG_B, 0, 0, -60},
  {4000, LEG_C, 0, 0, -90},
  {4000, LEG_D, 0, 0, -90},

  {5000, LEG_A, 0, 0, -90},
  {5000, LEG_B, 0, 0, -90},
  {5000, LEG_C, 0, 0, -60},
  {5000, LEG_D, 0, 0, -60},

  {6000, LEG_A, 0, 0, -90},
  {6000, LEG_B, 0, 0, -90},
  {6000, LEG_C, 0, 0, -90},
  {6000, LEG_D, 0, 0, -90},

  {-1, LEG_INVALID, 0, 0, 0}// END
};

void Motions::begin()
{
}

void Motions::select(LegPosition* motion_table)
{
  _current_motion = motion_table;
}

bool Motions::select(String name)
{
  if(name == "reset"){
    select(_motion_table_reset);
    return true;
  }
  if(name == "demo"){
    select(_motion_table_demo);
    return true;
  }
  return false;
}

void Motions::update(int tick, LegPosition *positions)
{
  for(int leg_number=0; leg_number<4; leg_number++){
    LegPosition* bp = NULL;
    LegPosition* ep = NULL;
    _find_begin_end_position(tick, leg_number, &bp, &ep);

    LegPosition* cp = &positions[leg_number];
    cp->leg_number = leg_number;
    cp->tick = tick;

    if(ep==NULL && bp==NULL){
      cp->leg_number = LEG_INVALID;
      continue;
    }else
    if(bp==NULL){
      cp->x = ep->x;
      cp->y = ep->y;
      cp->z = ep->z;
    }else
    if(ep==NULL){
      cp->x = bp->x;
      cp->y = bp->y;
      cp->z = bp->z;
    }else{
      float progress = 1.0 * (tick-bp->tick) / (ep->tick-bp->tick);
      cp->x = bp->x + (ep->x - bp->x) * progress;
      cp->y = bp->y + (ep->y - bp->y) * progress;
      cp->z = bp->z + (ep->z - bp->z) * progress;
    }
  }
}

void Motions::_find_begin_end_position(int tick, int leg_number, LegPosition** bp, LegPosition** ep)
{
  LegPosition* prev = NULL;
  for(LegPosition *p = _current_motion; p->leg_number!=LEG_INVALID; p++){
    if(leg_number!=p->leg_number){ continue; }
    if(tick < p->tick){
      *bp = prev;
      *ep = p;
      return;
    }
    prev = p;
  }
  *bp = prev;
  *ep = NULL;
}
