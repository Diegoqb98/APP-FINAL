try {
    $projRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $startBat = Join-Path $projRoot '..\start.bat' | Resolve-Path -ErrorAction Stop
    $startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
    $linkPath = Join-Path $startupDir 'HotelReservationsApp.lnk'

    $wsh = New-Object -ComObject WScript.Shell
    $shortcut = $wsh.CreateShortcut($linkPath)
    $shortcut.TargetPath = 'C:\Windows\System32\cmd.exe'
    $shortcut.Arguments = "/c `"$($startBat.Path)`""
    $shortcut.WorkingDirectory = Split-Path $startBat.Path -Parent
    $shortcut.WindowStyle = 1
    $shortcut.Description = 'Inicia la aplicación Hotel Reservations al iniciar sesión'
    $shortcut.Save()

    Write-Output "Acceso directo creado en: $linkPath"
} catch {
    Write-Error "Error creando el acceso directo en Startup: $_"
    exit 1
}
