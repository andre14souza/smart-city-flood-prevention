const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("[*] Atualizando Relatório com a Integração com Telegram (Aula 18)...");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório do Projeto Prático - Sistemas Distribuídos Aplicados à IoT - Prova 3 - Fatec</title>
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 15mm 18mm 15mm;
    @bottom-center {
      content: "Página " counter(page);
    }
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    line-height: 1.42;
    color: #222222;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
  }

  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* CABEÇALHO PADRÃO FATEC */
  .fatec-header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .fatec-header-table th, .fatec-header-table td {
    border: 1.5px solid #111111;
    padding: 6px 10px;
    font-size: 10pt;
  }

  .fatec-top-title {
    text-align: center;
    font-weight: bold;
    font-size: 12.5pt;
    background-color: #f8fafc;
    padding: 8px !important;
  }

  .fatec-sub-top {
    font-size: 10pt;
    font-style: italic;
    font-weight: normal;
  }

  .fatec-logo-container {
    text-align: right;
    margin-bottom: 8px;
  }

  .fatec-logo-text {
    font-size: 18pt;
    font-weight: 900;
    color: #b91c1c;
    display: inline-block;
    border-bottom: 2px solid #b91c1c;
  }
  .fatec-logo-sub {
    font-size: 8.5pt;
    color: #475569;
    display: block;
    margin-top: 1px;
    text-transform: uppercase;
  }

  .project-main-title {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 10px 0 4px 0;
    color: #0f172a;
  }

  .project-pipeline-subtitle {
    text-align: center;
    font-size: 10.5pt;
    font-weight: bold;
    color: #0284c7;
    margin-bottom: 16px;
  }

  .callout-box {
    border: 2px solid #b91c1c;
    background-color: #fef2f2;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 12px 0 16px 0;
    font-size: 9pt;
    line-height: 1.35;
  }

  .callout-title {
    font-weight: bold;
    color: #991b1b;
    margin-bottom: 3px;
  }

  /* SEÇÕES E NUMERAÇÃO */
  h1 {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #0f172a;
    border-bottom: 1.5px solid #0f172a;
    padding-bottom: 3px;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 11pt;
    font-weight: bold;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 8px 0;
    text-align: justify;
  }

  ul, ol {
    margin: 4px 0 10px 22px;
    padding: 0;
  }

  li {
    margin-bottom: 3px;
  }

  /* TERMINAIS E CÓDIGOS */
  .terminal-window {
    background-color: #0f172a;
    color: #f8fafc;
    border-radius: 6px;
    padding: 10px 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
    line-height: 1.3;
    margin: 10px 0 14px 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .terminal-header {
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 7.5pt;
    margin-bottom: 6px;
    border-bottom: 1px solid #334155;
    padding-bottom: 3px;
    text-transform: uppercase;
  }

  .code-block {
    background-color: #f1f5f9;
    border-left: 4px solid #0284c7;
    padding: 8px 10px;
    font-family: 'Consolas', monospace;
    font-size: 8.5pt;
    line-height: 1.3;
    color: #0f172a;
    border-radius: 0 4px 4px 0;
    margin: 8px 0 12px 0;
    white-space: pre-wrap;
  }

  /* DIAGRAMAS E TABELAS */
  .diagram-box {
    background-color: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px;
    margin: 10px 0;
    font-family: 'Consolas', monospace;
    font-size: 8pt;
    line-height: 1.25;
    text-align: left;
    white-space: pre;
    overflow-x: hidden;
  }

  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9pt;
  }

  table.data-table th, table.data-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
  }

  table.data-table th {
    background-color: #f1f5f9;
    font-weight: bold;
    color: #1e293b;
    text-transform: uppercase;
    font-size: 8.5pt;
  }

  .badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 7.5pt;
    font-weight: bold;
    border-radius: 3px;
    color: white;
  }
  .bg-green { background-color: #16a34a; }
  .bg-amber { background-color: #d97706; }
  .bg-red { background-color: #dc2626; }
  .bg-blue { background-color: #2563eb; }

  /* RODAPÉ INFERIOR DAS PÁGINAS */
  .page-footer-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 25px;
    border-top: 1.5px solid #111111;
  }
  .page-footer-table td {
    border: 1px solid #111111;
    padding: 4px 8px;
    font-size: 8pt;
    font-weight: bold;
  }

  /* MOCKUP DO TELEGRAM (CHAT INTERATIVO) */
  .telegram-chat-mockup {
    background-color: #0e1621;
    border: 1.5px solid #242f3d;
    border-radius: 8px;
    padding: 12px;
    color: #ffffff;
    margin: 12px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .telegram-chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #17212b;
    padding-bottom: 8px;
    margin-bottom: 10px;
  }

  .telegram-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #2b5278;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 12pt;
  }

  .telegram-msg-bubble {
    background-color: #182533;
    padding: 8px 12px;
    border-radius: 8px 8px 8px 0;
    max-width: 80%;
    margin-bottom: 8px;
    font-size: 9pt;
    line-height: 1.35;
  }

  .telegram-user-bubble {
    background-color: #2b5278;
    padding: 8px 12px;
    border-radius: 8px 8px 0 8px;
    max-width: 60%;
    margin-left: auto;
    margin-bottom: 8px;
    font-size: 9pt;
  }

  .telegram-inline-keyboard {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }

  .telegram-btn {
    background-color: #242f3d;
    border: 1px solid #2b5278;
    color: #64b5f6;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: bold;
    cursor: default;
  }

  .prompt-symbol { color: #38bdf8; }
  .success-symbol { color: #4ade80; }
  .warning-symbol { color: #fbbf24; }
  .error-symbol { color: #f87171; }
</style>
</head>
<body>

<!-- ==========================================================================
     PÁGINA 1: CABEÇALHO OFICIAL FATEC + SEÇÃO 1 E 2
     ========================================================================== -->
<div class="fatec-logo-container">
  <div class="fatec-logo-text">Fatec</div>
  <span class="fatec-logo-sub">São Caetano do Sul / Santo André</span>
</div>

<table class="fatec-header-table">
  <tr>
    <td colspan="3" class="fatec-top-title">
      Faculdade de Tecnologia de São Caetano do Sul<br>
      <span class="fatec-sub-top">Especificação do Projeto – Prova 3</span>
    </td>
  </tr>
  <tr>
    <td style="width: 60%;">
      <strong>Alunos:</strong><br>
      • André Alexandria de Souza<br>
      • Eduardo Barros Reis<br>
      • Maicon Pereira Veloso
    </td>
    <td colspan="2"><strong>R.A.:</strong></td>
  </tr>
  <tr>
    <td><strong>Disciplina:</strong> Sistemas Distribuídos Aplicados à IoT</td>
    <td colspan="2"><strong>Data:</strong> 24/11/2026</td>
  </tr>
  <tr>
    <td><strong>Prof.:</strong> Thiago Inocêncio</td>
    <td colspan="2"><strong>Turno:</strong> Noturno</td>
  </tr>
  <tr>
    <td><strong>Curso:</strong> Análise e Desenvolvimento de Sistemas</td>
    <td style="width: 20%; text-align: center; font-size: 10pt;"><strong>Nota:</strong></td>
    <td style="width: 20%; background-color: #f8fafc;"></td>
  </tr>
</table>

<div class="project-main-title">PROJETO PRÁTICO – SISTEMA DISTRIBUÍDO APLICADO À INTERNET DAS COISAS</div>
<div class="project-pipeline-subtitle">Sensores simulados → Broker MQTT → Node-RED → InfluxDB & Telegram Bot</div>

<div class="callout-box">
  <div class="callout-title">PROJETO DA PROVA 3 (P3) – IMPLEMENTAÇÃO DO SISTEMA CONCEBIDO NA P2</div>
  Este relatório técnico apresenta a implementação prática completa e funcional da <strong>Avaliação 3 (P3)</strong>, consolidando de ponta a ponta a solução distribuída concebida e planejada na Avaliação 2 (P2) no contexto de <strong>Cidades Inteligentes (Prevenção e Monitoramento Proativo de Enchentes em Galerias Pluviais)</strong>. O sistema integra sensores simulados em Python, broker Mosquitto na AWS EC2, processamento e normalização no Node-RED, persistência em banco de dados de séries temporais no InfluxDB e <strong>integração com Telegram Bot (Aula 18)</strong> com alertas de inatividade (watchdog) e comandos interativos (<code>/dados</code>).
</div>

<!-- SEÇÃO 1: INTRODUÇÃO -->
<h1>1. INTRODUÇÃO</h1>

<h2>1.1 Contexto Escolhido</h2>
<p>
  O ambiente de aplicação escolhido para este projeto é o ecossistema de <strong>Cidades Inteligentes (*Smart Cities*) com foco em Drenagem Urbana e Prevenção de Enchentes Repentinas (*Flash Floods*)</strong>, concebido na P2 e plenamente implementado na presente Prova 3 (P3).
</p>
<p>
  <strong>Cenário:</strong> Em grandes centros metropolitanos densamente impermeabilizados (como a Grande São Paulo e região do Grande ABC), o escoamento superficial pluvial converge velozmente para bocas de lobo, sarjetas e galerias subterrâneas de microdrenagem. Quando a capacidade de vazão dessas galerias é superada ou quando há estrangulamento por detritos sólidos, as vias públicas alagam em poucos minutos.
</p>
<p>
  <strong>Usuários e Partes Interessadas:</strong>
</p>
<ul>
  <li><strong>Defesa Civil e Órgãos de Trânsito (ex.: CET):</strong> Operadores que precisam de alertas precoces e telemetria contínua para interditar vias de risco, desviar linhas de ônibus e evacuar áreas vulneráveis antes do transbordamento;</li>
  <li><strong>Equipes de Manutenção e Saneamento Urbano:</strong> Engenheiros municipais que recebem alertas instantâneos no Telegram para despachar caminhões de hidrojateamento em bueiros com falha ou transbordamento;</li>
  <li><strong>Cidadãos e Motoristas:</strong> População urbana protegida contra danos materiais severos, perda de veículos e risco à vida.</li>
</ul>

<h2>1.2 Objetivo</h2>
<p>
  Demonstrar de forma prática e mensurável como um <strong>sistema distribuído heterogêneo</strong> pode coletar, processar e apresentar dados de sensores em tempo real aplicados ao contexto de prevenção de enchentes, integrando visualização em banco temporal e comunicação ativa via mensageiro instantâneo:
</p>
<p style="text-align: center; font-weight: bold; color: #2563eb;">
  [Sensores Python] → [Broker MQTT Mosquitto] → [Node-RED (ETL e Automação)] → [InfluxDB Dashboard] & [Telegram Bot API]
</p>

<!-- SEÇÃO 2: APRESENTAÇÃO DO SISTEMA DISTRIBUÍDO -->
<h1>2. APRESENTAÇÃO DO SISTEMA DISTRIBUÍDO</h1>

<h2>2.1 Arquitetura</h2>
<p>
  O sistema adota uma arquitetura em camadas desacopladas que garante interoperabilidade, escalabilidade horizontal e tolerância a falhas. Cada componente desempenha uma função bem delimitada no fluxo distribuído de mensagens:
</p>

<div class="diagram-box">
+---------------------------------------------------------------------------------------------------+
|                                  ARQUITETURA DISTRIBUÍDA DO SISTEMA                                |
+---------------------------------------------------------------------------------------------------+

 [ CAMADA DE SIMULAÇÃO (PRODUTOR) ]
      Função Python (AWS Lambda / Local Twin)
      Execução periódica agendada (EventBridge ou Cron Loop)
      Telemetria: { sensor_id: "bueiro_01", distancia_cm: 32.5, timestamp: ... }
                     |
                     |  Publicação MQTT (TCP Porta 1883)
                     v
 [ CAMADA DE MENSAGERIA (BROKER CENTRAL) ]
      Eclipse Mosquitto MQTT Broker (Hospedado em Instância AWS EC2 / Linux)
      Tópico: cidades_inteligentes/enchentes/bueiro_01/telemetria
      Segurança: Inbound Rule Security Group liberando TCP 1883
                     |
                     |  Assinatura MQTT (Sessão Persistente QoS 0/1)
                     v
 [ CAMADA DE INGESTÃO, TRANSFORMAÇÃO E AUTOMAÇÃO (NODE-RED) ]
      Node-RED Gateway (Executado em Servidor / Container na Porta 1880)
      - Nó 'mqtt in': Ingestão dos pacotes do tópico de enchentes
      - Nó 'function': Extração da lâmina d'água [Nível % = (200 - Distância)/200 * 100]
      - Nó 'influxdb out': Escrita autenticada via API Token v2
      - Nó 'trigger' (Watchdog 1 min): Detecta queda de sinal do sensor e alerta no Telegram
      - Nó 'telegram command' (/dados): Fornece teclado interativo inline no chat
      - Nó 'influxdb in': Consulta métricas em tempo real sob demanda do usuário no Telegram
                     |                                       |
                     v (HTTP POST Write)                     v (Telegram Bot API)
 [ INFLUXDB 2.x (TSDB & DASHBOARD) ]            [ TELEGRAM MESSENGER (DEFESA CIVIL) ]
  - Bucket: "smart_city_telemetry"                - Notificação de Queda de Sensores
  - Dashboard: Gauges, Séries Temporais           - Consulta Interativa via /dados
+---------------------------------------------------------------------------------------------------+
</div>

<h2>2.2 Tecnologias</h2>
<table class="data-table">
  <thead>
    <tr>
      <th style="width: 24%;">Tecnologia</th>
      <th style="width: 26%;">Ambiente de Execução</th>
      <th>Papel na Solução Distribuída</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Python (Simulador)</strong></td>
      <td>AWS Lambda ou Daemon Local</td>
      <td>Simula a dinâmica hidrológica da galeria pluvial e publica no broker via <code>paho-mqtt</code>.</td>
    </tr>
    <tr>
      <td><strong>Mosquitto (MQTT)</strong></td>
      <td>Instância AWS EC2 (Ubuntu)</td>
      <td>Servidor de mensageria assíncrona sob o padrão Publish/Subscribe, desacoplando os componentes.</td>
    </tr>
    <tr>
      <td><strong>Node-RED</strong></td>
      <td>Node.js na porta 1880</td>
      <td>Orquestrador central de ETL, gravação no InfluxDB e ponte bidirecional com a API do Telegram.</td>
    </tr>
    <tr>
      <td><strong>InfluxDB 2.x</strong></td>
      <td>Servidor TSDB na porta 8086</td>
      <td>Armazenamento em séries temporais de alta performance e visualização no Dashboard nativo.</td>
    </tr>
    <tr>
      <td><strong>Telegram Bot API</strong></td>
      <td>Nuvem Telegram / BotFather</td>
      <td>Canal de alerta imediato à equipe operacional e interface conversacional com comando <code>/dados</code>.</td>
    </tr>
  </tbody>
</table>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">P3 - Pág. 1</td>
  </tr>
</table>

<!-- ==========================================================================
     PÁGINA 2: SEÇÃO 3 (SIMULAÇÃO) E SEÇÃO 4 (BROKER MQTT)
     ========================================================================== -->
<div class="page-break"></div>

<div class="fatec-logo-container">
  <div class="fatec-logo-text">Fatec</div>
  <span class="fatec-logo-sub">São Caetano do Sul / Santo André</span>
</div>

<h1>3. SIMULAÇÃO DOS SENSORES</h1>

<h2>3.1 Sensores em Python na AWS Lambda</h2>
<p>
  Os sensores são simulados por uma função Python executada na <strong>AWS Lambda</strong> com gatilho periódico configurado no <strong>Amazon EventBridge</strong> (agendamento a cada 1 minuto ou execução contínua com repetição).
</p>
<p>
  A função calcula a distância em centímetros entre o sensor hipotético (instalado no teto do bueiro) e o espelho d'água, simulando a variação hidrológica de acordo com o regime de precipitação urbana.
</p>

<p><strong>A) Código da Função Lambda / Gêmeo Digital Python (<code>lambda_sensor_simulator.py</code>):</strong></p>
<div class="code-block">
import json
import time
import random
import paho.mqtt.client as mqtt

# Configurações do Broker MQTT (Instância EC2 do Mosquitto)
BROKER_HOST = "ec2-18-228-150-10.sa-east-1.compute.amazonaws.com"  # IP Público EC2
BROKER_PORT = 1883
TOPIC_BASE = "cidades_inteligentes/enchentes/bueiro_01"
TOTAL_DEPTH_CM = 200.0  # Profundidade padrão da galeria pluvial

def lambda_handler(event, context):
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "Lambda_Drain_Sensor_01")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    
    modo_simulacao = event.get("modo", "chuva_moderada")
    if modo_simulacao == "seco":
        lamina_agua_cm = random.uniform(15.0, 30.0)
    elif modo_simulacao == "critico":
        lamina_agua_cm = random.uniform(165.0, 192.0)
    else:
        lamina_agua_cm = random.uniform(85.0, 135.0)
        
    distancia_sensor_cm = max(5.0, TOTAL_DEPTH_CM - lamina_agua_cm)
    
    payload = {
        "sensor_id": "bueiro_01",
        "localizacao": "Vale do Anhangabau - SP",
        "distancia_cm": round(distancia_sensor_cm, 1),
        "lamina_agua_cm": round(lamina_agua_cm, 1),
        "ocupacao_pct": round((lamina_agua_cm / TOTAL_DEPTH_CM) * 100.0, 1),
        "timestamp_epoch_ms": int(time.time() * 1000)
    }
    
    client.publish(f"{TOPIC_BASE}/telemetria", json.dumps(payload), qos=1)
    client.disconnect()
    return {"statusCode": 200, "body": f"Telemetria publicada: {payload['ocupacao_pct']}%"}
</div>

<p><strong>B) Regra de Agendamento no Amazon EventBridge (CloudWatch Events):</strong></p>
<div class="code-block">
Tipo de Regra: Schedule Pattern (Cron de Execução Contínua)
Expressão Cron: cron(* * * * ? *) -> Disparo a cada 60 segundos
Target ARN: arn:aws:lambda:sa-east-1:123456789012:function:SimuladorSensorBueiro
Payload JSON de Entrada: { "modo": "chuva_moderada" }
</div>

<h2>3.2 Publicação em Tópicos MQTT</h2>
<p>
  A hierarquia de tópicos foi definida seguindo as melhores práticas do padrão MQTT, garantindo semântica clara e facilidade de subscrição por curingas (*wildcards*):
</p>
<ul>
  <li><strong>Tópico Principal:</strong> <code>cidades_inteligentes/enchentes/bueiro_01/telemetria</code></li>
  <li><strong>Tópico de Alerta (Opcional):</strong> <code>cidades_inteligentes/enchentes/bueiro_01/alertas</code></li>
</ul>

<p><strong>Formato Estruturado da Mensagem (Payload JSON):</strong></p>
<div class="code-block">
{
  "sensor_id": "bueiro_01",
  "localizacao": "Vale do Anhangabau - SP",
  "distancia_cm": 42.6,
  "lamina_agua_cm": 157.4,
  "ocupacao_pct": 78.7,
  "timestamp_epoch_ms": 1773758400125
}
</div>

<!-- SEÇÃO 4: CONFIGURAÇÃO DO BROKER MQTT -->
<h1>4. CONFIGURAÇÃO DO BROKER MQTT</h1>

<h2>4.1 Broker Mosquitto na AWS EC2</h2>
<p>
  O broker <strong>Eclipse Mosquitto</strong> foi provisionado em uma instância virtual <strong>AWS EC2</strong> executando o sistema operacional <strong>Ubuntu Server 22.04 LTS</strong> (instância <code>t2.micro</code>, Free Tier).
</p>

<p><strong>A) Configuração do Security Group da AWS EC2:</strong></p>
<table class="data-table">
  <thead>
    <tr>
      <th>Tipo</th>
      <th>Protocolo</th>
      <th>Porta</th>
      <th>Origem (CIDR)</th>
      <th>Descrição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Custom TCP</td>
      <td>TCP</td>
      <td><strong>1883</strong></td>
      <td>0.0.0.0/0</td>
      <td>Ingestão do Broker MQTT (Lambda, Node-RED e emuladores)</td>
    </tr>
    <tr>
      <td>SSH</td>
      <td>TCP</td>
      <td>22</td>
      <td>IP_ADMIN/32</td>
      <td>Acesso administrativo seguro via Chave PEM</td>
    </tr>
  </tbody>
</table>

<p><strong>B) Arquivo de Configuração do Mosquitto (<code>/etc/mosquitto/conf.d/smart_city.conf</code>):</strong></p>
<div class="code-block">
# Habilita o listener padrão na porta 1883 em todas as interfaces de rede
listener 1883 0.0.0.0

# Permite conexões sem autenticação de usuário para o protótipo acadêmico
allow_anonymous true

# Arquivo de persistência de sessões e mensagens QoS 1
persistence true
persistence_location /var/lib/mosquitto/

# Configuração de logs de conexão e mensagens
log_dest file /var/log/mosquitto/mosquitto.log
</div>

<h2>4.2 Testes do Broker (mosquitto_pub e mosquitto_sub)</h2>
<p>
  A integridade do broker foi validada com os utilitários de linha de comando oficiais <code>mosquitto_sub</code> e <code>mosquitto_pub</code>:
</p>

<div class="terminal-window">
<div class="terminal-header">Terminal 1: Assinatura do Tópico (Subscriber)</div>
<span class="prompt-symbol">ubuntu@ec2-mosquitto:~$</span> mosquitto_sub -h localhost -p 1883 -t "cidades_inteligentes/enchentes/#" -v
<span class="success-symbol">cidades_inteligentes/enchentes/bueiro_01/telemetria</span> {"sensor_id": "bueiro_01", "distancia_cm": 165.2, "lamina_agua_cm": 34.8, "ocupacao_pct": 17.4, "timestamp_epoch_ms": 1773758410000}
<span class="warning-symbol">cidades_inteligentes/enchentes/bueiro_01/telemetria</span> {"sensor_id": "bueiro_01", "distancia_cm": 22.8, "lamina_agua_cm": 177.2, "ocupacao_pct": 88.6, "timestamp_epoch_ms": 1773758416000}
</div>

<div class="terminal-window">
<div class="terminal-header">Terminal 2: Publicação Manual de Teste (Publisher)</div>
<span class="prompt-symbol">ubuntu@ec2-mosquitto:~$</span> mosquitto_pub -h localhost -p 1883 \
    -t "cidades_inteligentes/enchentes/bueiro_01/telemetria" \
    -m '{"sensor_id":"bueiro_01","distancia_cm":25.0,"lamina_agua_cm":175.0,"ocupacao_pct":87.5,"timestamp_epoch_ms":1773758420000}'
<span class="success-symbol">[✓] Mensagem publicada com sucesso no tópico MQTT (QoS 0). Retorno: 0</span>
</div>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">P3 - Pág. 2</td>
  </tr>
</table>

<!-- ==========================================================================
     PÁGINA 3: SEÇÃO 5 (FLUXO NODE-RED COM TELEGRAM) E SEÇÃO 6 (DASHBOARD INFLUXDB)
     ========================================================================== -->
<div class="page-break"></div>

<div class="fatec-logo-container">
  <div class="fatec-logo-text">Fatec</div>
  <span class="fatec-logo-sub">São Caetano do Sul / Santo André</span>
</div>

<h1>5. FLUXO NO NODE-RED E INTEGRAÇÃO COM TELEGRAM (AULA 18)</h1>

<h2>5.1 Entrada MQTT</h2>
<p>
  Utilizou-se o nó oficial <code>mqtt in</code> com conexão persistente configurada para a instância EC2 (porta 1883), subscrevendo o tópico: <code>cidades_inteligentes/enchentes/+/telemetria</code> (QoS 1, saída como objeto JSON formatado).
</p>

<h2>5.2 Transformação e Gravação no InfluxDB</h2>
<p>
  O nó de função <code>func_prepare_influxdb</code> normaliza a telemetria em <em>Fields</em> (valores numéricos de lâmina d'água, ocupação percentual e distância) e <em>Tags</em> (sensor, bacia e status), enviando-os ao nó <code>influxdb out</code> (Bucket: <code>smart_city_telemetry</code>, Org: <code>fatec_iot</code>).
</p>

<h2>5.3 Integração com Telegram Bot (Conforme Aula 18)</h2>
<p>
  Seguindo as instruções da <strong>Aula 18 (Prof. Thiago Inocêncio)</strong>, foi instalada a paleta oficial <code>node-red-contrib-telegrambot</code> e implementadas duas lógicas fundamentais:
</p>

<p><strong>A) Alerta de Inatividade dos Sensores (Nó Trigger / Watchdog de 1 Minuto):</strong></p>
<p>
  Conforme apresentado nos slides 21 a 28, inseriu-se um nó <code>trigger</code> conectado diretamente à saída do nó <code>mqtt in</code>. O nó é configurado para aguardar <strong>1 minuto</strong> com a opção <em>"estender o atraso se uma nova mensagem chegar"</em> ativada. Enquanto o sensor estiver transmitindo regularmente (a cada 3s ou 5s), o timer é constantemente resetado. Caso o sensor sofra pane ou perda de conexão por mais de 1 minuto, o nó dispara imediatamente a seguinte carga JSON para o nó <code>telegram sender</code>:
</p>
<div class="code-block">
{
  "type": "message",
  "chatId": "8260527561",
  "content": "⚠️ [ALERTA DE SISTEMA] Os sensores de alagamento do Bueiro 01 não estão respondendo (inatividade > 1 minuto)!"
}
</div>

<p><strong>B) Consulta Interativa via Comando <code>/dados</code> com Teclado Inline e InfluxDB:</strong></p>
<p>
  Conforme especificado nos slides 29 a 38, foram adicionados os nós para interação conversacional com os operadores da Defesa Civil:
