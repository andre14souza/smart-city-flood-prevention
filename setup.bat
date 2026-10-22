@echo off
title A configurar o ambiente do simulador...
echo A criar o ambiente virtual...

:: Cria o ambiente virtual na pasta .venv usando o Python nativo do Windows
py -m venv .venv

echo A instalar as dependencias...
:: Ativa o ambiente virtual e instala a biblioteca paho-mqtt
call .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install paho-mqtt

echo.
echo ========================================================
echo  Ambiente configurado com sucesso! Podes fechar a janela.
echo ========================================================
pause