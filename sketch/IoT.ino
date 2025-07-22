#include <Wire.h>
#include <ESP8266WiFi.h>
#include <Adafruit_ADS1X15.h>
#include <PubSubClient.h>
#include "arduino_secrets.h"
#include <ArduinoJson.h>

#define RELAY_PIN D8
#define MOVEMENT_SENSOR_PIN D7
#define green D5
#define red D6

Adafruit_ADS1115 ads;
WiFiClientSecure device;
PubSubClient client(device);

float minCurrentVolt;
bool isOn = false;
unsigned long timeUpdata=millis();
bool isAuto = true;
bool isDeviceOn = false;

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    String clientID =  "ESPClient-";
    clientID += String(random(0xffff),HEX);
    if (client.connect(clientID.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("MQTT connected");
      client.subscribe(AUTO_TOPIC);
      client.subscribe(CONTROL_TOPIC);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void wifi_setup() {
  Serial.println("Connecting to wifi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi failed");
    delay(1000);
  }

  Serial.println("WiFi connected!");
  Serial.println(WiFi.localIP());
}

void ads_setup() {
  ads.setGain(GAIN_TWOTHIRDS);
  if (!ads.begin()) {
    Serial.print("ads failed");
    while (1);
  }
}

void pin_setup() {
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(MOVEMENT_SENSOR_PIN, INPUT);
  pinMode(red, OUTPUT);
  pinMode(green, OUTPUT);
}

float measureIdleCurrentVoltage() {
  float sum = 0.0;
  int samples = 30;
  for (int i = 0; i < samples; i++) {
    int16_t rawCurrent = ads.readADC_SingleEnded(1);
    float sensorCurrentV = ads.computeVolts(rawCurrent);
    sensorCurrentV = round(sensorCurrentV * 100000) / 100000.0;
    sum += sensorCurrentV;
  }
  
  return sum / samples;
}

void consumption() {
  int16_t rawVoltage = ads.readADC_SingleEnded(0);
  int16_t rawCurrent = ads.readADC_SingleEnded(1);

  float sensorVoltage = ads.computeVolts(rawVoltage);
  float sensorCurrentV = ads.computeVolts(rawCurrent);

  sensorCurrentV = round(sensorCurrentV * 100000) / 100000.0;

  float realVoltage = sensorVoltage * 5.05;
  float current = (sensorCurrentV - minCurrentVolt) / 0.185;

  if (current < 0.01) current = 0;
  if (realVoltage < 0.1) realVoltage = 0;

  if (millis() - timeUpdata > 1000) {
    DynamicJsonDocument doc(1024);
    doc["volts"] = realVoltage;
    doc["current"] = current;
    char mqtt_message[128];
    serializeJson(doc, mqtt_message);
    publishMessage(SEND_TOPIC, mqtt_message);

    timeUpdata = millis();
  }
}

void sendActivate(bool flag) {
  DynamicJsonDocument doc(1024);
  doc["activate"] = flag;
  char mqtt_ms[128];
  serializeJson(doc, mqtt_ms);
  publishMessage(ACTIVATE_TOPIC, mqtt_ms);
}

void process() {
  if (digitalRead(MOVEMENT_SENSOR_PIN) && isAuto) {
    if (!isOn) {
      isOn = true;
      minCurrentVolt = measureIdleCurrentVoltage();
    }
    sendActivate(true);
    while (digitalRead(MOVEMENT_SENSOR_PIN)) {
      digitalWrite(RELAY_PIN, HIGH);
      consumption();
    }
    isOn = false;
    digitalWrite(RELAY_PIN, LOW);
    sendActivate(false);
  } else if (isDeviceOn == true && isAuto == false) {
    if (!isOn) {
      isOn = true;
      minCurrentVolt = measureIdleCurrentVoltage();
      sendActivate(true);
    }
  
    digitalWrite(RELAY_PIN, HIGH);
    consumption();
  } else {
    if (isOn) {
      isOn = false;
      digitalWrite(RELAY_PIN, LOW);
      sendActivate(false);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Convert payload to a null-terminated string
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';

  Serial.println("Message arrived [" + String(topic) + "]: " + String(message));

  StaticJsonDocument<100> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("JSON parse failed: ");
    Serial.println(error.f_str());
    return;
  }

  if (strcmp(topic, AUTO_TOPIC) == 0) {
    if (doc.containsKey("isAuto")) {
      isAuto = doc["isAuto"];
      Serial.print("isAuto set to: ");
      Serial.println(isAuto);
    }
  } else if (strcmp(topic, CONTROL_TOPIC) == 0) {
    if (doc.containsKey("isOn")) {
      isDeviceOn = doc["isOn"];
      Serial.print("isDeviceOn set to: ");
      Serial.println(isDeviceOn);
    } else {
      Serial.println("Key 'isOn' not found.");
    }
  }
}

void publishMessage(const char* topic, String payload) {
  if (client.publish(topic, payload.c_str(), true))
    Serial.println("Message published [" + String(topic) +"]: " + payload);
}

void setup() {
  Serial.begin(9600);
  pin_setup();
  digitalWrite(green, 0);
  digitalWrite(red, 1);
  wifi_setup();
  ads_setup();
  digitalWrite(green, 1);
  digitalWrite(red, 0);
  device.setInsecure();
  client.setServer(MQTT_SERVER, MQTT_PORT);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  process();
}