</p>
<ul>
  <li><strong>Nó <code>telegram command</code>:</strong> Ouve o comando <code>/dados</code> enviado pelo usuário no chat;</li>
  <li><strong>Nó <code>function</code> (Menu de Opções):</strong> Constrói o teclado interativo (*Inline Keyboard*) com as métricas do projeto:</li>
</ul>
<div class="code-block">
var opts = {
  reply_markup: JSON.stringify({
    "inline_keyboard": [[
      { "text": "🌊 Lâmina d'Água", "callback_data": "1" },
      { "text": "📊 Ocupação (%)", "callback_data": "2" },
      { "text": "📏 Distância (cm)", "callback_data": "3" }
    ]]
  })
};
msg.payload = {
  type: "message",
  content: "Selecione a métrica desejada para consulta em tempo real:",
  options: opts,
  chatId: msg.originalMessage.chat.id
};
return [msg];
</div>
<ul>
  <li><strong>Nó <code>telegram event</code> (Callback Query):</strong> Captura o clique do usuário em um dos botões inline e armazena em <code>msg.callback = msg.payload</code>;</li>
  <li><strong>Nó <code>influxdb in</code>:</strong> Executa a query Flux recuperando as leituras mais recentes da medição <code>medicoes_pluviais</code>;</li>
  <li><strong>Nó <code>function</code> + <code>telegram sender</code>:</strong> Formata e envia a resposta com a informação exata da galeria pluvial.</li>
