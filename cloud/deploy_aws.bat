@echo off
echo =====================================================================
echo  PROJETO CIDADES INTELIGENTES - DEPLOY AUTOMATICO NA NUVEM AWS
echo =====================================================================
echo Verificando credenciais da AWS CLI...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] AWS CLI nao configurada ou sem credenciais validas!
    echo Execute 'aws configure' e insira suas credenciais da AWS (Access Key / Secret Key).
    pause
    exit /b 1
)

echo.
echo [1/2] Iniciando deploy do CloudFormation Stack (DynamoDB, Lambda, SNS, IoT Core)...
aws cloudformation deploy ^
    --template-file "%~dp0aws_cloudformation_stack.yaml" ^
    --stack-name SmartCityFloodPrevention ^
    --capabilities CAPABILITY_NAMED_IAM ^
    --region sa-east-1

if %errorlevel% equ 0 (
    echo.
    echo =====================================================================
    echo  [SUCESSO] Infraestrutura AWS criada com sucesso em sa-east-1!
    echo  - Tabela DynamoDB: FloodSensorReadings
    echo  - Topico SNS: DefesaCivilAlerts
    echo  - Funcao Lambda: flood_processor_lambda
    echo  - Regra IoT Core: FloodDrainIngestionRule
    echo =====================================================================
) else (
    echo [ERRO] Ocorreu uma falha no deploy da stack AWS CloudFormation.
)
pause
