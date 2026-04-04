$c = Get-Content public/index.html -Raw -Encoding UTF8

# CHANGE 2 - Update schedule slots to baseball only
$oldSlots = 'allSlots = [
      { id: 1, sport: ''baseball'', icon: ''âš¾'', name: ''Baseball Basics'', day: ''Sat Apr 5'', time: ''9:00 AM - 9:45 AM'', taken: 2, total: 6 },
      { id: 2, sport: ''basketball'', icon: ''ðŸ€'', name: ''Hoop Fundamentals'', day: ''Sat Apr 5'', time: ''10:30 AM - 11:15 AM'', taken: 5, total: 6 },
      { id: 3, sport: ''football'', icon: ''ðŸˆ'', name: ''First Down Skills'', day: ''Sat Apr 5'', time: ''12:00 PM - 12:45 PM'', taken: 3, total: 6 },
      { id: 4, sport: ''pickleball'', icon: ''ðŸ"'', name: ''Pickle Intro'', day: ''Sun Apr 6'', time: ''9:00 AM - 9:45 AM'', taken: 1, total: 6 },
      { id: 5, sport: ''baseball'', icon: ''âš¾'', name: ''Baseball Basics'', day: ''Sun Apr 6'', time: ''10:30 AM - 11:15 AM'', taken: 6, total: 6 },
      { id: 6, sport: ''basketball'', icon: ''ðŸ€'', name: ''Hoop Fundamentals'', day: ''Wed Apr 9'', time: ''4:30 PM - 5:15 PM'', taken: 0, total: 6 },
      { id: 7, sport: ''football'', icon: ''ðŸˆ'', name: ''First Down Skills'', day: ''Thu Apr 10'', time: ''4:30 PM - 5:15 PM'', taken: 4, total: 6 },
      { id: 8, sport: ''pickleball'', icon: ''ðŸ"'', name: ''Pickle Intro'', day: ''Sat Apr 26'', time: ''9:00 AM - 9:45 AM'', taken: 2, total: 6 },
      { id: 9, sport: ''baseball'', icon: ''âš¾'', name: ''Baseball Basics'', day: ''Sat Apr 26'', time: ''10:30 AM - 11:15 AM'', taken: 3, total: 6 },'

$newSlots = 'allSlots = [
      { id: 1, sport: "baseball", icon: "&#9918;", name: "Baseball Basics", day: "Sat Apr 12", time: "9:00 AM - 10:00 AM", taken: 0, total: 6 },
      { id: 2, sport: "baseball", icon: "&#9918;", name: "Baseball Skills", day: "Sat Apr 12", time: "10:30 AM - 11:30 AM", taken: 0, total: 6 },
      { id: 3, sport: "baseball", icon: "&#9918;", name: "Baseball Basics", day: "Sun Apr 13", time: "9:00 AM - 10:00 AM", taken: 0, total: 6 },
      { id: 4, sport: "baseball", icon: "&#9918;", name: "Baseball Basics", day: "Sat Apr 19", time: "9:00 AM - 10:00 AM", taken: 0, total: 6 },
      { id: 5, sport: "baseball", icon: "&#9918;", name: "Baseball Skills", day: "Sat Apr 19", time: "10:30 AM - 11:30 AM", taken: 0, total: 6 },
      { id: 6, sport: "baseball", icon: "&#9918;", name: "Baseball Basics", day: "Sun Apr 20", time: "9:00 AM - 10:00 AM", taken: 0, total: 6 },'

$c = $c.Replace($oldSlots, $newSlots)

# CHANGE 2 - Remove non-baseball filter buttons
$c = $c.Replace('<button class="filter-chip sport-baseball" onclick="filterSlots(''baseball'', this)">Baseball</button>
          <button class="filter-chip sport-basketball" onclick="filterSlots(''basketball'', this)">Basketball</button>
          <button class="filter-chip sport-football" onclick="filterSlots(''football'', this)">Football</button>
          <button class="filter-chip sport-pickleball" onclick="filterSlots(''pickleball'', this)">Pickleball</button>', '')

# CHANGE 4 - Update schedule intro text
$c = $c.Replace('Coach Mark is always up to date — pick a slot, fill in details, and you are confirmed.', 'Coach Mark is running baseball sessions this spring — the perfect sport to start with before your kid joins their first team. New sports rotate in seasonally. Book a spot and lets get started.')

# CHANGE 3 - Add new FAQ question first
$c = $c.Replace('<div class="faq-grid reveal">', '<div class="faq-grid reveal">
      <div class="faq-item">
        <h4>Do you offer all sports every session?</h4>
        <p>Not all at once. Coach Mark runs sport-specific sessions and rotates based on the season and what families are interested in. Baseball is the featured sport this spring. New sports are added regularly — follow along or reach out to find out what is coming next.</p>
      </div>')

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"