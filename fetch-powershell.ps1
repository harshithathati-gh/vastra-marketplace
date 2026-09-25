$html = Invoke-WebRequest -Uri "https://chatgpt.com/s/m_6ab24f9a913081918ac1ccc9a278fcd4" -UseBasicParsing | Select-Object -ExpandProperty Content
$regex = 'https://sdmntprcentralus[^"]+'
$url = [regex]::Match($html, $regex).Value
if ($url) {
    $url = $url -replace "\\u0026", "&"
    Write-Host "Found URL: $url"
    Invoke-WebRequest -Uri $url -OutFile "d:\PersonalProjects\Vastra\web\public\logo.png" -UseBasicParsing
    Write-Host "Download Complete!"
} else {
    Write-Host "Failed to find URL in HTML payload."
}
