---
layout: default
title: About
permalink: /about/
---
<header class="page-hero">
  <p class="eyebrow">// the human</p>
  <h1 data-split>I'm <span class="it">Saiprasad</span>.</h1>
  <p class="standfirst">Security practitioner by day, AI-agent tinkerer by night. I break things in the lab so I can write down exactly how - then publish the notes.</p>
</header>

<div class="about-grid">
  <div class="about-photo">
    <div class="photo-frame" data-curtain>
      {% if site.author-avatar and site.author-avatar != "" %}
      <img src="{{ '/img/' | append: site.author-avatar | relative_url }}" alt="Portrait of Saiprasad">
      {% else %}
      <div class="placeholder">author photo<br>goes here<br><br>[ img/author.jpg ]<br>set author-avatar<br>in _config.yml</div>
      {% endif %}
    </div>
    <p class="photo-cap">fig. 01 - the human behind the handle</p>
  </div>

  <div class="about-copy">
    <p>I work across <span class="it">security operations</span>, cloud security, and incident response. My day job runs on SIEM, threat intel platforms, DLP, and EDR - my nights run on Hack The Box and, lately, AI agents I'm deliberately trying to break.</p>

    <p>I've spent my career doing proactive threat hunting, building detections mapped to MITRE ATT&amp;CK, hardening cloud architectures, and automating the boring parts away with SOAR. The throughline: I don't trust a control I haven't tested, and I don't keep a technique to myself once it works.</p>

    <p>That's what this site is. A public lab notebook - HTB writeups, red-team tooling, detection notes, and now a seven-part field manual on <a href="{{ '/#series' | relative_url }}">AI agent security</a> that I'm writing as I learn it. If a post saved you an hour, it did its job.</p>

    <h2>Receipts</h2>
    <p>Selected outcomes from the day job - the kind of numbers that survive an interview:</p>
    <ul>
      <li><strong>−26% mean time to detect</strong> - proactive threat hunting and advanced detection techniques.</li>
      <li><strong>−18% security incidents</strong> - spearheaded a cloud security tool from design to deployment.</li>
      <li><strong>−65% false positives</strong> - custom IOAs &amp; IOCs tuned for our incident response workflow.</li>
      <li><strong>−38% mean time to detect</strong> - threat hunting paired with threat intelligence analysis.</li>
      <li><strong>−28% endpoint incidents</strong> - effective EDR utilization, not just EDR ownership.</li>
    </ul>

    <h2>Proof of work</h2>
    <p>Hack The Box profile:</p>
    <a href="https://app.hackthebox.com/users/427574" target="_blank" rel="noopener">
      <img src="https://www.hackthebox.com/badge/image/427574" alt="Hack The Box profile badge" loading="lazy">
    </a>

    <p style="margin-top: 2em;">Certifications:</p>
    <script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js" data-iframe-width="150" data-iframe-height="270" data-share-badge-id="60365972-a8d9-45bc-b2a9-298e00d4a941" data-share-badge-host="https://www.credly.com"></script>
    <script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js" data-iframe-width="150" data-iframe-height="270" data-share-badge-id="01d370ca-a8b8-4f8a-b8e1-0911e9cfacbb" data-share-badge-host="https://www.credly.com"></script>
    <script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js" data-iframe-width="150" data-iframe-height="270" data-share-badge-id="a882a8b0-1ce7-478b-8d6b-f1159e73f2e1" data-share-badge-host="https://www.credly.com"></script>
    <script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js" data-iframe-width="150" data-iframe-height="270" data-share-badge-id="67f266c9-08e6-45a1-aca4-63c1b0938497" data-share-badge-host="https://www.credly.com"></script>
    <script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js" data-iframe-width="150" data-iframe-height="270" data-share-badge-id="deed9690-ef73-458f-807d-82297ff26fb1" data-share-badge-host="https://www.credly.com"></script>

    <div class="currently">
      <h3>Currently</h3>
      <ul>
        <li><strong>Building</strong> - part 2 of the AI agent security field manual: the agent itself, before OWASP enters the chat.</li>
        <li><strong>Learning</strong> - agentic AI security: MCP, tool-use abuse, eval-driven defense.</li>
        <li><strong>Writing</strong> - two posts a week, in public, on this site.</li>
        <li><strong>Open to</strong> - AI security / agentic security roles (US).</li>
      </ul>
    </div>

    <div class="contact-row">
      {% if site.twitter %}<a class="btn" href="{{ site.twitter }}">Twitter / X →</a>{% endif %}
      <a class="btn" href="https://github.com/At0micenergy">GitHub →</a>
      <a class="btn" href="{{ '/feed.xml' | relative_url }}">RSS →</a>
    </div>
  </div>
</div>
