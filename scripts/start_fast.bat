@echo off
rem Arranque rápido: intenta iniciar Docker Desktop y levantar solo el servicio `app`
rem Ejecutar desde la raíz del proyecto

echo Iniciando Docker Desktop (si está instalado)...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
timeout /t 3 /nobreak >nul

echo Construyendo e iniciando servicio 'app'...
docker compose up -d --build app

echo Mostrando últimos logs del contenedor 'hotel-app'...
docker logs hotel-app --tail 50

echo Arranque completado. Abre http://localhost:3000 (o el puerto expuesto en tu docker-compose)
pause
