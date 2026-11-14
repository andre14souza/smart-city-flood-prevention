@echo off
title Emulador Virtual de ESP32 - Cidades Inteligentes
if exist "%~dp0.venv\Scripts\python.exe" (
    "%~dp0.venv\Scripts\python.exe" "%~dp0simulate_esp32.py"
) else (
    py "%~dp0simulate_esp32.py"
)
pause