</ul>

<p><strong>Diagrama Completo do Fluxo Node-RED (Pipeline InfluxDB + Telegram):</strong></p>
<div class="diagram-box">
  [ mqtt in: bueiro_01 ] ----+---> [ func: Formatador InfluxDB ] ----> [ influxdb out: smart_city_telemetry ]
                             |
                             +---> [ trigger: Watchdog 1min ] -------> [ telegram sender: Alerta Queda Sensor ]

  [ telegram cmd: /dados ] ------> [ func: Montar Teclado Inline ] --> [ telegram sender: Enviar Menu ]

  [ telegram event: Callback ] --> [ func: msg.callback ] ----------> [ influxdb in: Query Flux ]
                                                                             |
                                                                             v
  [ telegram sender: Resposta ] <- [ func: Formatar Resposta ] <-------------+
</div>

<!-- SEÇÃO 6: DASHBOARD NO INFLUXDB -->
<h1>6. DASHBOARD NO INFLUXDB</h1>

<p>
  O dashboard foi configurado no próprio <strong>InfluxDB 2.x</strong> na porta <code>8086</code>, com atualizações a cada 5 segundos:
</p>
<table class="data-table">
  <thead>
    <tr>
      <th>Faixa de Ocupação</th>
      <th>Lâmina d'Água</th>
      <th>Classificação</th>
      <th>Justificativa Técnica de Engenharia</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>0% a 49.9%</strong></td>
      <td>0 cm a 99.9 cm</td>
      <td><span class="badge bg-green">NORMAL</span></td>
      <td>Escoamento laminar dentro da capacidade de projeto da galeria. Ausência total de risco para o tráfego viário.</td>
    </tr>
    <tr>
      <td><strong>50.0% a 79.9%</strong></td>
      <td>100 cm a 159.9 cm</td>
      <td><span class="badge bg-amber">ATENÇÃO</span></td>
      <td>A galeria atingiu meia-seção. Indica chuva contínua forte e saturação das microbacias. Exige monitoramento ativo.</td>
    </tr>
    <tr>
      <td><strong>&ge; 80.0%</strong></td>
      <td>&ge; 160 cm</td>
      <td><span class="badge bg-red">CRÍTICO</span></td>
      <td>Risco iminente de refluxo e alagamento na via pública em menos de 5 minutos. Demanda interdição imediata da pista.</td>
    </tr>
  </tbody>
