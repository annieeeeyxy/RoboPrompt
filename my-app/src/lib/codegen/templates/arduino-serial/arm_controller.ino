// RoboPrompt standard scaffold — Arduino servo arm, USB serial control.
//
// All hardware-specific values live in config.h (generated per project).
// This sketch implements the fixed serial protocol the web panel speaks:
//
//   115200 baud, newline-terminated ASCII commands
//   M <joint> <angle>   move one joint (degrees, clamped to config limits)
//                       -> "OK M <joint> <angle>" with the clamped angle
//   HOME                move every joint to its home angle -> "OK HOME"
//   GET                 -> "POS <a0> <a1> ..." (current angle per joint)
//   PING                -> "OK PING"
//   (boot)              -> "READY <numJoints>"
//   any error           -> "ERR <reason>"
//
// Open this sketch's folder in the Arduino IDE (the folder name must stay
// "arm_controller" so the IDE accepts the .ino), pick your board and port,
// then Upload.

#include <Servo.h>
#include <string.h>
#include <stdlib.h>
#include "config.h"

Servo servos[NUM_JOINTS];
int currentAngle[NUM_JOINTS];

char lineBuffer[32];
uint8_t lineLength = 0;
bool discardingLine = false;

int clampAngle(uint8_t joint, long angle) {
  if (angle < JOINT_MIN[joint]) return JOINT_MIN[joint];
  if (angle > JOINT_MAX[joint]) return JOINT_MAX[joint];
  return (int)angle;
}

void moveJoint(uint8_t joint, int angle) {
  currentAngle[joint] = angle;
  servos[joint].write(angle);
}

void setup() {
  Serial.begin(115200);
  for (uint8_t i = 0; i < NUM_JOINTS; i++) {
    servos[i].attach(JOINT_PINS[i]);
    moveJoint(i, JOINT_HOME[i]);
  }
  Serial.print(F("READY "));
  Serial.println(NUM_JOINTS);
}

void handleLine(char *line) {
  if (strcmp(line, "PING") == 0) {
    Serial.println(F("OK PING"));
    return;
  }
  if (strcmp(line, "HOME") == 0) {
    for (uint8_t i = 0; i < NUM_JOINTS; i++) {
      moveJoint(i, JOINT_HOME[i]);
    }
    Serial.println(F("OK HOME"));
    return;
  }
  if (strcmp(line, "GET") == 0) {
    Serial.print(F("POS"));
    for (uint8_t i = 0; i < NUM_JOINTS; i++) {
      Serial.print(' ');
      Serial.print(currentAngle[i]);
    }
    Serial.println();
    return;
  }
  if (line[0] == 'M' && line[1] == ' ') {
    char *afterJoint = NULL;
    long joint = strtol(line + 2, &afterJoint, 10);
    if (afterJoint == line + 2 || joint < 0 || joint >= NUM_JOINTS) {
      Serial.println(F("ERR bad joint"));
      return;
    }
    char *afterAngle = NULL;
    long angle = strtol(afterJoint, &afterAngle, 10);
    if (afterAngle == afterJoint) {
      Serial.println(F("ERR bad angle"));
      return;
    }
    int clamped = clampAngle((uint8_t)joint, angle);
    moveJoint((uint8_t)joint, clamped);
    Serial.print(F("OK M "));
    Serial.print(joint);
    Serial.print(' ');
    Serial.println(clamped);
    return;
  }
  Serial.println(F("ERR unknown command"));
}

void loop() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      if (discardingLine) {
        discardingLine = false;
      } else if (lineLength > 0) {
        lineBuffer[lineLength] = '\0';
        handleLine(lineBuffer);
      }
      lineLength = 0;
    } else if (discardingLine) {
      // swallow the rest of an oversized line
    } else if (lineLength < sizeof(lineBuffer) - 1) {
      lineBuffer[lineLength++] = c;
    } else {
      discardingLine = true;
      lineLength = 0;
      Serial.println(F("ERR line too long"));
    }
  }
}
