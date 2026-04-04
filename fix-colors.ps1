$lines = Get-Content public/index.html
$out = @()
foreach ($line in $lines) {
    if ($line -match 'section class="section why-section"') {
        $line = $line -replace 'class="section why-section"', 'class="section why-section" style="background:#002147;"'
    }
    $out += $line
}
Set-Content public/index.html $out
Write-Host "Done!"
