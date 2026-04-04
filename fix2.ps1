$c = Get-Content public/index.html -Raw -Encoding UTF8

# Fix How It Works step emojis
$c = $c -replace '<span class="step-emoji">.*?</span>', ''

# Fix coach sports pills
$c = $c -replace '>Golf<', '>&#9971; Golf<'
$c = $c -replace '>Volleyball<', '>&#127952; Volleyball<'
$c = $c -replace '>Soccer<', '>&#9917; Soccer<'
$c = $c -replace '>Yard Games<', '>&#127919; Yard Games<'

# Fix "You always know" section - make text white
$c = $c -replace '(<section class="section" style="background-color:#0d1f3c;color:#fff;">)', '<section class="section" style="background-color:#0d1f3c;color:#fff;">'
$c = $c.Replace('<h2 style="color:#002147;font-size:clamp(2rem,4vw,3rem);margin-bottom:2rem;">You always know', '<h2 style="color:#ffffff;font-size:clamp(2rem,4vw,3rem);margin-bottom:2rem;">You always know')
$c = $c.Replace('<p style="margin-bottom:1.5rem;color:#3a3a3a;">When you sign', '<p style="margin-bottom:1.5rem;color:rgba(255,255,255,0.85);">When you sign')
$c = $c.Replace('<p style="margin-bottom:1.5rem;color:#3a3a3a;">Every session is', '<p style="margin-bottom:1.5rem;color:rgba(255,255,255,0.85);">Every session is')
$c = $c.Replace('<p style="font-weight:800;color:#002147;font-size:1.2rem;">That is not', '<p style="font-weight:800;color:#ffffff;font-size:1.2rem;">That is not')

# Fix FAQ heading color
$c = $c -replace '(<section class="section faq-section"[^>]*>[\s\S]{0,500}?<h2)', '$1 style="color:#1B3A6B;"'

# Fix Common Questions from Parents
$c = $c.Replace('<h2 style="margin-bottom: 0.5rem;">Common questions from parents</h2>', '<h2 style="margin-bottom: 0.5rem;color:#1B3A6B;">Common questions from parents</h2>')

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
