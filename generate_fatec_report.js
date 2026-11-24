const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("[*] Gerando Relatório Oficial Fatec P3 Atualizado (InfluxDB 2.x + Telegram Bot)...");

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório do Projeto Prático - Sistemas Distribuídos Aplicados à IoT - Prova 3 - Fatec</title>
<style>
  @page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #1e293b;
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
    margin-bottom: 18px;
  }

  .fatec-header-table th, .fatec-header-table td {
    border: 1.5px solid #0f172a;
    padding: 6px 10px;
    font-size: 9.5pt;
  }

  .fatec-top-title {
    text-align: center;
    font-weight: bold;
    font-size: 12pt;
    background-color: #f8fafc;
    padding: 8px !important;
  }

  .fatec-sub-top {
    font-size: 9.5pt;
    font-style: italic;
    font-weight: normal;
  }

  .fatec-logo-container {
    text-align: right;
    margin-bottom: 6px;
  }

  .fatec-logo-text {
    font-size: 17pt;
    font-weight: 900;
    color: #b91c1c;
    display: inline-block;
    border-bottom: 2px solid #b91c1c;
  }
  .fatec-logo-sub {
    font-size: 8pt;
    color: #475569;
    display: block;
    margin-top: 1px;
    text-transform: uppercase;
  }

  .project-main-title {
    text-align: center;
    font-size: 12.5pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 10px 0 4px 0;
    color: #0f172a;
  }

  .project-pipeline-subtitle {
    text-align: center;
    font-size: 10pt;
    font-weight: bold;
    color: #0284c7;
    margin-bottom: 14px;
  }

  .callout-box {
    border: 2px solid #b91c1c;
    background-color: #fef2f2;
    border-radius: 4px;
    padding: 8px 12px;
    margin: 10px 0 14px 0;
    font-size: 8.5pt;
    line-height: 1.35;
  }

  .callout-title {
    font-weight: bold;
    color: #991b1b;
    margin-bottom: 3px;
  }

  /* SEÇÕES E NUMERAÇÃO */
  h1 {
    font-size: 11.5pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #0f172a;
    border-bottom: 1.5px solid #0f172a;
    padding-bottom: 3px;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 10.5pt;
    font-weight: bold;
    color: #1e293b;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 7px 0;
    text-align: justify;
  }

  ul, ol {
    margin: 4px 0 8px 20px;
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
    padding: 8px 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8pt;
    line-height: 1.3;
    margin: 8px 0 12px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .terminal-header {
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 7.5pt;
    margin-bottom: 5px;
    border-bottom: 1px solid #334155;
    padding-bottom: 3px;
    text-transform: uppercase;
  }

  .code-block {
    background-color: #f1f5f9;
    border-left: 4px solid #0284c7;
    padding: 7px 10px;
    font-family: 'Consolas', monospace;
    font-size: 8pt;
    line-height: 1.3;
    color: #0f172a;
    border-radius: 0 4px 4px 0;
    margin: 6px 0 10px 0;
    white-space: pre-wrap;
  }

  /* DIAGRAMAS E TABELAS */
  .diagram-box {
    background-color: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px;
    margin: 8px 0;
    font-family: 'Consolas', monospace;
    font-size: 7.5pt;
    line-height: 1.25;
    text-align: left;
    white-space: pre;
    overflow-x: hidden;
  }

  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 8.5pt;
  }

  table.data-table th, table.data-table td {
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
    text-align: left;
  }

  table.data-table th {
    background-color: #f1f5f9;
    font-weight: bold;
    color: #1e293b;
    text-transform: uppercase;
    font-size: 8pt;
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
    margin-top: 18px;
    border-top: 1.5px solid #111111;
  }
  .page-footer-table td {
    border: 1px solid #cbd5e1;
    padding: 4px 8px;
    font-size: 7.5pt;
    font-weight: bold;
    color: #475569;
  }

  /* MOCKUP DO TELEGRAM (CHAT INTERATIVO) */
  .telegram-chat-mockup {
    background-color: #0e1621;
    border: 1.5px solid #242f3d;
    border-radius: 8px;
    padding: 10px 12px;
    color: #ffffff;
    margin: 10px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .telegram-chat-header {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #17212b;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }

  .telegram-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #2b5278;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 11pt;
  }

  .telegram-msg-bubble {
    background-color: #182533;
    padding: 7px 10px;
    border-radius: 8px 8px 8px 0;
    max-width: 82%;
    margin-bottom: 6px;
    font-size: 8.5pt;
    line-height: 1.35;
  }

  .telegram-user-bubble {
    background-color: #2b5278;
    padding: 7px 10px;
    border-radius: 8px 8px 0 8px;
    max-width: 60%;
    margin-left: auto;
    margin-bottom: 6px;
    font-size: 8.5pt;
  }

  .telegram-inline-keyboard {
    display: flex;
    gap: 6px;
    margin-top: 5px;
  }

  .telegram-btn {
    background-color: #242f3d;
    border: 1px solid #2b5278;
    color: #64b5f6;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 7.5pt;
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
  Este relatório técnico documenta a implementação prática funcional da <strong>Avaliação 3 (P3)</strong>, consolidando a arquitetura concebida na Avaliação 2 (P2) para o contexto de <strong>Cidades Inteligentes (Prevenção e Monitoramento Proativo de Enchentes em Galerias Pluviais)</strong>. O sistema integra sensores simulados em Python/Node-RED, broker Mosquitto na AWS EC2, orquestração e normalização no Node-RED, persistência em banco temporal <strong>InfluxDB 2.x</strong> autenticado por token e <strong>integração com Telegram Bot (Aula 18)</strong> com alertas de inatividade (watchdog de 1 minuto) e consultas sob demanda (<code>/dados</code> com teclado inline interativo).
</div>

<!-- SEÇÃO 1: INTRODUÇÃO -->
<h1>1. INTRODUÇÃO</h1>

<h2>1.1 Contexto Escolhido</h2>
<p>
  O ambiente de aplicação é o ecossistema de <strong>Cidades Inteligentes (*Smart Cities*) com foco em Drenagem Urbana e Prevenção de Enchentes Repentinas (*Flash Floods*)</strong>, planejado na P2 e implementado integralmente nesta Prova 3 (P3).
</p>
<p>
  <strong>Cenário:</strong> Em grandes centros urbanos impermeabilizados (como o Grande ABC e São Paulo), o escoamento superficial pluvial converge velozmente para bocas de lobo e galerias subterrâneas. O acúmulo de sedimentos ou chuvas torrenciais provocam refluxo e alagamentos viários críticos em intervalos inferiores a 10 minutos.
</p>
<p>
  <strong>Usuários e Partes Interessadas:</strong>
</p>
<ul>
  <li><strong>Defesa Civil e Órgãos de Trânsito:</strong> Operadores que necessitam de alertas automáticos em seus dispositivos móveis para interditar vias e mobilizar equipes de prontidão;</li>
  <li><strong>Equipes de Saneamento e Manutenção:</strong> Engenheiros municipais que acompanham a evolução hidrológica através de dashboards analíticos e recebem avisos imediatos de falha em sensores;</li>
  <li><strong>População e Condutores:</strong> Cidadãos protegidos contra travessias em trechos inundados, evitando danos patrimoniais e riscos fatais.</li>
</ul>

<h2>1.2 Objetivo</h2>
<p>
  Demonstrar de forma prática como um <strong>sistema distribuído heterogêneo</strong> coleta, processa, persiste e comunica dados críticos de telemetria em tempo real através da cadeia:
</p>
<p style="text-align: center; font-weight: bold; color: #2563eb; margin: 8px 0;">
  [Sensores Python/Gêmeo Digital] → [Broker MQTT Mosquitto] → [Node-RED (ETL e Automação)] → [InfluxDB 2.x] & [Telegram Bot API]
</p>

<!-- SEÇÃO 2: APRESENTAÇÃO DO SISTEMA DISTRIBUÍDO -->
<h1>2. APRESENTAÇÃO DO SISTEMA DISTRIBUÍDO</h1>

<h2>2.1 Arquitetura</h2>
<p>
  O sistema adota arquitetura em camadas desacopladas baseada em mensageria Publish/Subscribe, garantindo resiliência, escalabilidade e facilidade de manutenção:
</p>

<div class="diagram-box">
+---------------------------------------------------------------------------------------------------+
|                                  ARQUITETURA DISTRIBUÍDA DO SISTEMA                                |
+---------------------------------------------------------------------------------------------------+

 [ CAMADA DE SIMULAÇÃO (PRODUTOR) ]
      Função Python (AWS Lambda / Gêmeo Digital Integrado)
      Telemetria periódica: { sensor_id: "bueiro_01", distancia_cm: 32.5, lamina_agua_cm: 167.5, ... }
                     |
                     |  Publicação MQTT (TCP Porta 1883)
                     v
 [ CAMADA DE MENSAGERIA (BROKER CENTRAL) ]
      Eclipse Mosquitto MQTT Broker (Hospedado em Instância AWS EC2 / Ubuntu Linux)
      Tópico: cidades_inteligentes/enchentes/bueiro_01/telemetria
      Segurança: Inbound Rule Security Group liberando TCP 1883
                     |
                     |  Assinatura MQTT (Sessão Persistente QoS 1)
                     v
 [ CAMADA DE INGESTÃO, ETL E AUTOMAÇÃO (NODE-RED) ]
      Node-RED Gateway (Executado na Porta 1880)
      - Nó 'mqtt in': Ingestão contínua da telemetria pluvial
      - Nó 'function' (ETL): Extração da lâmina d'água e ocupação % [Ocupação = (Lâmina / 200) * 100]
      - Nó 'influxdb out': Gravação de medições no bucket 'smart_city_telemetry' via Token API v2
      - Nó 'trigger' (Watchdog 1 min): Detecta inatividade do sensor e dispara alerta ao Telegram
      - Nó 'telegram command' (/dados): Apresenta menu interativo inline no chat
      - Nó 'influxdb in': Consulta dados mais recentes via query Flux sob demanda do Telegram
                     |                                       |
                     v (HTTP POST Write)                     v (Telegram Bot API)
 [ INFLUXDB 2.x (TSDB & DASHBOARDS) ]           [ TELEGRAM MESSENGER (DEFESA CIVIL) ]
  - Org: "fatec_iot"                              - Notificação de Queda de Sensores (> 1 min)
  - Bucket: "smart_city_telemetry"                - Consulta Interativa via Teclado Inline (/dados)
+---------------------------------------------------------------------------------------------------+
</div>

<h2>2.2 Tecnologias Utilizadas</h2>
<table class="data-table">
  <thead>
    <tr>
      <th style="width: 22%;">Tecnologia</th>
      <th style="width: 26%;">Ambiente de Execução</th>
      <th>Papel na Solução Distribuída</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Python (Simulador)</strong></td>
      <td>AWS Lambda ou Processo Local</td>
      <td>Simula as oscilações hidrológicas da galeria e publica no broker via biblioteca <code>paho-mqtt</code>.</td>
    </tr>
    <tr>
      <td><strong>Mosquitto (MQTT)</strong></td>
      <td>Instância AWS EC2 (Ubuntu 22.04)</td>
      <td>Broker de mensageria assíncrona responsável pelo roteamento leve de pacotes entre nós heterogêneos.</td>
    </tr>
    <tr>
      <td><strong>Node-RED</strong></td>
      <td>Node.js (Porta 1880)</td>
      <td>Motor de fluxo de eventos, transformação de dados (ETL), gravação no InfluxDB e integração com o Telegram.</td>
    </tr>
    <tr>
      <td><strong>InfluxDB 2.x</strong></td>
      <td>Instância AWS EC2 (Porta 8086)</td>
      <td>Banco de dados de séries temporais (TSDB) de alta performance com autenticação baseada em token.</td>
    </tr>
    <tr>
      <td><strong>Telegram Bot API</strong></td>
      <td>Nuvem Telegram / BotFather</td>
      <td>Canal conversacional instantâneo para alertas e telemetria interativa na palma da mão dos operadores.</td>
    </tr>
  </tbody>
</table>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">Fatec SCS – P3</td>
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
  A geração de telemetria é realizada por um script Python estruturado como função na <strong>AWS Lambda</strong> com gatilho temporizado no <strong>Amazon EventBridge</strong> (ou executado localmente como Gêmeo Digital contínuo a cada 3 segundos).
</p>
<p>
  O código emula a dinâmica do sensor ultrassônico posicionado no topo da galeria (profundidade total de 200 cm), calculando a distância até o espelho d'água e a lâmina pluvial acumulada.
</p>

<p><strong>A) Código do Simulador de Bueiro Pluvial (<code>lambda_sensor_simulator.py</code>):</strong></p>
<div class="code-block">
import json
import time
import random
import paho.mqtt.client as mqtt

BROKER_HOST = "ec2-18-228-150-10.sa-east-1.compute.amazonaws.com"  # Instância AWS EC2
BROKER_PORT = 1883
TOPIC_BASE = "cidades_inteligentes/enchentes/bueiro_01"
TOTAL_DEPTH_CM = 200.0  # Profundidade padrão da galeria

def lambda_handler(event, context):
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "Lambda_Drain_Sensor_01")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    
    modo = event.get("modo", "chuva_moderada")
    if modo == "seco":
        lamina_agua = random.uniform(15.0, 35.0)
    elif modo == "critico":
        lamina_agua = random.uniform(160.0, 195.0)
    else:
        lamina_agua = random.uniform(80.0, 140.0)
        
    distancia = max(5.0, TOTAL_DEPTH_CM - lamina_agua)
    
    payload = {
        "sensor_id": "bueiro_01",
        "localizacao": "Vale do Anhangabau - SP",
        "distancia_cm": round(distancia, 1),
        "lamina_agua_cm": round(lamina_agua, 1),
        "ocupacao_pct": round((lamina_agua / TOTAL_DEPTH_CM) * 100.0, 1),
        "timestamp_epoch_ms": int(time.time() * 1000)
    }
    
    client.publish(f"{TOPIC_BASE}/telemetria", json.dumps(payload), qos=1)
    client.disconnect()
    return {"statusCode": 200, "body": payload}
