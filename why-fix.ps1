$c = Get-Content public/index.html -Raw -Encoding UTF8
$c = $c -replace '\.why-section \{[^}]+\}', '.why-section { padding-bottom: 2rem; background: #F0F4FF !important; color: #002147 !important; }'
$c = $c -replace '\.why-text h2 \{ color: #fff; \}', '.why-text h2 { color: #002147; }'
$c = $c -replace '\.why-text \.section-sub \{ color: rgba\(255,255,255,0\.65\)', '.why-text .section-sub { color: #444444'
$c = $c -replace 'color: rgba\(255,255,255,0\.85\); font-size: 1rem', 'color: #222222; font-size: 1rem'
Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
