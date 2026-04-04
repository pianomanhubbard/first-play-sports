$c = Get-Content public/index.html -Raw -Encoding UTF8

# Fix sport pills
$c = $c -replace '\? Baseball', '&#9918; Baseball'
$c = $c -replace '\?\? Basketball', '&#127936; Basketball'
$c = $c -replace '\?\? Football', '&#127944; Football'
$c = $c -replace '\?\? Pickleball', '&#127955; Pickleball'

# Fix pricing icons
$c = $c -replace '<span class="price-sport-icon">.*?</span>(\s*<h3>Gameday)', '<span class="price-sport-icon">&#9918;</span>$1'
$c = $c -replace '<span class="price-sport-icon">.*?</span>(\s*<h3>Double Play)', '<span class="price-sport-icon">&#127936;</span>$1'
$c = $c -replace '<span class="price-sport-icon">.*?</span>(\s*<h3>Starting Five)', '<span class="price-sport-icon">&#127942;</span>$1'

# Fix pricing checkmarks
$c = $c -replace '\? One 45-min', '&#10003; One 45-min'
$c = $c -replace '\? 4', '&#10003; 4'
$c = $c -replace '\? Your choice', '&#10003; Your choice'
$c = $c -replace '\? No commitment', '&#10003; No commitment'
$c = $c -replace '\? 2 sessions', '&#10003; 2 sessions'
$c = $c -replace '\? Repeat', '&#10003; Repeat'
$c = $c -replace '\? Book as', '&#10003; Book as'
$c = $c -replace '\? Invite', '&#10003; Invite'
$c = $c -replace '\? 5 sessions', '&#10003; 5 sessions'
$c = $c -replace '\? All sports', '&#10003; All sports'
$c = $c -replace '\? First Play Sports jersey', '&#10003; First Play Sports jersey'
$c = $c -replace '\? Your number', '&#10003; Your number'

# Fix Most Popular and Buy Now
$c = $c -replace '\? Most Popular', '&#9733; Most Popular'
$c = $c -replace 'Buy Now.*\$22 \?', 'Buy Now - $22'
$c = $c -replace 'Buy Now.*\$38 \?', 'Buy Now - $38'
$c = $c -replace 'Buy Now.*\$90 \?', 'Buy Now - $90'

# Fix Sports and Pricing heading colors
$c = $c -replace '(Pick your sport)', '<span style="color:#1B3A6B;">Pick your sport'
$c = $c -replace '(No season\. No subscription)', '<span style="color:#1B3A6B;">No season. No subscription'

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
