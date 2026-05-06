$port = 3000
$connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($connection) {
    Write-Host "Killing process on port $port (PID: $($connection.OwningProcess))"
    Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "Process terminated."
} else {
    Write-Host "No process found on port $port."
}
