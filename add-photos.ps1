$c = Get-Content public/index.html -Raw -Encoding UTF8

# Photo 1 - Add coach-group.jpg to "This is real coaching" section
$c = $c.Replace('<h2 style="color:#fff;font-size:clamp(2rem,4vw,3rem);margin-bottom:1.5rem;">This is real coaching.</h2>', '<h2 style="color:#fff;font-size:clamp(2rem,4vw,3rem);margin-bottom:1.5rem;">This is real coaching.</h2>
    <img src="/coach-group.jpg" style="width:100%;max-width:100%;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);margin-bottom:2rem;" alt="Coach Mark coaching kids on the baseball field">')

# Photo 3 - Add coach-joey.jpg to "You always know" section
$c = $c.Replace('<h2 style="color:#fff;font-size:clamp(2rem,4vw,3rem);margin-bottom:2rem;">You always know who is coaching your kid.</h2>', '<div style="display:grid;grid-template-columns:1fr 420px;gap:3rem;align-items:start;">
    <div>
    <h2 style="color:#fff;font-size:clamp(2rem,4vw,3rem);margin-bottom:2rem;">You always know who is coaching your kid.</h2>')

$c = $c.Replace('That is not a small thing. That is the whole thing.</p>
    </div>
  </div>
</section>
<!-- SPORTS -->', 'That is not a small thing. That is the whole thing.</p>
    </div>
    </div>
    <img src="/coach-joey.jpg" style="width:100%;max-width:420px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);" alt="Coach Mark giving individual attention">
    </div>')

# Photo 4 - Add palmer-joey.jpg to About Coach Mark section
$c = $c.Replace('His son <strong>Palmer</strong> is 7. His daughter <strong>Joey</strong> is 4. They are both athletes. That is not an accident.</p>', 'His son <strong>Palmer</strong> is 7. His daughter <strong>Joey</strong> is 4. They are both athletes. That is not an accident.</p>
        <img src="/palmer-joey.jpg" style="width:100%;max-width:380px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.3);margin-top:1rem;" alt="Palmer and Joey in batting stances">')

Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"