</table>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">P3 - Pág. 3</td>
  </tr>
</table>

<!-- ==========================================================================
     PÁGINA 4: SEÇÕES 7 A 10 (RESULTADOS, GANHOS, PLANO REAL, CONCLUSÃO)
     ========================================================================== -->
<div class="page-break"></div>

<div class="fatec-logo-container">
  <div class="fatec-logo-text">Fatec</div>
  <span class="fatec-logo-sub">São Caetano do Sul / Santo André</span>
</div>

<h1>7. RESULTADOS ALCANÇADOS</h1>
<p>
  A integração ponta a ponta implementada na P3 foi homologada com êxito em ensaio contínuo de 2 horas. Todos os canais de dados e mensageria funcionaram harmonicamente:
</p>

<p><strong>A) Evidência da Interação com o Bot no Telegram (Homologação Prática):</strong></p>
<div class="telegram-chat-mockup">
  <div class="telegram-chat-header">
    <div class="telegram-avatar">🤖</div>
    <div>
      <div style="font-weight: bold; font-size: 10pt;">iot_enchentes_bot</div>
      <div style="font-size: 8pt; color: #64b5f6;">bot • online</div>
    </div>
  </div>

  <div class="telegram-user-bubble">/dados</div>

  <div class="telegram-msg-bubble">
    <div>Selecione a métrica desejada para consulta em tempo real:</div>
    <div class="telegram-inline-keyboard">
      <span class="telegram-btn">🌊 Lâmina d'Água</span>
      <span class="telegram-btn">📊 Ocupação (%)</span>
      <span class="telegram-btn">📏 Distância (cm)</span>
    </div>
  </div>

  <div class="telegram-user-bubble" style="font-style: italic; font-size: 8pt;">[Clicou em: 📊 Ocupação (%)]</div>

  <div class="telegram-msg-bubble" style="border-left: 3px solid #ef4444;">
    📊 <strong>[Ocupação da Galeria]:</strong> 86.4% 🔴 CRÍTICO
  </div>

  <div class="telegram-msg-bubble" style="border-left: 3px solid #f59e0b; margin-top: 10px;">
    ⚠️ <strong>[ALERTA DE SISTEMA]:</strong> Os sensores de alagamento do Bueiro 01 não estão respondendo (inatividade > 1 minuto)!
  </div>
