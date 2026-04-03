$c = Get-Content public/index.html -Raw -Encoding UTF8
$c = $c -replace '<span class="sport-tag">.*?Golf</span>', '<span class="sport-tag">Golf</span>'
$c = $c -replace '<span class="sport-tag">.*?Volleyball</span>', '<span class="sport-tag">Volleyball</span>'
$c = $c -replace '<span class="sport-tag">.*?Soccer</span>', '<span class="sport-tag">Soccer</span>'
$c = $c -replace '<span class="sport-tag">.*?Yard Games</span>', '<span class="sport-tag">Yard Games</span>'
Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
