$c = Get-Content public/index.html -Raw -Encoding UTF8

# Fix section backgrounds
$c = $c -replace '(<section class="section" style="background:#fff;" id="how")', '<section class="section" style="background:#ffffff;" id="how"'
$c = $c -replace '(<section class="section why-section"[^>]*>)', '<section class="section why-section" style="background:#1B3A6B;color:#fff;" id="about">'
$c = $c -replace '(<section class="section sports-section"[^>]*>)', '<section class="section sports-section" style="background:#f5f7fa;" id="sports">'
$c = $c -replace '(<section class="section schedule-section"[^>]*>)', '<section class="section schedule-section" style="background:#ffffff;" id="schedule">'
$c = $c -replace '(<section class="section pricing-section"[^>]*>)', '<section class="section pricing-section" style="background:#f5f7fa;" id="pricing">'
$c = $c -replace '(<section class="section faq-section"[^>]*>)', '<section class="section faq-section" style="background:#ffffff;">'

# Fix sport card icons
$c = $c -replace '<span class="sport-card-icon">\?</span>\s*<h3>Baseball</h3>', '<span class="sport-card-icon">⚾</span><h3>Baseball</h3>'
$c = $c -replace '<span class="sport-card-icon">\?\?</span>\s*<h3>Basketball</h3>', '<span class="sport-card-icon">🏀</span><h3>Basketball</h3>'
$c = $c -replace '<span class="sport-card-icon">\?\?</span>\s*<h3>Football</h3>', '<span class="sport-card-icon">🏈</span><h3>Football</h3>'
$c = $c -replace '<span class="sport-card-icon">\?\?</span>\s*<h3>Pickleball</h3>', '<span class="sport-card-icon">🏓</span><h3>Pickleball</h3>'

# Fix Structure strip - move inside section-inner
$c = $c.Replace('    </div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;">', '    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:2rem;">')

# Fix text colors on dark backgrounds
$c = $c -replace '\.why-section \{[^}]+\}', '.why-section { padding-bottom: 2rem; background: #1B3A6B !important; color: #fff !important; }'
$c = $c -replace '\.why-text h2 \{[^}]+\}', '.why-text h2 { color: #fff; }'
$c = $c -replace '\.why-text \.section-sub \{[^}]+\}', '.why-text .section-sub { color: rgba(255,255,255,0.75); }'

# Fix sport cards text to dark
$c = $c -replace '\.sport-card h3 \{[^}]+\}', '.sport-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; color: #1B3A6B; }'
$c = $c -replace '\.sport-card p \{[^}]+\}', '.sport-card p { font-size: 0.85rem; color: #444; line-height: 1.6; }'

# Fix FAQ text to dark
$c = $c -replace '\.faq-item h4 \{[^}]+\}', '.faq-item h4 { font-weight: 800; font-size: 0.95rem; margin-bottom: 0.5rem; color: #1B3A6B; }'
$c = $c -replace '\.faq-item p \{[^}]+\}', '.faq-item p { font-size: 0.88rem; color: #444; line-height: 1.65; }'

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"