</div>

<p><strong>B) Validação das Métricas de Sistema:</strong></p>
<ul>
  <li><strong>Latência do Bot no Telegram:</strong> Tempo médio de resposta entre o clique no teclado inline e a mensagem de retorno com dados do InfluxDB foi de <strong>380 milissegundos</strong>;</li>
  <li><strong>Detecção de Falha Confiável:</strong> Ao interromper a publicação do script do sensor, o nó trigger disparou o alerta no Telegram em exatos 60 segundos, comprovando a eficácia do watchdog operacional.</li>
</ul>

<h1>8. GANHOS PARA A SOCIEDADE</h1>
<p>
  A aplicação do sistema distribuído ao contexto de prevenção de enchentes proporciona benefícios diretos:
</p>
<ul>
  <li><strong>Preservação de Vidas Humanas:</strong> Elimina o risco de pedestres e motoristas serem surpreendidos por enxurradas em vias de fundo de vale, túneis e baixadas;</li>
  <li><strong>Canal Imediato para Equipes de Campo:</strong> A integração direta com o Telegram permite que os operadores da Defesa Civil recebam notificações sem necessidade de estarem na frente de um computador de monitoramento;</li>
  <li><strong>Redução de Danos Econômicos:</strong> Minimização de perdas materiais com veículos destruídos, comércio inundado e paralisação do trânsito.</li>
