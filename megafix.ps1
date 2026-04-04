$c = Get-Content public/index.html -Raw -Encoding UTF8

# FIX 1 - Hero content width
$c = $c -replace '(<div class="hero-inner")', '<div class="hero-inner" style="max-width:1100px;margin:0 auto;padding:0 48px;"'

# FIX 2 - Explicit background colors on every section
$c = $c -replace '<section class="hero">', '<section class="hero" style="background-color:#1B3A6B;">'
$c = $c -replace '<section class="section" style="background:#ffffff;" id="how">', '<section class="section" id="how" style="background-color:#ffffff;">'
$c = $c -replace '<section class="section" style="background:#002147;color:#fff;">', '<section class="section" style="background-color:#1B3A6B;color:#fff;">'
$c = $c -replace '<section class="section why-section"[^>]*>', '<section class="section why-section" id="about" style="background-color:#0d1f3c;color:#fff;">'
$c = $c -replace '<section class="section" style="background:#002147;color:#fff;">', '<section class="section" style="background-color:#1B3A6B;color:#fff;">'
$c = $c -replace '<section class="section" style="background:#F0F4FF;color:#002147;">', '<section class="section" style="background-color:#0d1f3c;color:#fff;">'
$c = $c -replace '<section class="section sports-section"[^>]*>', '<section class="section sports-section" id="sports" style="background-color:#f5f7fa;">'
$c = $c -replace '<section class="section schedule-section"[^>]*>', '<section class="section schedule-section" id="schedule" style="background-color:#1B3A6B;color:#fff;">'
$c = $c -replace '<section class="section pricing-section"[^>]*>', '<section class="section pricing-section" id="pricing" style="background-color:#f5f7fa;">'
$c = $c -replace '<section class="section faq-section"[^>]*>', '<section class="section faq-section" style="background-color:#ffffff;">'
$c = $c -replace '<section class="cta-section">', '<section class="cta-section" style="background-color:#1B3A6B;">'

# FIX 3 - CSS text colors
$c = $c -replace '(\.why-section \{[^}]+\})', '.why-section { padding-bottom: 2rem; background-color: #0d1f3c !important; color: #fff !important; }'
$c = $c -replace '(\.why-text h2 \{[^}]+\})', '.why-text h2 { color: #ffffff; }'
$c = $c -replace '(\.why-text \.section-sub \{[^}]+\})', '.why-text .section-sub { color: rgba(255,255,255,0.8); }'
$c = $c -replace '(\.sport-card h3 \{[^}]+\})', '.sport-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.5rem; color: #1B3A6B; }'
$c = $c -replace '(\.sport-card p \{[^}]+\})', '.sport-card p { font-size: 0.85rem; color: #333333; line-height: 1.6; }'
$c = $c -replace '(\.faq-item h4 \{[^}]+\})', '.faq-item h4 { font-weight: 800; font-size: 0.95rem; margin-bottom: 0.5rem; color: #1B3A6B; }'
$c = $c -replace '(\.faq-item p \{[^}]+\})', '.faq-item p { font-size: 0.88rem; color: #333333; line-height: 1.65; }'
$c = $c -replace '(\.schedule-header h3 \{[^}]+\})', '.schedule-header h3 { color: #fff; font-size: 1rem; font-weight: 800; }'

# FIX 4 - Sport card emojis using HTML entities
$c = $c -replace '<span class="sport-card-icon">.*?</span>(\s*<h3>Baseball</h3>)', '<span class="sport-card-icon">&#9918;</span>$1'
$c = $c -replace '<span class="sport-card-icon">.*?</span>(\s*<h3>Basketball</h3>)', '<span class="sport-card-icon">&#127936;</span>$1'
$c = $c -replace '<span class="sport-card-icon">.*?</span>(\s*<h3>Football</h3>)', '<span class="sport-card-icon">&#127944;</span>$1'
$c = $c -replace '<span class="sport-card-icon">.*?</span>(\s*<h3>Pickleball</h3>)', '<span class="sport-card-icon">&#127955;</span>$1'

# FIX 5 - Fix Structure strip inside section-inner
$c = $c.Replace('    </div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;">', '    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:2rem;">')

# FIX 6 - Remove global background overrides
$c = $c -replace '(\.section \{ padding: 6rem 2rem; \})', '.section { padding: 6rem 2rem; }'

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
