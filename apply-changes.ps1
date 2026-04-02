$file = "public/index.html"
$content = Get-Content $file -Raw

# Colors
$content = $content -replace '#FF6B35', '#CC0000'
$content = $content -replace '#2d9e5f', '#0033A0'
$content = $content -replace '#3dbf74', '#0044CC'
$content = $content -replace '#1e7042', '#002080'
$content = $content -replace '#1a2e4a', '#002147'
$content = $content -replace '#243d60', '#003166'
$content = $content -replace '#FFD23F', '#FFFFFF'
$content = $content -replace '#fffdf5', '#FFFFFF'
$content = $content -replace '#f5f0e8', '#F0F4FF'

# Branding
$content = $content -replace 'Coach <span>Mark Lucas</span>', 'First Play Sports'
$content = $content -replace 'just for fun', 'just for the love of the game'
$content = $content -replace 'Full stop\.', ''
$content = $content -replace '60-min', '45-min'

# Pricing names
$content = $content -replace 'Single Session', 'Gameday'
$content = $content -replace '3-Session Pack', 'Double Play'
$content = $content -replace '5-Session Pack', 'Starting Five'

# Pricing amounts
$content = $content -replace '\$35', '$22'
$content = $content -replace '\$90', '$38'
$content = $content -replace '\$140', '$80'

# Remove savings text
$content = $content -replace 'per child.*save \$15', 'per child'
$content = $content -replace 'per child.*save \$22', 'per child'

# Sessions count
$content = $content -replace '3 sessions, use anytime', '2 sessions, use anytime'
$content = $content -replace 'Mix sports across sessions', 'Repeat the same sport or try a new one'

# Coach Mark text
$content = $content -replace 'Mark keeps', 'Coach Mark keeps'
$content = $content -replace 'Mark handles', 'Coach Mark handles'
$content = $content -replace 'Mark gets it', 'Coach Mark gets it'
$content = $content -replace "Mark's calendar", "Coach Mark's calendar"
$content = $content -replace 'Mark will confirm', 'Coach Mark will confirm'
$content = $content -replace 'Anything Mark should', 'Anything Coach Mark should'

# Calendly
$content = $content -replace 'YOUR_CALENDLY_URL', 'firstplaysports'

# Stripe
$content = $content -replace 'SINGLE_SESSION_LINK', 'test_5kQ9AV78271B6N5gtt3Je00'
$content = $content -replace 'THREE_PACK_LINK', 'test_5kQfZj0JE4TtfjB9113Je02'
$content = $content -replace 'FIVE_PACK_LINK', 'test_00w9AVfEy1HhgnFgtt3Je04'

# Before in red
$content = $content -replace '<em>before</em> the team does', '<em style="color:#CC0000;">before</em> the team does'

# FAQ additions
$newFaq = '<div class="faq-item"><h4>What if my child has already played the sport?</h4><p>Even better. A child who has already been on a field comes in with a foundation we can build on. Coach Mark works with every athlete at their level. Every kid leaves better than they arrived.</p></div><div class="faq-item"><h4>My child is currently in season. Can they still come see Coach Mark?</h4><p>Absolutely. What Coach Mark works on translates directly to what your child does in their next game. We are not competing with your childs team or coach. We are complementing it. Coach Mark is ready.</p></div>'
$content = $content -replace "Great for kids who haven't found their thing yet\.</p>", "Great for kids who haven't found their thing yet.</p></div>$newFaq"

# Fix Box 3
$content = $content -replace 'schedule .* book Gamedays', 'sport, your schedule, your pace. Switch sports any session, any time.'

# Fix triple Coach Mark in booking form
$content = $content -replace 'Coach Coach Coach Mark', 'Coach Mark'

powershell -ExecutionPolicy Bypass -File apply-changes.ps1
$content = $content -replace 'calendly-wrapper reveal', 'calendly-wrapper'
$content = $content -replace '<div class="calendly-wrapper">', '<div class="calendly-wrapper" style="display:none">'

powershell -ExecutionPolicy Bypass -File apply-changes.ps1
Set-Content $file $content
Write-Host "All changes applied successfully!"$content = $content -replace 'schedule .* book Gamedays', 'sport, your schedule, your pace. Switch sports any session, any time.'