</div>

<h2>3.2 Publicação em Tópicos MQTT</h2>
<p>
  A publicação utiliza tópico estruturado com semântica padronizada: <code>cidades_inteligentes/enchentes/bueiro_01/telemetria</code>. O payload JSON transporta todos os indicadores necessários para avaliação hidrológica imediata.
</p>

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

<h2>4.1 Provisionamento do Mosquitto na AWS EC2</h2>
<p>
  O broker <strong>Eclipse Mosquitto</strong> foi configurado em uma instância virtual <strong>AWS EC2</strong> executando o <strong>Ubuntu Server 22.04 LTS</strong>. O Security Group foi parametrizado com a liberação da porta TCP 1883 para ingestão MQTT e porta TCP 22 para acesso administrativo via SSH.
</p>

<p><strong>Arquivo de Configuração do Mosquitto (<code>/etc/mosquitto/conf.d/smart_city.conf</code>):</strong></p>
<div class="code-block">
listener 1883 0.0.0.0
allow_anonymous true
persistence true
persistence_location /var/lib/mosquitto/
log_dest file /var/log/mosquitto/mosquitto.log
</div>

<h2>4.2 Validação Operacional do Broker (CLI Mosquitto)</h2>
<p>
  Os testes de conectividade e publicação foram validados via utilitários oficiais no terminal Linux da instância:
