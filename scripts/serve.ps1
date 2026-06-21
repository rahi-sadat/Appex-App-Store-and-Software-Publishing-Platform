param(
    [int]$Port = 8000,
    [string]$HostName = "127.0.0.1"
)

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$publicRoot = Join-Path $projectRoot "public"

if (-not (Test-Path $publicRoot)) {
    Write-Error "Public directory not found: $publicRoot"
    exit 1
}

$php = $null
$xamppPhp = "D:\xampp\php\php.exe"

if (Test-Path $xamppPhp) {
    $php = $xamppPhp
} else {
    $phpCommand = Get-Command php -ErrorAction SilentlyContinue
    if ($phpCommand) {
        $php = $phpCommand.Source
    }
}

if (-not $php) {
    Write-Error "PHP was not found. Install PHP or update this script with your php.exe path."
    exit 1
}

Write-Host "Starting Appex at http://$HostName`:$Port"
Write-Host "Serving $publicRoot"
& $php -S "$HostName`:$Port" -t $publicRoot
