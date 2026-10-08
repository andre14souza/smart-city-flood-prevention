#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ==============================================================================
// PROJETO: Cidades Inteligentes: Prevenção de Enchentes
// HARDWARE: ESP32 + Sensor Ultrassônico HC-SR04
// ==============================================================================

// Configurações de Wi-Fi e Broker MQTT
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SENHA_DO_WIFI";
const char* mqtt_server = "192.168.1.100"; // IP do broker MQTT (ex: Raspberry Pi, PC com Mosquitto/Node-RED ou AWS Endpoint)
const int mqtt_port = 1883;

// Tópico MQTT padrão do projeto
const char* mqtt_topic = "cidades_inteligentes/enchentes/bueiro_01";

// Pinos do Sensor HC-SR04
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;

WiFiClient espClient;
PubSubClient client(espClient);

float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracao = pulseIn(ECHO_PIN, HIGH);
  float distancia = duracao * 0.0343 / 2.0; // Distância em cm

  // Filtro básico para falsas leituras
  if (distancia <= 0 || distancia > 400) {
    return -1;
  }
  return distancia;
}

void setup_wifi() {
  delay(10);
  Serial.print("Conectando em ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado com sucesso!");
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conectar ao broker MQTT...");
    if (client.connect("ESP32_Bueiro_Client")) {
      Serial.println(" Conectado!");
    } else {
      Serial.print(" Falha rc=");
      Serial.print(client.state());
      Serial.println(" Tentando novamente em 5 segundos...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float nivelAgua = medirDistancia();

  if (nivelAgua != -1) {
    // Criação da payload em JSON
    StaticJsonDocument<200> doc;
    doc["sensor_id"] = "bueiro_01";
    doc["distancia_cm"] = nivelAgua;
    doc["timestamp"] = millis();

    char buffer[256];
    serializeJson(doc, buffer);

    // Publicação no tópico MQTT
    client.publish(mqtt_topic, buffer);
    Serial.print("Payload publicada em ");
    Serial.print(mqtt_topic);
    Serial.print(": ");
    Serial.println(buffer);
  } else {
    Serial.println("Aviso: Leitura fora do alcance ou ruído no sensor.");
  }

  delay(5000); // Leitura a cada 5 segundos
}
