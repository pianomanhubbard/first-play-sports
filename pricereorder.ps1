$c = Get-Content public/index.html -Raw -Encoding UTF8

# Update pricing subtext
$c = $c.Replace('<p class="section-sub">Pay per session. That''s it. No commitment to a whole season, no team fees, no equipment costs upfront.</p>', '<p class="section-sub">Start with one session. No commitment, no package required. Most families start with a Game Day — $22 gets your kid on the field with Coach Mark and you will know after one session if this is right for you.</p>')

# Find the current pricing grid and replace entirely
$oldGrid = '<div class="pricing-grid reveal">'
$newGrid = '<p style="font-size:13px;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:1rem;">Want to commit early and save? We have options.</p>
    <div class="pricing-grid reveal" style="display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:1.5rem;align-items:start;">'
$c = $c.Replace($oldGrid, $newGrid)

# Move MOST POPULAR badge from Double Play to Game Day
$c = $c.Replace('<div class="price-card featured">
        <div class="popular-badge">&#9733; Most Popular</div>
        <span class="price-sport-icon">&#127936;</span>
        <h3', '<div class="price-card">
        <span class="price-sport-icon">&#127936;</span>
        <h3')

# Make Game Day the featured card with MOST POPULAR
$c = $c.Replace('<div class="price-card">
        <span class="price-sport-icon">&#9918;</span>
        <h3 style="color:#fff;font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;">Gameday</h3>
        <div class="price-amount" style="color:#fff;font-size:2.6rem;font-weight:900;">$22</div>', '<div class="price-card featured">
        <div class="popular-badge" style="background:#B22234;">&#9733; Most Popular</div>
        <span class="price-sport-icon">&#9918;</span>
        <h3 style="color:#fff;font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;">Gameday</h3>
        <div class="price-amount" style="color:#fff;font-size:2.6rem;font-weight:900;">$22</div>')

# Make Game Day button red and link to schedule
$c = $c.Replace('<a href="https://buy.stripe.com/test_5kQ9AV78271B6N5gtt3Je00" class="btn-stripe" target="_blank">Book a Session</a>', '<a href="#schedule" class="btn-stripe" style="background:#B22234;border-color:#B22234;">Book a Session</a>')

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
