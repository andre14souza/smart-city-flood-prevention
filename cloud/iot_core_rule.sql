-- ==============================================================================
-- REGRA AWS IoT Core: Ingestão de Telemetria de Bueiros Inteligentes
-- Tópico: cidades_inteligentes/enchentes/bueiro_01 (ou cidades_inteligentes/enchentes/+)
-- ==============================================================================

SELECT 
    sensor_id,
    distancia_cm,
    timestamp AS esp32_timestamp,
    timestamp() AS received_at_aws_epoch,
    topic(3) AS drain_id
FROM 
    'cidades_inteligentes/enchentes/+'
WHERE 
    distancia_cm > 0.0