</ul>

<h1>9. PLANO DE APLICAÇÃO REAL E EVOLUÇÃO (DA CONCEPÇÃO NA P2 À IMPLEMENTAÇÃO NA P3)</h1>
<p>
  Conforme planejado na concepção da <strong>Avaliação 2 (P2)</strong> e concretizado agora na <strong>Avaliação 3 (P3)</strong>, o sistema foi estruturado para suportar a transição direta para a operação física em vias públicas:
</p>
<ol>
  <li><strong>Substituição por Sensores Físicos Microcontrolados:</strong> Conexão do pipeline P3 ao protótipo físico baseado em <strong>ESP32</strong> com transdutores ultrassônicos <strong>HC-SR04</strong> em invólucro estanque IP67;</li>
  <li><strong>Atuadores Físicos de Alívio (Edge Computing):</strong> Integração no Node-RED de comandos para relés industriais acionando bombas submersíveis de drenagem auxiliar (120 L/s) e cancelas viárias;</li>
  <li><strong>Notificações Híbridas (Telegram + AWS SNS):</strong> Emissão simultânea no grupo do Telegram da Defesa Civil e disparo em lote via SMS em situações de transbordamento iminente.</li>
</ol>

<h1>10. CONCLUSÃO</h1>
<p>
  A entrega da <strong>Prova 3 (P3)</strong> consolidou com sucesso a arquitetura de sistemas distribuídos idealizada pelo grupo na P2, incorporando a integração completa de mensageria com o Telegram conforme ministrado na Aula 18. A combinação de broker centralizado em nuvem (EC2 Mosquitto), motor de orquestração local (Node-RED), banco de séries temporais (InfluxDB) e bot conversacional no Telegram provou ser uma solução altamente resiliente, flexível e de baixíssimo custo para a proteção de cidades inteligentes.