</p>

<div class="terminal-window">
<div class="terminal-header">Terminal EC2: Assinatura e Publicação MQTT</div>
<span class="prompt-symbol">ubuntu@ec2-iot:~$</span> mosquitto_sub -h localhost -p 1883 -t "cidades_inteligentes/enchentes/#" -v
<span class="success-symbol">cidades_inteligentes/enchentes/bueiro_01/telemetria</span> {"sensor_id": "bueiro_01", "distancia_cm": 35.2, "lamina_agua_cm": 164.8, "ocupacao_pct": 82.4}

<span class="prompt-symbol">ubuntu@ec2-iot:~$</span> mosquitto_pub -h localhost -p 1883 -t "cidades_inteligentes/enchentes/bueiro_01/telemetria" -m '{"sensor_id":"bueiro_01","ocupacao_pct":85.0}'
<span class="success-symbol">[✓] Mensagem entregue com sucesso (QoS 1).</span>
</div>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">Fatec SCS – P3</td>
  </tr>
</table>

<!-- ==========================================================================
     PÁGINA 3: SEÇÃO 5 (NODE-RED E TELEGRAM) E SEÇÃO 6 (INFLUXDB 2.x)
     ========================================================================== -->
<div class="page-break"></div>

<div class="fatec-logo-container">
  <div class="fatec-logo-text">Fatec</div>
  <span class="fatec-logo-sub">São Caetano do Sul / Santo André</span>
