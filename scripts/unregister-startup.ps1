try {
    $taskName = 'HotelReservationsApp'
    Write-Output "Eliminando tarea programada '$taskName' (si existe)..."
    $args = "/Delete /TN `"$taskName`" /F"
    $result = schtasks.exe $args
    Write-Output $result
    Write-Output "Tarea eliminada (si no hubo errores)."
} catch {
    Write-Error "Error eliminando la tarea programada: $_"
    exit 1
}
