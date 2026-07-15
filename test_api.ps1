# Test Evolution API directly with the API key
try {
  $headers = @{
    'Content-Type' = 'application/json'
    'apikey' = 'BrunoBuddy123!'
  }
  $r = Invoke-WebRequest -Uri 'http://187.77.46.175:8080/instance/fetchInstances' -TimeoutSec 8 -UseBasicParsing -Headers $headers
  Write-Host "Direct API: OK ($($r.StatusCode))"
  Write-Host $r.Content.Substring(0, [Math]::Min(300, $r.Content.Length))
} catch {
  Write-Host "Direct API FAIL: $_"
}

Write-Host ""
Write-Host "---"
Write-Host ""

# Test Vercel proxy (which should use env vars)
try {
  $headers2 = @{ 'Content-Type' = 'application/json' }
  $r2 = Invoke-WebRequest -Uri 'https://schedule-buddy-app-65-842f3e95.vercel.app/api/evolution?path=/instance/fetchInstances' -TimeoutSec 10 -UseBasicParsing -Headers $headers2
  Write-Host "Vercel Proxy: OK ($($r2.StatusCode))"
  Write-Host $r2.Content.Substring(0, [Math]::Min(300, $r2.Content.Length))
} catch {
  Write-Host "Vercel Proxy FAIL: $_"
}