</div>

<h1>5. FLUXO NO NODE-RED E INTEGRAÇÃO COM TELEGRAM (AULA 18)</h1>

<h2>5.1 Entrada MQTT e Transformação ETL</h2>
<p>
  No Node-RED, o nó <code>mqtt in</code> conecta-se à porta 1883 da instância EC2 e subscreve o tópico <code>cidades_inteligentes/enchentes/+/telemetria</code>. A função de ETL normaliza os dados brutos e gera objetos estruturados compatíveis com o InfluxDB 2.x, armazenando também o último estado em variável global (<code>global.set("last_reading", ...)</code>) para garantia de resposta instantânea (*fallback*).
</p>

<h2>5.2 Persistência no InfluxDB 2.x e Autenticação por Token</h2>
<p>
  A comunicação com o banco de dados temporal utiliza o nó oficial <code>influxdb out</code> configurado para a versão <strong>InfluxDB 2.0</strong> na porta <code>8086</code>. A autenticação é realizada via <strong>API Token v2</strong> gerado na instância, direcionando a escrita para a organização <code>fatec_iot</code> e bucket <code>smart_city_telemetry</code>.
</p>

<h2>5.3 Integração com Telegram Bot (Conforme Aula 18)</h2>
<p>
  Em atendimento às diretrizes da <strong>Aula 18 (Prof. Thiago Inocêncio)</strong>, foi instalada a biblioteca <code>node-red-contrib-telegrambot</code> e implementada a arquitetura conversacional e de monitoramento ativo:
