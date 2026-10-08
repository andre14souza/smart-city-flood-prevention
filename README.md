# 🌊 Cidades Inteligentes: Prevenção de Enchentes em Tempo Real
> **Projeto de Sistemas Distribuídos & Internet das Coisas (IoT)**  
> *Monitoramento proativo e alerta em tempo real de alagamentos e galerias pluviais utilizando redes de sensores inteligentes e infraestrutura de nuvem resiliente.*

---

## 📌 1. Visão Geral do Problema (O Caos das Enchentes Urbanas)

Grandes centros urbanos enfrentam anualmente episódios severos de inundações repentinas (*flash floods*), resultando em danos humanos, interrupção de serviços essenciais e prejuízos econômicos bilionários:

* **Ameaça à Vida e Mobilidade:** Vias expressas e avenidas de fundo de vale inundam em minutos, encurralando motoristas, pedestres e impedindo o tráfego de viaturas de emergência.
* **Falta de Dados em Tempo Real:** Órgãos como a Defesa Civil dependem quase exclusivamente de chamados telefônicos (199/193) ou inspeção manual em câmeras após o início do alagamento.
* **Prevenção Defasada:** Modelos meteorológicos tradicionais não captam o comportamento hidrológico hiperlocal de microbacias críticas em tempo hábil.

---

## 🔌 2. Esquema de Ligação do Hardware (ESP32 + HC-SR04)

* **VCC (HC-SR04)** $\rightarrow$ **5V (ou VIN)** do ESP32
* **GND (HC-SR04)** $\rightarrow$ **GND** do ESP32
* **Trig (HC-SR04)** $\rightarrow$ GPIO **5** do ESP32
* **Echo (HC-SR04)** $\rightarrow$ GPIO **18** do ESP32 *(Nota: utilize um divisor resistivo de tensão se necessário, pois o Echo envia 5V e o ESP32 opera em 3.3V)*

---

## 📡 3. Tópico MQTT & Payload JSON

* **Tópico:** `cidades_inteligentes/enchentes/bueiro_01`
* **Formato da Payload:**
```json
{
  "sensor_id": "bueiro_01",
  "distancia_cm": 35.4,
  "timestamp": 124500
}
```

---

## 🏗️ 3. Arquitetura de Sistemas Distribuídos

O sistema opera em uma topologia híbrida **Edge-to-Cloud**:

```
[ Sensor HC-SR04 ]
       │ (Pulso Ultrassônico)
[ Microcontrolador ESP32 ] (Filtro Mediana + Taxa de Elevação)
       │ (MQTT sobre WiFi/Mesh)
[ Edge Gateway (Node-RED) ] ── (Contingência Offline Local: Sirene / Atuador)
       │ (mTLS 8883 / Uplink Seguro)
[ AWS IoT Core ] (Broker Gerenciado + Regras de Ingestão)
       │ (IoT Rule SQL)
[ AWS Lambda ] (Processamento Serverless de Risco Hidrológico)
       ├──► [ Amazon DynamoDB ] (Série Temporal Particionada + TTL 30d)
       └──► [ Amazon SNS ] (Broadcast de Alertas SMS/Push à Defesa Civil)
```

### A. Camada Local (Edge Gateways)
* **Node-RED como Orquestrador Local:** Agrupa nós sensores de um mesmo bairro ou bacia. Consome tópicos locais `sensors/+/telemetry`.
* **Tolerância a Partição de Rede (Teorema CAP):** Em caso de queda do link com a internet, o gateway assume as decisões em modo offline, disparando alarmes locais ou sirenes municipais diretamente na via e armazenando os dados em fila circular (*Store-and-Forward*).

