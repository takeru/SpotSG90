SpotSG90
========

4-legs robot using cheep SG90(copy) servos.
Spot Micro(https://gitlab.com/custom_robots/spotmicroai), that has many 12 servos.
Each servo costs 1000 yen or more, total 10000+ yen.

This is my first robot project.
I want to try to build little dog robot with cheep SG90(copy) servos (less than 3000 yen).

Motion and IK(Inverse Kinematics) code in ./sim and ./mod are shared.
Write motion code in web simulator and run it in robot.


Movies
======

* Walking Control
https://twitter.com/urekat/status/1245507465946353664
[![thumbnail](https://pbs.twimg.com/ext_tw_video_thumb/1245507259590774784/pu/img/l0tnaoz4Mv46j7GL.jpg)](https://twitter.com/urekat/status/1245507465946353664)

* IK Simulator in web
https://twitter.com/urekat/status/1245106619706310658
[![thumbnail](https://pbs.twimg.com/ext_tw_video_thumb/1245106255837818880/pu/img/sMxjaFQYR3UltzjA.jpg)](https://twitter.com/urekat/status/1245106619706310658)

* More
https://twitter.com/hashtag/SpotSG90?src=hashtag_click&f=live


Hardware
========
(TODO)
* 3D-Printed parts and screws
* PCA9685
* Servos
* M5StickC


./sim
=====
This directory includes IK simulator using https://threejs.org/.


./mod
=====

This directory includes firmware for M5StickC.
Written in JavaScript using https://github.com/Moddable-OpenSource/moddable.


./pio
=====
Old code. Written in PIO/C++.


Build firmware
==============

cd ./mod
UPLOAD_PORT=/dev/cu.usbserial-XXXXX DEBUGGER_SPEED=1500000 ESPBAUD=1500000 mcconfig -d -m -p esp32/m5stick_c


Contact
=======

If you decided to build your puppy, please ask me any questions, welcome.
https://twitter.com/urekat or create new issue.