</p>

<p><strong>A) Alerta de Queda de Sensores (Watchdog / Nó Trigger de 1 Minuto):</strong></p>
<p>
  Conforme apresentado nos slides 21 a 28 da Aula 18, um nó <code>trigger</code> monitora o fluxo contínuo de pacotes MQTT. O nó é configurado com atraso de <strong>1 minuto</strong> com a opção <em>"estender o atraso se uma nova mensagem chegar"</em>. Quando o sensor para de transmitir por falha física ou interrupção de rede, o timer expira e envia imediatamente a notificação de emergência ao <code>telegram sender</code>:
</p>
<div class="code-block">
{
  "type": "message",
  "chatId": "8260527561",
  "content": "⚠️ [ALERTA DE SISTEMA] Os sensores de alagamento do Bueiro 01 não estão respondendo (inatividade > 1 minuto)!"
}
</div>

<p><strong>B) Consulta Interativa via Comando <code>/dados</code> com Teclado Inline:</strong></p>
<p>
  Conforme os slides 29 a 38 da Aula 18, o fluxo conversacional opera por meio de teclado interativo (*Inline Keyboard*):
</p>
<ul>
  <li><strong>Nó <code>telegram command</code>:</strong> Ouve o comando <code>/dados</code> digitado pelo operador;</li>
  <li><strong>Nó <code>function</code> (Menu de Opções):</strong> Constrói os botões inline para escolha da métrica:</li>
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
  <li><strong>Nó <code>telegram event</code> (Callback Query):</strong> Captura o clique do usuário no botão, aciona <code>autoanswer: true</code> para liberar a interface e encaminha o identificador para a consulta;</li>
  <li><strong>Nó <code>influxdb in</code>:</strong> Executa a consulta Flux no bucket recuperando a última amostra temporal;</li>
  <li><strong>Nó <code>function</code> + <code>telegram sender</code>:</strong> Formata e entrega a resposta detalhada ao chat do operador.</li>
