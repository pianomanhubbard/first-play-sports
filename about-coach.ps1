$c = Get-Content public/index.html -Raw -Encoding UTF8
$section = @"
<!-- ABOUT COACH MARK -->
<section class="section" style="background:#002147;color:#fff;">
  <div class="section-inner">
    <div style="display:inline-block;background:#B22234;color:#fff;font-size:0.75rem;font-weight:900;letter-spacing:1px;padding:0.35rem 1rem;border-radius:100px;margin-bottom:1.5rem;">MEET COACH MARK</div>
    <h2 style="color:#fff;font-size:clamp(1.8rem,3.5vw,2.8rem);margin-bottom:2rem;">He has been coaching kids his whole career. Yours is next.</h2>
    <div style="display:grid;grid-template-columns:400px 1fr;gap:3rem;align-items:start;margin-bottom:3rem;">
      <div>
        <img src="/coach-photo.jpg" style="width:100%;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);" alt="Coach Mark with Joey">
        <p style="font-size:0.85rem;font-style:italic;color:rgba(255,255,255,0.55);margin-top:0.8rem;">Coach Mark with his daughter Joey at a local league game in Charles Town, WV.</p>
      </div>
      <div style="font-size:1.05rem;line-height:1.9;color:rgba(255,255,255,0.85);">
        <p style="margin-bottom:1.2rem;"><strong>Coach Mark Lucas</strong> has spent 16 years as a high school teacher in Jefferson County.</p>
        <p style="margin-bottom:1.2rem;">His coaching resume is not a credential on a wall. It is years of showing up. High school baseball. High school basketball. Tee ball. Coach pitch. Kid pitch. JCLL youth basketball. JCLL youth soccer.</p>
        <p style="margin-bottom:1.2rem;"><strong>Palmer</strong> is 7. <strong>Joey</strong> is 4. They are both athletes. That is not an accident.</p>
        <p style="margin-bottom:1.2rem;"><strong>Coach Mark</strong> is married to <strong>Tommie Lucas, Jefferson County Teacher of the Year</strong> and a teacher at Washington High School right here in Charles Town.</p>
        <p style="font-size:1.1rem;font-style:italic;color:#fff;border-left:4px solid #B22234;padding-left:1.2rem;margin-top:1.5rem;">When you bring your child to First Play Sports, you are not dropping them off with a stranger. You are handing them to someone who has spent a career earning the right to be called Coach.</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;border-top:1px solid rgba(255,255,255,0.15);padding-top:2rem;">
      <div style="border-left:4px solid #B22234;padding-left:1.2rem;">
        <div style="font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:0.3rem;">16 Years</div>
        <p style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.5;">High school teacher in Jefferson County</p>
      </div>
      <div style="border-left:4px solid #B22234;padding-left:1.2rem;">
        <div style="font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:0.3rem;">Every Level</div>
        <p style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.5;">Tee ball through high school in baseball, basketball, and soccer</p>
      </div>
      <div style="border-left:4px solid #B22234;padding-left:1.2rem;">
        <div style="font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:0.3rem;">2 Kids</div>
        <p style="font-size:0.9rem;color:rgba(255,255,255,0.7);line-height:1.5;">Palmer, 7, and Joey, 4 — his proof of concept</p>
      </div>
    </div>
  </div>
</section>
<!-- WHY MARK -->
"@
$c = $c.Replace('<!-- WHY MARK -->', $section)
Set-Content public/index.html $c -Encoding UTF8
Write-Host "Done!"