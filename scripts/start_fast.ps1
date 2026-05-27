# Start Fast (PowerShell)
# Ejecutar desde la raíz del proyecto: PowerShell -ExecutionPolicy Bypass -File .\scripts\start_fast.ps1

$ddPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $ddPath) {
  Write-Host "Iniciando Docker Desktop..."
  Start-Process -FilePath $ddPath
  Start-Sleep -Seconds 3
} else {
  Write-Host "Docker Desktop no encontrado en la ruta estándar. Asegúrate de que Docker está en ejecución."
}

Write-Host "Construyendo e iniciando servicio 'app' con docker compose..."
docker compose up -d --build app

Write-Host "Esperando unos segundos para recoger logs..."
Start-Sleep -Seconds 2
docker logs hotel-app --tail 50

Write-Host "Arranque finalizado. Abre http://localhost:3000 (o el puerto configurado en docker-compose)."