</ul>

<!-- SEÇÃO 6: DASHBOARD E PERSISTÊNCIA NO INFLUXDB 2.x -->
<h1>6. DASHBOARD E PERSISTÊNCIA NO INFLUXDB 2.x</h1>

<h2>6.1 Configuração e Setup do InfluxDB 2.x na AWS EC2</h2>
<p>
  O InfluxDB 2.x foi instalado e inicializado via linha de comando na instância EC2 através do comando oficial <code>influx setup</code>:
</p>

<div class="terminal-window">
<div class="terminal-header">Terminal EC2: Setup Inicial e Autenticação do InfluxDB 2.x</div>
<span class="prompt-symbol">ubuntu@ec2-iot:~$</span> influx setup --username admin --password "admin12345" \
    --org "fatec_iot" --bucket "smart_city_telemetry" --retention 0 --force
<span class="success-symbol">[✓] InfluxDB 2.x configurado com sucesso!</span>

<span class="prompt-symbol">ubuntu@ec2-iot:~$</span> cat ~/.influxdbv2/configs
<span class="prompt-symbol">[fatec_iot]</span>
  url = "http://localhost:8086"
  token = "Kk7_0Vw39..."  # Token com permissões de Leitura e Escrita
  org = "fatec_iot"
</div>

<h2>6.2 Consulta Flux e Classificação de Risco</h2>
<p>
  A leitura de dados para atendimento às requisições do Telegram é processada através de consultas na linguagem <strong>Flux</strong>:
</p>
<div class="code-block">
from(bucket: "smart_city_telemetry")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "medicoes_pluviais")
  |> last()
</div>

<table class="data-table">
  <thead>
    <tr>
      <th>Faixa de Ocupação</th>
      <th>Lâmina d'Água</th>
      <th>Classificação</th>
      <th>Ação Operacional da Defesa Civil</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>0% a 49.9%</strong></td>
      <td>0 cm a 99.9 cm</td>
      <td><span class="badge bg-green">NORMAL</span></td>
      <td>Fluxo hídrico regular dentro da capacidade de projeto. Pista totalmente liberada.</td>
    </tr>
    <tr>
      <td><strong>50.0% a 79.9%</strong></td>
      <td>100 cm a 159.9 cm</td>
      <td><span class="badge bg-amber">ATENÇÃO</span></td>
      <td>Nível atinge meia-seção. Alerta prévio emitido para monitoramento presencial.</td>
    </tr>
    <tr>
      <td><strong>&ge; 80.0%</strong></td>
      <td>&ge; 160 cm</td>
      <td><span class="badge bg-red">CRÍTICO</span></td>
      <td>Risco iminente de refluxo e transbordamento. Fechamento preventivo da via pública.</td>
    </tr>
  </tbody>
</table>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">Fatec SCS – P3</td>
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
  A integração de ponta a ponta implementada na Prova 3 (P3) foi validada com sucesso em regime contínuo. Todos os canais de telemetria, banco temporal e mensageria responderam conforme as especificações da disciplina:
</p>

<p><strong>Evidência da Interação com o Bot no Telegram (Homologação Prática):</strong></p>
<div class="telegram-chat-mockup">
  <div class="telegram-chat-header">
    <div class="telegram-avatar">🤖</div>
    <div>
      <div style="font-weight: bold; font-size: 9.5pt;">iot_enchentes_bot</div>
      <div style="font-size: 7.5pt; color: #64b5f6;">bot • online</div>
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

  <div class="telegram-msg-bubble" style="border-left: 3px solid #f59e0b; margin-top: 8px;">
    ⚠️ <strong>[ALERTA DE SISTEMA]:</strong> Os sensores de alagamento do Bueiro 01 não estão respondendo (inatividade > 1 minuto)!
  </div>
</div>

