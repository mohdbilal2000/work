# Defitex Portal - PowerShell HTTP Server
# This serves the landing page without requiring Node.js

$port = 8080
$indexPath = Join-Path $PSScriptRoot "index.html"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEFITEX PORTAL" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting server on http://localhost:$port" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server is running! Opening browser..." -ForegroundColor Green
    
    # Open in default browser
    Start-Process "http://localhost:$port"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        
        # Read and serve the HTML file
        $content = Get-Content -Path $indexPath -Raw -Encoding UTF8
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        
        $response.ContentType = "text/html; charset=utf-8"
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    $listener.Stop()
}







