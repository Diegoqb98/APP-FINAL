try {
    $projRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $startBat = Join-Path $projRoot '..\start.bat' | Resolve-Path -ErrorAction Stop
    $abs = $startBat.Path

    $taskName = 'HotelReservationsApp'
    $tr = "cmd /c `"$abs`""

    Write-Output "Creando tarea programada '$taskName' que ejecuta: $abs"
    $args = "/Create /SC ONLOGON /TN `"$taskName`" /TR `"$tr`" /F"
    $result = schtasks.exe $args
    Write-Output $result
    Write-Output "Tarea creada (si no hubo errores). Se ejecutará al iniciar sesión del usuario actual."
} catch {
    Write-Error "Error creando la tarea programada: $_"
    exit 1
}
