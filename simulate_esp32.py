"""
==============================================================================
PROJETO: Cidades Inteligentes - Prevenção de Enchentes
COMPONENTE: Emulador Virtual de ESP32 + HC-SR04 (Digital Twin)
==============================================================================
Substitui 100% o hardware físico (sem necessidade de comprar ESP32).
Gera telemetria realista em tempo real e transmite via MQTT para o Node-RED.
==============================================================================
"""

import time
import json
import random
import sys

try:
    import paho.mqtt.client as mqtt
except ImportError:
    print("[ERRO] Biblioteca paho-mqtt não encontrada. Execute: pip install paho-mqtt")
    sys.exit(1)

# Configurações do Broker MQTT Local (Node-RED ou Mosquitto)
BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "cidades_inteligentes/enchentes/bueiro_01"
CLIENT_ID = "ESP32_Virtual_Bueiro_01"

# Profundidade padrão da galeria (200 cm)
TOTAL_DEPTH_CM = 200.0

print("=" * 65)
print("  🌊 EMULADOR VIRTUAL DE ESP32 (GÊMEO DIGITAL DE TELEMETRIA)  ")
print("=" * 65)
print(f"[*] Conectando ao Broker MQTT em {BROKER}:{PORT}...")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, CLIENT_ID)

connected = False
try:
    client.connect(BROKER, PORT, keepalive=60)
    client.loop_start()
    connected = True
    print("[✓] Conexão estabelecida com sucesso!")
except Exception as e:
    print(f"[!] Aviso: Broker MQTT local na porta 1883 não respondeu ({e}).")
    print("    O emulador continuará gerando e exibindo a telemetria no terminal.\n")

print("\nEscolha o cenário de simulação:")
print("  [1] ☀️  Tempo Seco (Lâmina d'água baixa ~15%, seguro)")
print("  [2] 🌧️  Chuva Contínua (Nível moderado ~50%, atenção)")
print("  [3] 🚨  Tempestade Severa / Enxurrada (Nível crítico >85%, alagamento!)")
print("  [4] 🔄  Ciclo Automático (Simula tempestade gradual subindo e escoando)")
print("=" * 65)

opcao = input("Digite a opção desejada [1-4] (padrão é 4): ").strip()
if opcao not in ["1", "2", "3", "4"]:
    opcao = "4"

# Estado inicial da lâmina d'água
water_level_cm = 30.0
water_delta = 1.5

try:
    while True:
        # Dinâmica de acordo com a opção
        if opcao == "1":
            water_level_cm = max(20.0, min(40.0, 25.0 + random.uniform(-2, 2)))
        elif opcao == "2":
            water_level_cm = max(80.0, min(120.0, 100.0 + random.uniform(-4, 4)))
        elif opcao == "3":
            water_level_cm = max(165.0, min(195.0, 175.0 + random.uniform(-3, 5)))
        elif opcao == "4":
            water_level_cm += water_delta + random.uniform(-0.5, 0.5)
            if water_level_cm >= 185.0:
                water_delta = -4.0  # Começa a escoar quando enche
                print("   >>> [BUEIRO CHEIO] Calha atingiu capacidade máxima! Iniciando escoamento...")
            elif water_level_cm <= 25.0:
                water_delta = 3.5   # Começa a chover quando seca
                print("   >>> [ESTIAGEM] Nível baixo. Iniciando novo ciclo de chuva...")

        # O sensor HC-SR04 mede a distância do teto até a água
        distancia_cm = max(5.0, min(200.0, TOTAL_DEPTH_CM - water_level_cm))
        ocupacao_pct = round((water_level_cm / TOTAL_DEPTH_CM) * 100.0, 1)

        # Montagem do JSON idêntico ao código do ESP32 físico
        payload = {
            "sensor_id": "bueiro_01",
            "distancia_cm": round(distancia_cm, 1),
            "timestamp": int(time.time() * 1000)
        }

        payload_json = json.dumps(payload)

        # Status visual
        status_tag = "🟢 NORMAL"
        if ocupacao_pct >= 80.0:
            status_tag = "🔴 CRÍTICO / ENCHENTE"
        elif ocupacao_pct >= 50.0:
            status_tag = "🟡 ATENÇÃO"

        # Publicação MQTT
        if connected:
            client.publish(TOPIC, payload_json)

        print(f"[{time.strftime('%H:%M:%S')}] {status_tag} | Nível: {ocupacao_pct}% ({water_level_cm:.1f} cm) | Distância HC-SR04: {distancia_cm:.1f} cm")
        print(f"               JSON MQTT -> {payload_json}")

        time.sleep(3)

except KeyboardInterrupt:
    print("\n[!] Simulação encerrada pelo usuário.")
    if connected:
        client.loop_stop()
        client.disconnect()