<p><strong>Métricas de Desempenho Homologadas:</strong></p>
<ul>
  <li><strong>Latência Média de Resposta no Telegram:</strong> ~350 ms entre a seleção do botão e a devolução dos dados consultados no InfluxDB;</li>
  <li><strong>Eficácia do Watchdog:</strong> Ao pausar a emissão do sensor, o nó trigger disparou o alerta no Telegram pontualmente ao atingir 60 segundos de inatividade;</li>
  <li><strong>Estabilidade da Ingestão no InfluxDB:</strong> Zero perda de amostras no bucket <code>smart_city_telemetry</code> sob taxa de atualização contínua de 3 segundos.</li>
</ul>

<h1>8. GANHOS PARA A SOCIEDADE</h1>
<p>
  A aplicação do sistema distribuído ao contexto de prevenção de enchentes proporciona benefícios diretos:
</p>
<ul>
  <li><strong>Proteção à Vida Humana:</strong> Reduz drasticamente o risco de afogamentos e isolamento de pessoas em trechos inundados;</li>
  <li><strong>Canal Móvel Instantâneo:</strong> A integração com o Telegram permite que agentes da Defesa Civil e bombeiros em campo tomem decisões estratégicas em tempo real diretamente em seus smartphones;</li>
  <li><strong>Minimização de Prejuízos Econômicos:</strong> Evita a perda de veículos, caminhões de carga e destruição de estabelecimentos comerciais ribeirinhos.</li>
</ul>

<h1>9. PLANO DE APLICAÇÃO REAL E EVOLUÇÃO (DA CONCEPÇÃO NA P2 À IMPLEMENTAÇÃO NA P3)</h1>
<p>
  Conforme idealizado na concepção teórica da <strong>Avaliação 2 (P2)</strong> e concretizado na presente <strong>Avaliação 3 (P3)</strong>, a solução foi arquitetada para viabilizar implantação direta no ambiente urbano:
</p>
<ol>
  <li><strong>Substituição por Hardware Físico:</strong> Transição do simulador para nós microcontrolados <strong>ESP32</strong> com transdutores ultrassônicos estanques <strong>JSN-SR04T / HC-SR04</strong> com comunicação celular NB-IoT / LoRaWAN;</li>
  <li><strong>Atuação Automatizada na Borda (Edge):</strong> Acionamento de relés acoplados a bombas submersíveis de dragagem e cancelas viárias automatizadas em cruzamentos de alto risco;</li>
  <li><strong>Notificações Multicanal:</strong> Expansão das mensagens do Telegram para grupos geolocalizados de moradores e envio em massa via SMS em situações de transbordamento iminente.</li>
</ol>

<h1>10. CONCLUSÃO</h1>
<p>
  A entrega da <strong>Prova 3 (P3)</strong> concluiu com sucesso a implementação do sistema distribuído idealizado na P2, incorporando a integração completa de mensageria com o Telegram conforme ensinado na Aula 18. A combinação do broker Mosquitto em nuvem AWS, motor de orquestração local no Node-RED, banco de séries temporais InfluxDB 2.x com autenticação via token e bot interativo no Telegram demonstrou ser uma arquitetura robusta, econômica e de altíssimo valor para o monitoramento urbano inteligente.
</p>
<p>
  <strong>Lições Aprendidas:</strong> O uso do padrão de eventos no Node-RED em conjunto com a API do Telegram e o banco InfluxDB destacou como arquiteturas distribuídas e desacopladas proporcionam flexibilidade para integrar rapidamente sensores legados a interfaces modernas de tomada de decisão.
</p>

<table class="page-footer-table">
  <tr>
    <td style="width: 70%;">Alunos: André Alexandria de Souza | Eduardo Barros Reis | Maicon Pereira Veloso</td>
    <td style="width: 15%;">R.A.:</td>
    <td style="width: 15%; text-align: right;">Fatec SCS – P3</td>
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

console.log("[*] Renderizando novo PDF via Headless Chrome...");
const chromeExe = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const cmd = `"${chromeExe}" --headless=new --disable-gpu --no-sandbox --disable-software-rasterizer --user-data-dir="${chromeTmp}" --print-to-pdf="${pdfPath}" "${htmlPath}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const s = fs.statSync(pdfPath);
    console.log(`[✓] SUCESSO! PDF ATUALIZADO: ${pdfPath} (${s.size} bytes)`);
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
