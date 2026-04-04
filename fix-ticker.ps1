$c = Get-Content public/index.html -Raw -Encoding UTF8

# Remove the entire sports strip section
$start = $c.IndexOf('<div class="sports-strip">')
$end = $c.IndexOf('</div>', $c.IndexOf('</div>', $start) + 1) + 6
$c = $c.Remove($start, $end - $start)

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"