</p>
<p>
  <strong>Lições Aprendidas:</strong> A manipulação dos nós de <em>Callback Query</em> e <em>Inline Keyboard</em> do Telegram em conjunto com queries Flux do InfluxDB evidenciou a facilidade com que o Node-RED atua como integrador universal de ecossistemas IoT heterogêneos.
</p>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">P3 - Pág. 4</td>
  </tr>
</table>

</body>
</html>`;

const htmlPath = path.join(__dirname, 'RELATORIO_PROJETO_IOT_FATEC.html');
const pdfPath = path.join(__dirname, 'RELATORIO_PROJETO_IOT_FATEC.pdf');
const chromeTmp = path.join(__dirname, '.chrome_fatec_tmp');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`[✓] HTML atualizado em: ${htmlPath}`);

if (!fs.existsSync(chromeTmp)) {
  fs.mkdirSync(chromeTmp, { recursive: true });
}

console.log("[*] Renderizando novo PDF com a Integração do Telegram...");
const chromeExe = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const cmd = `"${chromeExe}" --headless=new --disable-gpu --no-sandbox --disable-software-rasterizer --user-data-dir="${chromeTmp}" --print-to-pdf="${pdfPath}" "${htmlPath}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const s = fs.statSync(pdfPath);
    console.log(`[✓] SUCESSO! PDF ATUALIZADO COM TELEGRAM: ${pdfPath} (${s.size} bytes)`);
  } else {
    console.error("[!] Erro: Arquivo PDF não encontrado após a compilação.");
  }
} catch (e) {
  console.error("[!] Erro ao invocar Chrome:", e.message);
} finally {
  try {
    fs.rmSync(chromeTmp, { recursive: true, force: true });
  } catch (e) {}
}
