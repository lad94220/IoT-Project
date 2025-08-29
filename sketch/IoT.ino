#include <Wire.h>
#include <ESP8266WiFi.h>
#include <Adafruit_ADS1X15.h>
#include <PubSubClient.h>
#include "arduino_secrets.h"
#include <ArduinoJson.h>
#include <WiFiClient.h>
#include <EEPROM.h>
#include <ESP8266WebServer.h>

#define RELAY_PIN D8
#define MOVEMENT_SENSOR_PIN D7
#define green D5
#define red D6

Adafruit_ADS1115 ads;
WiFiClientSecure device;
PubSubClient client(device);
ESP8266WebServer webServer(80);

float minCurrentVolt;
bool isOn = false;
unsigned long timeUpdata = millis();
bool isAuto = true;
bool isDeviceOn = false;
bool inAPMode = false;
String foundSSIDs;
unsigned long lastAlive = millis();
const int ALIVE_INTERVAL_MS = 10000;

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    String clientID = "ESPClient-";
    clientID += String(random(0xffff), HEX);
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
  set_web();
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP("DEN_THONG_MINH");
  if (restore_wifi() && check_wifi()) {
    inAPMode = false;
  } else {
    inAPMode = true;
  }
  ap_mode();
}

void regular_wifi_check() {
  if (WiFi.status() != WL_CONNECTED && !inAPMode) {
    restore_wifi();
    if (!check_wifi()) {
      inAPMode = true;
      ap_mode();
    }
  }
  webServer.handleClient();
}

bool restore_wifi() {
  String ssid = "";
  String password = "";
  if (EEPROM.read(0) != 0) {
    for (int i = 0; i < 32; ++i) {
      ssid += char(EEPROM.read(i));
    }
    for (int i = 32; i < 96; ++i) {
      password += char(EEPROM.read(i));
    }
    WiFi.begin(ssid.c_str(), password.c_str());
    return true;
  }
  return false;
}

bool check_wifi() {
  for (int i = 0; i < 30; ++i) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("da ket noi");
      return true;
    }
    delay(500);
  }
  return false;
}


void set_web() {
  webServer.on("/", HTTP_GET, []() {
    if (inAPMode) {
      String content;
      content += "<h1>Nhập kết nối WiFi</h1>";
      content += "<form action=\"/submit\" method=\"POST\">";
      content += "<label>SSID: </label><select name=\"ssid\">";
      content += foundSSIDs;
      content += "</select><br>";
      content += "<label>Password: </label><input name=\"password\" length=64 type=\"password\"><br>";
      content += "<input type=\"submit\"></form>";
      content += "<p>Nếu không thấy mạng của bạn, <a href=\"/reset\">bấm vào đây để reset và quét lại mạng</a>.</p>";
      webServer.send(200, "text/html", buildPage("Ket noi WiFi", content));
    } else {
      String content = "<h1>Reset mạng</h1>";
      content += "<p>Mạng hiện tại: " + WiFi.SSID() + "</p>";
      content += "<form action=\"/reset\" method=\"POST\">";
      content += "<button type=\"submit\">Reset mạng wifi </button>";
      content += "</form>";
      webServer.send(200, "text/html", buildPage("Reset mang", content));
    }
  });

  webServer.on("/submit", HTTP_POST, []() {
    for (int i = 0; i < 96; ++i) {
      EEPROM.write(i, 0);
    }
    String ssid = urldecode(webServer.arg("ssid"));
    String password = urldecode(webServer.arg("password"));

    for (int i = 0; i < ssid.length(); ++i) {
      EEPROM.write(i, ssid[i]);
    }
    for (int i = 0; i < password.length(); ++i) {
      EEPROM.write(i + 32, password[i]);
    }
    EEPROM.commit();
    webServer.send(200, "text/html", "Dang ket noi WiFi....");
    delay(1000);
    ESP.restart();
  });

  webServer.on("/reset", HTTP_POST, []() {
    for (int i = 0; i < 96; ++i) {
      EEPROM.write(i, 0);
    }
    EEPROM.commit();

    webServer.send(200, "text/html", "Thiet bi da reset");
    delay(1000);
    ESP.restart();
  });

  webServer.begin();
}

void ap_mode() {
  WiFi.disconnect();
  delay(100);
  int n = WiFi.scanNetworks();
  delay(100);
  foundSSIDs = "";
  for (int i = 0; i < n; ++i) {
    foundSSIDs += "<option value=\"" + WiFi.SSID(i) + "\">" + WiFi.SSID(i) + "</option>";
  }
  Serial.print("Nhap wifi");
}

String buildPage(const String& title, const String& bodyContent) {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  html += "<title>" + title + "</title>";
  html += "<style>body{font-family:sans-serif;margin:2em;}</style>";
  html += "</head><body>" + bodyContent + "</body></html>";
  return html;
}

String urldecode(String str) {
  String encodedString = "";
  char c;
  char code0;
  char code1;
  for (int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (c == '+') {
      encodedString += ' ';
    } else if (c == '%') {
      i++;
      code0 = str.charAt(i);
      i++;
      code1 = str.charAt(i);
      c = (h2int(code0) << 4) | h2int(code1);
      encodedString += c;
    } else {

      encodedString += c;
    }

    yield();
  }

  return encodedString;
}

unsigned char h2int(char c) {
  if (c >= '0' && c <= '9') {
    return ((unsigned char)c - '0');
  }
  if (c >= 'a' && c <= 'f') {
    return ((unsigned char)c - 'a' + 10);
  }
  if (c >= 'A' && c <= 'F') {
    return ((unsigned char)c - 'A' + 10);
  }
  return (0);
}

void ads_setup() {
  ads.setGain(GAIN_TWOTHIRDS);
  if (!ads.begin()) {
    Serial.print("ads failed");
    while (1)
      ;
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

void connection_alive() {
  if (millis() - lastAlive >= ALIVE_INTERVAL_MS) {
    DynamicJsonDocument doc(64);
    doc["alive"] = true;
    char payload[32];
    serializeJson(doc, payload);
    publishMessage(ALIVE_TOPIC, payload);
    lastAlive = millis();
  }
}

void process() {
  connection_alive();
  if (digitalRead(MOVEMENT_SENSOR_PIN) && isAuto) {
    if (!isOn) {
      isOn = true;
      minCurrentVolt = measureIdleCurrentVoltage();
    }
    sendActivate(true);
    while (digitalRead(MOVEMENT_SENSOR_PIN)) {
      digitalWrite(RELAY_PIN, HIGH);
      consumption();
      connection_alive();
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
    Serial.println("Message published [" + String(topic) + "]: " + payload);
}

void setup() {
  Serial.begin(9600);
  EEPROM.begin(128);
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
  regular_wifi_check();
  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      reconnect();
    }
    client.loop();
    process();
  }
}
