$c = Get-Content public/index.html -Raw -Encoding UTF8

# Fix pricing section background
$c = $c -replace '(<section class="section pricing-section"[^>]*>)', '<section class="section pricing-section" id="pricing" style="background-color:#1B3A6B;">'

# Fix pricing CSS
$c = $c -replace '\.pricing-section \{ background: [^;]+; \}', '.pricing-section { background-color: #1B3A6B !important; }'
$c = $c -replace '\.price-card \{', '.price-card { background: #243d6b; color: #fff; border: none;'
$c = $c -replace '\.price-card\.featured \{', '.price-card.featured { background: #0d1f3c; color: #fff;'
$c = $c -replace '\.price-card h3 \{[^}]+\}', '.price-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.4rem; color: #fff; }'
$c = $c -replace '\.price-amount \{[^}]+\}', '.price-amount { font-family: "Fraunces", serif; font-size: 2.6rem; line-height: 1; color: #fff; margin-bottom: 0.2rem; }'
$c = $c -replace '\.price-per \{[^}]+\}', '.price-per { display: none; }'
$c = $c -replace '\.price-features li \{[^}]+\}', '.price-features li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: #fff; }'
$c = $c -replace '\.price-features li::before \{[^}]+\}', '.price-features li::before { content: "✓"; color: #B22234; font-weight: 900; font-size: 0.9rem; }'

# Fix Buy Now buttons
$c = $c -replace 'Buy Now - \$22', 'Book a Session'
$c = $c -replace 'Buy Now - \$38', 'Book a Session'
$c = $c -replace 'Buy Now - \$90', 'Book a Session'

# Fix Most Popular badge
$c = $c -replace '\.popular-badge \{[^}]+\}', '.popular-badge { background: #B22234; color: #fff; padding: 0.25rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.5px; }'

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
