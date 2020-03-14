#include <Arduino.h>
#include <M5StickC.h>
#ifdef ESP32
#include <WiFi.h>
#include <WiFiMulti.h>
#include <AsyncTCP.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#endif
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include "secret.h"
#include "Servos.h"
#include "Motions.h"
#include "Kinematics.h"


#define LED_BUILTIN 10

WiFiMulti wifiMulti;
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
Servos  servos;
Motions motions;
Kinematics kinematics;
unsigned long _motion_start_ms = 0;
float _motion_speed = 0;
LegPosition* dynamic_motion = NULL;

const char* PARAM_MESSAGE = "message";

void notFound(AsyncWebServerRequest *request) {
  request->send(404, "text/plain", "Not found");
}

void handleJsonRequest(JsonDocument& req, JsonDocument& resp)
{
  if(req["request"]=="led"){
    if(req["data"]["action"]=="on"){
      digitalWrite(LED_BUILTIN, LOW);
      resp["led"] = digitalRead(LED_BUILTIN);
    }
    if(req["data"]["action"]=="off"){
      digitalWrite(LED_BUILTIN, HIGH);
      resp["led"] = digitalRead(LED_BUILTIN);
    }
    if(req["data"]["action"]=="toggle"){
      int led = digitalRead(LED_BUILTIN);
      digitalWrite(LED_BUILTIN, led==HIGH ? LOW : HIGH);
      resp["led"] = digitalRead(LED_BUILTIN);
    }
  }

  if(req["request"]=="servo"){
    int servo_number = req["data"]["servo_number"];
    int pulse_width  = req["data"]["pulse_width"];
    printf("servo_number=%d pulse_width=%d\n", servo_number, pulse_width);

    servos.set_pulse_width(servo_number, pulse_width);

    resp["response"] = "servo";
    JsonObject data = resp.createNestedObject("data");
    data["servo_number"] = servo_number;
    data["pulse_width"]  = pulse_width;
  }

  if(req["request"]=="sleep"){
    if(req["data"]["sleep"] == "sleep"){
      servos.sleep(true);
    }
    if(req["data"]["sleep"] == "wakeup"){
      servos.sleep(false);
    }
  }

  if(req["request"]=="calibration"){
    int servo_number = req["data"]["servo_number"];

    CalibrationData c;
    c.angle0       = req["data"]["angle0"];
    c.pulse_width0 = req["data"]["pulse_width0"];
    c.angle1       = req["data"]["angle1"];
    c.pulse_width1 = req["data"]["pulse_width1"];
    c.angle_min    = req["data"]["angle_min"];
    c.angle_max    = req["data"]["angle_max"];

    printf("servo_number=%d angle0=%d pulse_width0=%d angle1=%d pulse_width1=%d angle_min=%d angle_max=%d\n", servo_number, c.angle0, c.pulse_width0, c.angle1, c.pulse_width1, c.angle_min, c.angle_max);

    servos.calibration(servo_number, c);

    resp["response"] = "calibration";
    // JsonObject data = resp.createNestedObject("data");
  }
  if(req["request"]=="leg"){
    int leg_number = req["data"]["leg_number"];
    int angle1 = req["data"]["angle1"];
    int angle2 = req["data"]["angle2"];
    int angle3 = req["data"]["angle3"];
    printf("leg_number=%d angle1=%d angle2=%d angle3=%d\n", leg_number, angle1, angle2, angle3);

    servos.set_leg_angles(leg_number, angle1, angle2, angle3);

    resp["response"] = "leg";
    // JsonObject data = resp.createNestedObject("data");
    //data[""] = "";
  }

  if(req["request"]=="motion"){
    String name = req["data"]["name"];
    float speed = req["data"]["speed"];
    printf("motion=%s speed=%4.1f\n", name.c_str(), speed);

    if(name=="STOP"){
      _motion_start_ms = 0;
      _motion_speed = 0;
    }else
    if(name=="circle"){
      if(dynamic_motion){
        _motion_start_ms = 0;
        _motion_speed = 0;
        free(dynamic_motion);
      }

      int r = 10;
      int num = 5;
      int size = 12*num;
      int duration = 10000;
      dynamic_motion = new LegPosition[size*4+1];
      for(int i=0; i<size; i++){
        for(int leg_number=0; leg_number<4; leg_number++){
          LegPosition *p = &dynamic_motion[i*4+leg_number];
          p->leg_number = leg_number;
          p->tick = i * (duration/size);
          p->x = r*cos(i*(360*num/size)*PI/180);
          p->y = r*sin(i*(360*num/size)*PI/180);
          if(leg_number%2==0){ p->y *= -1; }
          p->z = -90;
        }
      }
      dynamic_motion[size*4].leg_number = LEG_INVALID; // END

      motions.select(dynamic_motion);
      _motion_start_ms = millis();
      _motion_speed = speed;
    }else{
      bool ok = motions.select(name);
      if(ok){
        _motion_start_ms = millis();
        _motion_speed = speed;
      }
    }

    resp["response"] = "motion";
    // JsonObject data = resp.createNestedObject("data");
    // data[""] = "";
  }
}

void onEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
  if(type == WS_EVT_CONNECT){
    //client connected
    printf("ws[%s][%u] connect\n", server->url(), client->id());

    StaticJsonDocument<JSON_OBJECT_SIZE(2)> doc;
    doc["msg"] = "hello";
    doc["id"] = client->id();
    size_t len = measureJson(doc);
    AsyncWebSocketMessageBuffer * buffer = ws.makeBuffer(len);
    serializeJson(doc, (char*)buffer->get(), len+1);
    client->text(buffer);

    client->ping();
  } else if(type == WS_EVT_DISCONNECT){
    //client disconnected
    printf("ws[%s][%u] disconnect: %u\n", server->url(), client->id(), client->id());
  } else if(type == WS_EVT_ERROR){
    //error was received from the other end
    printf("ws[%s][%u] error(%u): %s\n", server->url(), client->id(), *((uint16_t*)arg), (char*)data);
  } else if(type == WS_EVT_PONG){
    //pong message was received (in response to a ping request maybe)
    printf("ws[%s][%u] pong[%u]: %s\n", server->url(), client->id(), len, (len)?(char*)data:"");
  } else if(type == WS_EVT_DATA){
    //data packet
    AwsFrameInfo * info = (AwsFrameInfo*)arg;
    if(info->final && info->index == 0 && info->len == len){
      //the whole message is in a single frame and we got all of it's data
      printf("ws[%s][%u] %s-message[%llu]: ", server->url(), client->id(), (info->opcode == WS_TEXT)?"text":"binary", info->len);
      if(info->opcode == WS_TEXT){
        data[len] = 0; // IS IT SAFE??
        printf("%s\n", (char*)data);

        StaticJsonDocument<JSON_OBJECT_SIZE(10)> req;
        DeserializationError error = deserializeJson(req, data);
        if(error){
          printf("ws[%s][%u] DeserializationError %s\n", server->url(), client->id(), error.c_str());
        }else{
          StaticJsonDocument<JSON_OBJECT_SIZE(10)> resp;
          handleJsonRequest(req, resp);
          size_t len = measureJson(resp);
          AsyncWebSocketMessageBuffer * buffer = ws.makeBuffer(len);
          serializeJson(resp, (char*)buffer->get(), len+1);
          client->text(buffer);
        }
      }
    } else {
      //message is comprised of multiple frames or the frame is split into multiple packets
      printf("framed message: info->final=%d info->index=%lld info->len=%llu\n",
        info->final, info->index, info->len);
    }
  }
}

String rtc_string()
{
  RTC_TimeTypeDef time;
  RTC_DateTypeDef date;
  M5.Rtc.GetTime(&time);
  M5.Rtc.GetData(&date);
  char s[20];
  sprintf(s, "%04d-%02d-%02d %02d:%02d:%02d",
    date.Year, date.Month, date.Date,
    time.Hours, time.Minutes, time.Seconds
  );
  return String(s);
}

void update_display()
{
  M5.Lcd.fillScreen(BLACK);
  M5.Lcd.setRotation(3);
  M5.Lcd.setTextFont(2);
  M5.Lcd.setTextSize(1);
  M5.Lcd.setTextColor(WHITE, BLACK);

  M5.Lcd.setCursor(1, 1);

  M5.Lcd.printf("ssid=%s\n", WiFi.SSID().c_str());
  M5.Lcd.printf("localIP=%s\n", WiFi.localIP().toString().c_str());
  M5.Lcd.printf("%lu\n", millis()/1000);
}

void textAllWriteAvailable(AsyncWebSocketMessageBuffer *buffer)
{
  for(const auto& c: ws.getClients()){
    if(!c->queueIsFull()){
      c->text(buffer);
    }else{
      printf("ws[%s][%u] queueIsFull\n", ws.url(), c->id());
    }
  }
}

#include "index_html.h"