### B. Camada Nuvem (AWS Serverless)
* **AWS IoT Core:** Autenticação mTLS mútua por certificados X.509 por dispositivo, garantindo integridade e impossibilitando ataques de injeção de telemetria forjada.
* **AWS Lambda (`flood_risk_processor`):** Execução sem servidores com escalabilidade automática sob tempestades massivas.
* **Amazon DynamoDB:** Modelagem com chave de partição `device_id` e chave de ordenação `timestamp`, com índice secundário global (GSI) `region-timestamp-index` para consultas geoespaciais rápidas. Habilitado com TTL para retenção otimizada de 30 dias.
* **Amazon SNS:** Disparo automatizado de broadcast multicanal (SMS, e-mail e webhook) para equipes de resgate quando o nível atinge $\ge 85\%$ ou a taxa de subida ultrapassa $10\,cm/min$.

---

## 📁 4. Estrutura de Arquivos do Projeto

```
smart-city-flood-prevention/
├── index.html                   # Dashboard Web & Simulador Hidrológico em Tempo Real
├── css/
│   └── style.css                # Design System Glassmorphism, Dark Mode e Animações
├── js/
│   └── app.js                   # Motor de física da água, Web Audio e gerador MQTT
├── firmware/
│   └── esp32_smart_drain.ino    # Firmware C++ para ESP32 + HC-SR04 + MQTT TLS
├── edge/
│   └── nodered_flow.json        # Fluxo importável no Node-RED com contingência offline
├── cloud/
│   ├── iot_core_rule.sql        # Consulta SQL da regra de ingestão AWS IoT Core
│   ├── lambda_flood_processor.py # Código Python da função AWS Lambda
│   └── dynamodb_schema.json     # Esquema JSON das tabelas do DynamoDB
└── README.md                    # Documentação técnica e guia de apresentação
```

---

## 🚀 5. Como Executar o Projeto

### A. Dashboard Interativo Web
Não requer dependências externas nem build complexo. Basta abrir o arquivo `index.html` em qualquer navegador moderno ou rodar um servidor estático local:

```bash
# Opção 1: Abrir diretamente no navegador
start index.html

# Opção 2: Via servidor local (Python ou Node)
python -m http.server 8080
# Acesse no navegador: http://localhost:8080
```

### B. Firmware do ESP32 (`esp32_smart_drain.ino`)
1. Abra o arquivo na **Arduino IDE** ou **PlatformIO**.
2. Instale as bibliotecas:
   * `PubSubClient` (por Nick O'Leary)
   * `ArduinoJson` (versão 6 ou superior)
   * `WiFiClientSecure` (nativa do pacote de placas ESP32)
3. Configure as credenciais do seu Wi-Fi (`WIFI_SSID` e `WIFI_PASS`) e o endpoint do broker MQTT.
4. Conecte o sensor HC-SR04 nos pinos:
   * `VCC` -> 5V
   * `GND` -> GND
   * `TRIG` -> GPIO 5
   * `ECHO` -> GPIO 18 (utilizar divisor resistivo 1kΩ / 2kΩ se necessário para adequar nível lógico a 3.3V)
5. Grave na placa ESP32 com baud rate `115200`.

### C. Edge Gateway (Node-RED)
1. Instale o Node-RED (`npm install -g --unsafe-perm node-red`).
2. Acesse `http://localhost:1880`.
3. Menu Hamburguer -> **Import** -> Selecione o arquivo `edge/nodered_flow.json`.
4. Clique em **Deploy**.

### D. AWS Lambda & DynamoDB
1. Crie a tabela `FloodSensorReadings` no DynamoDB utilizando a definição de `cloud/dynamodb_schema.json`.
2. Crie uma função Lambda com runtime **Python 3.11+**, cole o código de `cloud/lambda_flood_processor.py` e configure a política IAM com permissões para `dynamodb:PutItem`, `dynamodb:UpdateItem` e `sns:Publish`.
3. Crie uma regra no **AWS IoT Core** utilizando o SQL contido em `cloud/iot_core_rule.sql`, apontando a ação para acionar a função Lambda.

---

## 📚 6. Referências e Fontes
* Arquitetura de Referência AWS IoT & Smart Cities (AWS Prescriptive Guidance).
* Nagrika Foundation - Urban Flood Management (nagrika.org).
* Sun Telecom - Smart City Drainage Sensors Infrastructure (suntelecom.cn).
