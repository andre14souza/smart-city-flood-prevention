"""
==============================================================================
PROJETO: Cidades Inteligentes: Prevenção de Enchentes
COMPONENTE: AWS Lambda Function (flood_processor_lambda)
==============================================================================
Event Recebido do AWS IoT Core:
{
    "sensor_id": "bueiro_01",
    "distancia_cm": 35.4,
    "timestamp": 124500
}
==============================================================================
"""

import json
import os
import time
import boto3
from decimal import Decimal

# Clientes AWS SDK
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'sa-east-1'))
sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION', 'sa-east-1'))

TABLE_NAME = os.environ.get('TABLE_NAME', 'FloodSensorReadings')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', 'arn:aws:sns:sa-east-1:123456789012:DefesaCivilAlerts')

# Altura física do bueiro (distância do sensor até o fundo em centímetros)
TOTAL_DEPTH_CM = 200.0

# Limiar de emergência: quando a água atinge mais de 80% do bueiro (menos de 40 cm do sensor)
CRITICAL_WATER_LEVEL_PCT = 80.0
CRITICAL_DISTANCE_CM = 40.0


def lambda_handler(event, context):
    print(f"[AWS IOT EVENT] Mensagem recebida: {json.dumps(event)}")

    sensor_id = event.get('sensor_id', 'bueiro_01')
    distancia_cm = float(event.get('distancia_cm', 200.0))
    esp32_timestamp = int(event.get('esp32_timestamp', event.get('timestamp', 0)))
    current_time_epoch = int(time.time())

    # 1. CÁLCULO DO NÍVEL DE ÁGUA
    nivel_agua_cm = max(0.0, min(TOTAL_DEPTH_CM, TOTAL_DEPTH_CM - distancia_cm))
    nivel_agua_pct = round((nivel_agua_cm / TOTAL_DEPTH_CM) * 100.0, 1)

    status = "NORMAL"
    if nivel_agua_pct >= CRITICAL_WATER_LEVEL_PCT or distancia_cm <= CRITICAL_DISTANCE_CM:
        status = "CRITICO"
    elif nivel_agua_pct >= 50.0:
        status = "ATENCAO"

    # 2. PERSISTÊNCIA NO AMAZON DYNAMODB
    table = dynamodb.Table(TABLE_NAME)
    item = {
        'sensor_id': sensor_id,
        'timestamp': current_time_epoch,
        'distancia_cm': Decimal(str(round(distancia_cm, 1))),
        'nivel_agua_cm': Decimal(str(round(nivel_agua_cm, 1))),
        'nivel_agua_pct': Decimal(str(nivel_agua_pct)),
        'status': status,
        'esp32_uptime_ms': esp32_timestamp
    }

    try:
        table.put_item(Item=item)
        print(f"[DYNAMODB] Gravado com sucesso para {sensor_id}: {nivel_agua_pct}%")
    except Exception as e:
        print(f"[DYNAMODB ERRO] Falha ao gravar item: {str(e)}")

    # 3. VERIFICAÇÃO DE LIMIAR & DISPARO DE ALERTA NO AWS SNS
    if status == "CRITICO":
        mensagem_alerta = (
            f"🚨 [ALERTA DE ENCHENTE - DEFESA CIVIL] 🚨\n"
            f"Sensor: {sensor_id}\n"
            f"Distância da Água ao Sensor: {distancia_cm:.1f} cm\n"
            f"Nível de Ocupação da Galeria: {nivel_agua_pct:.1f}%\n"
            f"Horário: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(current_time_epoch))}\n"
            f"Ação: Risco iminente de alagamento na via pública! Bloqueio emergencial recomendado."
        )

        try:
            sns_resp = sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f"URGENTE: Risco de Enchente em {sensor_id}",
                Message=mensagem_alerta
            )
            print(f"[AWS SNS] Notificação enviada! MessageId: {sns_resp.get('MessageId')}")
        except Exception as e:
            print(f"[AWS SNS ERRO] Falha ao publicar alerta: {str(e)}")

    return {
        'statusCode': 200,
        'body': json.dumps({
            'sensor_id': sensor_id,
            'nivel_agua_pct': nivel_agua_pct,
            'status': status
        })
    }
