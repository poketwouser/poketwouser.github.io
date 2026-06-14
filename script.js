/* ============================================================
   KIRAN KUMAR P — interactions
   loader · smooth scroll · cursor · magnetic · typing · name
   reveals · counters · nav · easter eggs · terminal
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900;

  /* ---------- LOADER ---------- */
  (function loader() {
    var el = document.getElementById("loader");
    if (!el) return;
    var bar = el.querySelector(".loader-bar i");
    var num = el.querySelector(".lp-num");
    var label = el.querySelector(".lp-label");
    var labels = ["Assembling particles", "Mapping the universe", "Calibrating systems", "Entering orbit"];
    var p = 0, li = 0;
    function done() {
      el.classList.add("done");
      root.classList.add("entered");
      startName();
      setTimeout(function () { el.style.display = "none"; }, 1000);
    }
    if (reduce) { if (bar) bar.style.width = "100%"; if (num) num.textContent = "100%"; setTimeout(done, 200); return; }
    var iv = setInterval(function () {
      p += Math.random() * 16 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); }
      if (bar) bar.style.width = p + "%";
      if (num) num.textContent = Math.floor(p) + "%";
      var idx = Math.min(labels.length - 1, Math.floor(p / 26));
      if (idx !== li && label) { li = idx; label.textContent = labels[idx]; }
      if (p >= 100) setTimeout(done, 380);
    }, 170);
    // safety: never trap the user
    setTimeout(function () { if (!el.classList.contains("done")) { clearInterval(iv); done(); } }, 4000);
  })();

  /* ---------- NAME CHAR ASSEMBLE ---------- */
  var nameStarted = false;
  function startName() {
    if (nameStarted) return; nameStarted = true;
    var h1 = document.getElementById("hero-name");
    if (!h1) return;
    var text = h1.textContent;
    h1.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var span = document.createElement("span");
      if (ch === " ") { span.className = "hchar hspace"; span.innerHTML = "&nbsp;"; }
      else { span.className = "hchar"; span.textContent = ch; }
      frag.appendChild(span);
    }
    h1.appendChild(frag);
    var chars = h1.querySelectorAll(".hchar");
    if (reduce) { chars.forEach(function (c) { c.style.setProperty("opacity", "1", "important"); }); return; }
    chars.forEach(function (c, i) {
      c.style.setProperty("opacity", "0", "important");
      c.style.transform = "translateY(38px)";
      c.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)";
      setTimeout(function () { c.style.setProperty("opacity", "1", "important"); c.style.transform = "none"; }, 120 + i * 55);
    });
  }
  // fallback if loader never fires startName (e.g. throttled)
  setTimeout(startName, 4200);

  /* ---------- TYPING ROTATOR ---------- */
  (function typer() {
    var el = document.querySelector(".hero-type .typed");
    if (!el) return;
    var roles = ["IIT Madras", "AI & Data Analytics", "Machine Learning Engineer", "Quant Researcher", "Agentic AI Builder", "Placement Coordinator"];
    if (reduce) { el.textContent = roles[0]; return; }
    var ri = 0, ci = 0, deleting = false;
    function tick() {
      var word = roles[ri];
      if (!deleting) {
        ci++; el.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; return setTimeout(tick, 1500); }
        setTimeout(tick, 60 + Math.random() * 50);
      } else {
        ci--; el.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; return setTimeout(tick, 320); }
        setTimeout(tick, 32);
      }
    }
    setTimeout(tick, 1400);
  })();

  /* ---------- CUSTOM CURSOR ---------- */
  if (!coarse && !reduce) {
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    var glow = document.getElementById("cursor-glow");
    var rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    var dx = rx, dy = ry, gx = rx, gy = ry;
    var tx = rx, ty = ry;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; if (dot) { dot.style.transform = "translate(" + tx + "px," + ty + "px)"; } });
    function loop() {
      dx += (tx - dx) * 0.18; dy += (ty - dy) * 0.18;
      gx += (tx - gx) * 0.08; gy += (ty - gy) * 0.08;
      if (ring) ring.style.transform = "translate(" + dx + "px," + dy + "px)";
      if (glow) glow.style.transform = "translate(" + gx + "px," + gy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    }
    loop();
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button, [data-cursor], .magnetic, input")) ring && ring.classList.add("hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button, [data-cursor], .magnetic, input")) ring && ring.classList.remove("hover");
    });
    document.addEventListener("mouseleave", function () { if (glow) glow.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { if (glow) glow.style.opacity = ""; });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!coarse && !reduce) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var strength = el.classList.contains("btn") ? 0.4 : 0.3;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + mx * strength + "px," + my * strength + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- SMOOTH SCROLL (inertia) ---------- */
  var lenisActive = false;
  if (!coarse && !reduce) {
    var current = window.scrollY, target = window.scrollY, ease = 0.085, rafScroll;
    function max() { return document.documentElement.scrollHeight - window.innerHeight; }
    function smooth() {
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.4) current = target;
      window.scrollTo(0, current);
      rafScroll = requestAnimationFrame(smooth);
    }
    function onWheel(e) {
      if (e.ctrlKey) return; // pinch zoom
      target = Math.max(0, Math.min(max(), target + e.deltaY));
      e.preventDefault();
    }
    // only hijack if page is taller than viewport
    if (max() > 40) {
      lenisActive = true;
      target = current = window.scrollY;
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("resize", function () { target = Math.min(target, max()); });
      // keep target synced when programmatic / keyboard scroll happens
      window.addEventListener("scroll", function () {
        if (Math.abs(window.scrollY - current) > 4) { current = target = window.scrollY; }
      }, { passive: true });
      smooth();
    }
    window.__setScroll = function (y) { target = current = y; window.scrollTo(0, y); };
  }

  /* ---------- ANCHOR NAV ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 70;
      if (window.__setScroll && lenisActive) {
        // animate target via the smooth loop
        var startY = window.scrollY, dist = y - startY, st = null, dur = 900;
        function step(ts) {
          if (st === null) st = ts;
          var p = Math.min((ts - st) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          window.__setScroll(startY + dist * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      } else {
        window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      }
      var mm = document.querySelector(".mobile-menu");
      if (mm) { mm.classList.remove("open"); document.body.style.overflow = ""; }
    });
  });

  /* ---------- NAV state ---------- */
  var nav = document.querySelector(".nav");
  var lastY = 0;
  function navState() {
    var y = window.scrollY;
    if (y > 14) nav.classList.add("scrolled"); else nav.classList.remove("scrolled");
    if (y > 400 && y > lastY + 4) nav.classList.add("hidden");
    else if (y < lastY - 4 || y < 200) nav.classList.remove("hidden");
    lastY = y;
  }
  window.addEventListener("scroll", navState, { passive: true });
  navState();

  /* ---------- MOBILE MENU ---------- */
  var menuBtn = document.querySelector("[data-menu]");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---------- REVEAL + COUNTERS + ACTIVE NAV ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal, .line-reveal"));
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  function inView(el, m) {
    var r = el.getBoundingClientRect(); var vh = window.innerHeight || 0;
    return r.top < vh - (m || 0) && r.bottom > 0;
  }
  function scanReveals() {
    for (var i = reveals.length - 1; i >= 0; i--) {
      if (inView(reveals[i], 50)) { reveals[i].classList.add("in"); reveals.splice(i, 1); }
    }
  }
  function scanCounters() {
    for (var i = counters.length - 1; i >= 0; i--) {
      if (inView(counters[i], 60)) { animateCount(counters[i]); counters.splice(i, 1); }
    }
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var pre = el.getAttribute("data-prefix") || "", suf = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = pre + target.toFixed(dec) + suf; return; }
    var dur = 1500, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = pre + target.toFixed(dec) + suf;
    }
    requestAnimationFrame(step);
  }
  if (reduce) { document.querySelectorAll(".reveal, .line-reveal").forEach(function (e) { e.classList.add("in"); }); }
  if (!reduce) {
    requestAnimationFrame(function () { if (performance.now() < 700) root.classList.add("anim"); run(); });
  }

  // active nav link
  var navLinks = [].slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var secs = [];
  navLinks.forEach(function (l) { var s = document.querySelector(l.getAttribute("href")); if (s) secs.push({ l: l, s: s }); });
  function scanActive() {
    var mid = (window.innerHeight || 0) * 0.35, cur = null;
    secs.forEach(function (o) { if (o.s.getBoundingClientRect().top <= mid) cur = o; });
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    if (cur) cur.l.classList.add("active");
  }

  function run() { scanReveals(); scanCounters(); scanActive(); }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { run(); ticking = false; }); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  run();
  window.addEventListener("load", run);
  [150, 500, 1200].forEach(function (d) { setTimeout(run, d); });
  var safety = 0, st = setInterval(function () { run(); if (++safety > 14 || (!reveals.length && !counters.length)) clearInterval(st); }, 400);

  /* ---------- JOURNEY TIMELINE progress + drag ---------- */
  (function timeline() {
    var vp = document.getElementById("trackViewport");
    var track = document.getElementById("track");
    if (!vp || !track) return;
    function progress() {
      var maxS = track.scrollWidth - vp.clientWidth;
      var p = maxS > 0 ? (vp.scrollLeft / maxS) * 100 : 0;
      track.style.setProperty("--progress", Math.max(2, p) + "%");
    }
    vp.addEventListener("scroll", progress, { passive: true });
    progress();
    // drag to scroll
    var down = false, sx = 0, sl = 0;
    vp.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; sl = vp.scrollLeft; vp.setPointerCapture(e.pointerId); vp.style.cursor = "grabbing"; });
    vp.addEventListener("pointermove", function (e) { if (down) vp.scrollLeft = sl - (e.clientX - sx); });
    vp.addEventListener("pointerup", function () { down = false; vp.style.cursor = ""; });
    // wheel → horizontal when hovering
    vp.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        var maxS = track.scrollWidth - vp.clientWidth;
        if ((vp.scrollLeft > 0 && e.deltaY < 0) || (vp.scrollLeft < maxS && e.deltaY > 0)) {
          vp.scrollLeft += e.deltaY; e.preventDefault(); e.stopPropagation();
        }
      }
    }, { passive: false });
  })();

  /* ---------- TILT on flip cards / projects ---------- */
  if (!coarse && !reduce) {
    document.querySelectorAll(".proj").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(1400px) rotateX(" + (-py * 2.5) + "deg) rotateY(" + (px * 2.5) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }
  // tap-to-flip for touch
  document.querySelectorAll(".flip").forEach(function (f) {
    f.addEventListener("click", function () { if (coarse) f.classList.toggle("flipped"); });
  });

  /* ---------- TOAST ---------- */
  var toastEl = document.getElementById("toast");
  var toastT;
  function toast(text) {
    if (!toastEl) return;
    toastEl.querySelector(".toast-text").innerHTML = text;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 3400);
  }
  window.KK_toast = toast;

  /* ---------- YEAR ---------- */
  var y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();

  /* =========================================================
     EASTER EGGS
     ========================================================= */
  var unlocked = {};
  function unlock(key, msg) { if (unlocked[key]) return; unlocked[key] = true; toast(msg); }

  // 1) KONAMI → cyber mode
  var seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var pos = 0;
  window.addEventListener("keydown", function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === seq[pos].toLowerCase ? false : false) {}
    if (k === (seq[pos].length === 1 ? seq[pos].toLowerCase() : seq[pos])) {
      pos++;
      if (pos === seq.length) {
        pos = 0;
        root.classList.toggle("cyber");
        if (root.classList.contains("cyber")) { toast("⚡ <b>CYBER MODE</b> engaged"); if (window.KK_HERO) window.KK_HERO.aggressive = true; }
        else { toast("Cyber mode off"); if (window.KK_HERO) window.KK_HERO.aggressive = false; }
      }
    } else { pos = (k === (seq[0].length === 1 ? seq[0].toLowerCase() : seq[0])) ? 1 : 0; }
  });

  // 2) LOGO 5 clicks → hidden achievement + aggressive particles burst
  var logo = document.getElementById("logo"), clicks = 0, clickT;
  if (logo) {
    logo.addEventListener("click", function (e) {
      if (window.location.hash === "" || true) { /* allow normal anchor too */ }
      clicks++;
      clearTimeout(clickT); clickT = setTimeout(function () { clicks = 0; }, 1200);
      if (clicks >= 5) {
        clicks = 0;
        unlock("logo", "🏆 <b>Secret badge:</b> The Persistent One");
        if (window.KK_HERO) { window.KK_HERO.aggressive = true; setTimeout(function () { if (!root.classList.contains("cyber") && window.KK_HERO) window.KK_HERO.aggressive = false; }, 2600); }
      }
    });
  }

  // 3) DEV TERMINAL — backtick toggles, or type "kiran"
  var term = document.getElementById("terminal");
  var termBody = document.getElementById("termBody");
  var termInput = document.getElementById("termInput");
  var typedBuf = "";
  function openTerm() {
    if (!term) return;
    term.classList.add("open");
    if (!termBody.dataset.init) { printTerm("Welcome to kiran@iitm shell. Type <span class='ok'>help</span> for commands.", true); termBody.dataset.init = "1"; }
    setTimeout(function () { termInput && termInput.focus(); }, 300);
    unlock("term", "💻 <b>Developer terminal</b> unlocked");
  }
  function closeTerm() { if (term) term.classList.remove("open"); }
  function printTerm(html, dim) { var d = document.createElement("div"); d.innerHTML = (dim ? "<span class='dim'>" : "") + html + (dim ? "</span>" : ""); termBody.appendChild(d); termBody.scrollTop = termBody.scrollHeight; }
  function echo(cmd) { var d = document.createElement("div"); d.className = "term-line"; d.innerHTML = "<span class='prompt'>❯</span><span>" + escapeHtml(cmd) + "</span>"; termBody.appendChild(d); }
  function escapeHtml(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  var commands = {
    help: function () { return "Available: <span class='ok'>about, skills, projects, contact, social, cyber, clear, sudo, exit</span>"; },
    about: function () { return "Kiran Kumar P — B.Tech AI &amp; Data Analytics, IIT Madras.<br>AI engineer · quant researcher · builder."; },
    skills: function () { return "ML · Deep Learning · Quant Finance · Computer Vision · Agentic AI · Cybersecurity · Full-Stack"; },
    projects: function () { return "1. Portfolio Construction &amp; Index Replication (43/559 stocks)<br>2. Adaptive Vamana Search (1M+ vectors · 98.4% recall)<br>3. IPL Intelligence Dashboard (293K+ events)<br>4. 3D Gaussian Splatting Super-Resolution"; },
    contact: function () { return "<span class='ok'>kirankumarp405@gmail.com</span>"; },
    social: function () { return "github.com/poketwouser · linkedin.com/in/kirankumarp33 · cf/kirankumarp405"; },
    cyber: function () { root.classList.toggle("cyber"); var on = root.classList.contains("cyber"); if (window.KK_HERO) window.KK_HERO.aggressive = on; return on ? "⚡ cyber mode ON" : "cyber mode OFF"; },
    sudo: function () { return "<span class='dim'>nice try.</span> permission denied 😉"; },
    clear: function () { termBody.innerHTML = ""; return ""; },
    exit: function () { closeTerm(); return ""; },
    "": function () { return ""; }
  };
  if (termInput) {
    termInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var cmd = termInput.value.trim();
        echo(cmd);
        var fn = commands[cmd.toLowerCase()];
        var out = fn ? fn() : "command not found: " + escapeHtml(cmd) + " — try <span class='ok'>help</span>";
        if (out) printTerm(out);
        termInput.value = "";
      } else if (e.key === "Escape") { closeTerm(); }
      e.stopPropagation();
    });
  }
  document.querySelector("[data-term-close]") && document.querySelector("[data-term-close]").addEventListener("click", closeTerm);
  window.addEventListener("keydown", function (e) {
    if (e.key === "`" || e.key === "~") { e.preventDefault(); term && (term.classList.contains("open") ? closeTerm() : openTerm()); return; }
    // type "kiran" anywhere (not in an input)
    if (document.activeElement === termInput) return;
    if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
      typedBuf = (typedBuf + e.key.toLowerCase()).slice(-5);
      if (typedBuf === "kiran") openTerm();
    }
  });

})();