void setup() {
  WIFI_MULTI_ADDAPS();
  M5.begin();
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);
  servos.begin();
  motions.begin();

  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  while(1){
    if(wifiMulti.run()==WL_CONNECTED){
      break;
    }
    delay(1000);
  }

  printf("ssid=%s localIP=%s\n", WiFi.SSID().c_str(), WiFi.localIP().toString().c_str());

  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/html", index_html);
  });

  // Send a GET request to <IP>/get?message=<message>
  server.on("/get", HTTP_GET, [] (AsyncWebServerRequest *request) {
    String message;
    if (request->hasParam(PARAM_MESSAGE)) {
      message = request->getParam(PARAM_MESSAGE)->value();
    } else {
      message = "No message sent";
    }
    request->send(200, "text/plain", "Hello, GET: " + message);
  });

  server.onNotFound(notFound);

  server.begin();

  M5.IMU.Init();
}

void loop()
{
  unsigned long ms  = millis();
  unsigned long sec = ms / 1000;
  //static unsigned long prev_ms         = 0;
  static unsigned long prev_sec        = 0;
  static unsigned long loop_count      = 0;
  //static unsigned long prev_loop_count = 0;
  if(prev_sec < sec){
    ws.cleanupClients();

    /*
    StaticJsonDocument<JSON_OBJECT_SIZE(10)> root;
    root["rtc"] = rtc_string();
    root["loop/sec"] = int(1000*(loop_count-prev_loop_count)/(ms-prev_ms));
    size_t len = measureJson(root);
    AsyncWebSocketMessageBuffer * buffer = ws.makeBuffer(len);
    serializeJson(root, (char*)buffer->get(), len+1);
    textAllWriteAvailable(buffer);
    */

    String pingData = String(loop_count);
    ws.pingAll((uint8_t*)pingData.c_str(), strlen(pingData.c_str())+1);
    printf("pingAll: %s\n", pingData.c_str());

    //prev_ms = ms;
    prev_sec = sec;
    //prev_loop_count = loop_count;

    update_display();
  }

  if(0 < _motion_start_ms){
    static unsigned long _motion_prev_ms = 0;
    if(1 < ms-_motion_prev_ms){
      LegPosition positions[4];
      int tick = (ms-_motion_start_ms)*_motion_speed;
      motions.update(tick, positions);
      for(int i=0; i<4; i++){
        if(positions[i].leg_number == LEG_INVALID){
          continue;
        }
        // printf("leg_number=%d tick=%d, x=%d y=%d z=%d\n", positions[i].leg_number, positions[i].tick, positions[i].x, positions[i].y, positions[i].z);

        float x = positions[i].x;
        float y = positions[i].y;
        float z = positions[i].z;
        int angle1 = atan(y/z)*180/PI;
        float z2 = -sqrt(z*z+y*y);
        float l1 = 43;
        float l2 = 57;
        float theta1 = NAN;
        float theta2 = NAN;
        bool ok = kinematics.leg_ik(-1, x, z2, l1, l2, &theta1, &theta2);
        if(ok){
          int angle2 = -(theta1*180/PI)-90;
          int angle3 = -(theta2*180/PI)+90;
          servos.set_leg_angles(positions[i].leg_number, angle1, angle2, angle3);
        }
      }
      _motion_prev_ms = ms;
    }
  }

  static unsigned long prev_imu_ms = 0;
  if(false && 0<ws.count() && prev_imu_ms+100<ms){
    static float accX  = 0.0F;
    static float accY  = 0.0F;
    static float accZ  = 0.0F;
    static float gyroX = 0.0F;
    static float gyroY = 0.0F;
    static float gyroZ = 0.0F;
    static float pitch = 0.0F;
    static float roll  = 0.0F;
    static float yaw   = 0.0F;
    M5.IMU.getAccelData(&accX, &accY, &accZ);
    M5.IMU.getGyroData(&gyroX, &gyroY, &gyroZ);
    M5.IMU.getAhrsData(&pitch, &roll, &yaw);

    StaticJsonDocument<JSON_OBJECT_SIZE(13)> root;
    root["ms"] = ms;
    JsonObject acc = root.createNestedObject("acc");
    acc["x"] = accX;
    acc["y"] = accY;
    acc["z"] = accZ;
    JsonObject gyro = root.createNestedObject("gyro");
    gyro["x"] = gyroX;
    gyro["y"] = gyroY;
    gyro["z"] = gyroZ;
    JsonObject ahrs = root.createNestedObject("ahrs");
    ahrs["pitch"] = pitch;
    ahrs["roll"]  = roll;
    ahrs["yaw"]   = yaw;
    size_t len = measureJson(root);
    AsyncWebSocketMessageBuffer * buffer = ws.makeBuffer(len);
    serializeJson(root, (char*)buffer->get(), len+1);
    textAllWriteAvailable(buffer);

    prev_imu_ms = ms;
  }

  loop_count++;
}
