$c = Get-Content public/index.html -Raw -Encoding UTF8

# Fix checkmark encoding
$c = $c -replace 'âœ"', '<span style="color:#B22234;font-weight:bold;">&#10003;</span>'
$c = $c -replace '&#10003; One', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> One'
$c = $c -replace '&#10003; 4', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> 4'
$c = $c -replace '&#10003; Your choice', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> Your choice'
$c = $c -replace '&#10003; No commitment', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> No commitment'
$c = $c -replace '&#10003; 2 sessions', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> 2 sessions'
$c = $c -replace '&#10003; Repeat', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> Repeat'
$c = $c -replace '&#10003; Book as', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> Book as'
$c = $c -replace '&#10003; Invite', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> Invite'
$c = $c -replace '&#10003; 5 sessions', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> 5 sessions'
$c = $c -replace '&#10003; All sports', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> All sports'
$c = $c -replace '&#10003; First Play', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> First Play'
$c = $c -replace '&#10003; Your number', '<span style="color:#B22234;font-weight:bold;">&#10003;</span> Your number'

# Fix Gameday card - restore name and price
$c = $c.Replace('<span class="price-sport-icon">&#9918;</span>', '<span class="price-sport-icon">&#9918;</span>
        <h3 style="color:#fff;font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;">Gameday</h3>
        <div class="price-amount" style="color:#fff;font-size:2.6rem;font-weight:900;">$22</div>')

# Fix Starting Five card - restore name and price  
$c = $c.Replace('<span class="price-sport-icon">&#127942;</span>', '<span class="price-sport-icon">&#127942;</span>
        <h3 style="color:#fff;font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;">Starting Five</h3>
        <div class="price-amount" style="color:#fff;font-size:2.6rem;font-weight:900;">$90</div>')

# Fix pricing section top padding
$c = $c -replace '\.pricing-section \{[^}]+\}', '.pricing-section { background-color: #1B3A6B !important; padding-top: 40px; }'

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
