/* ============================================================
   Kiran Kumar — site interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("kk-theme"); } catch (e) {}
  if (stored) {
    root.setAttribute("data-theme", stored);
  } else {
    // Dark by default (per preference); still respect explicit light system pref? Default dark.
    root.setAttribute("data-theme", "dark");
  }

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("kk-theme", t); } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var toggle = e.target.closest("[data-theme-toggle]");
    if (toggle) {
      var cur = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      setTheme(cur === "light" ? "dark" : "light");
    }
  });

  /* ---------- Nav scrolled state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector("[data-menu]");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
      document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Reveal on scroll (scan-based: works in throttled/hidden iframes) ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function inViewport(el, margin) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh - (margin || 0) && r.bottom > 0;
  }

  function scanReveals() {
    if (!reveals.length) return;
    for (var i = reveals.length - 1; i >= 0; i--) {
      if (inViewport(reveals[i], 40)) {
        reveals[i].classList.add("in");
        reveals.splice(i, 1);
      }
    }
  }

  function scanCounters() {
    if (!counters.length) return;
    for (var i = counters.length - 1; i >= 0; i--) {
      if (inViewport(counters[i], 80)) {
        animateCount(counters[i]);
        counters.splice(i, 1);
      }
    }
  }

  if (reduce) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // Enable entrance animations ONLY if the page is painting promptly at load
  // (a rAF that fires within ~600ms). In a frozen/backgrounded iframe rAF never
  // fires, so html.anim is never added and content stays plainly visible.
  if (!reduce) {
    requestAnimationFrame(function () {
      if (performance.now() < 650) {
        document.documentElement.classList.add("anim");
      }
      runScans();
    });
  }

  /* ---------- Count-up metrics ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---------- Active section in nav (scan-based) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  var sections = [];
  navLinks.forEach(function (l) {
    var s = document.querySelector(l.getAttribute("href"));
    if (s) sections.push({ link: l, el: s });
  });
  function scanActive() {
    if (!sections.length) return;
    var mid = (window.innerHeight || 0) * 0.4;
    var current = null;
    sections.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      if (r.top <= mid) current = s;
    });
    navLinks.forEach(function (l) { l.style.color = ""; });
    if (current) current.link.style.color = "var(--text)";
  }

  /* ---------- Unified scroll/resize loop ---------- */
  var ticking = false;
  function runScans() {
    scanReveals();
    scanCounters();
    scanActive();
  }
  function onFrame() {
    runScans();
    ticking = false;
  }
  function requestScan() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onFrame); }
  }
  window.addEventListener("scroll", requestScan, { passive: true });
  window.addEventListener("resize", requestScan, { passive: true });
  // Initial scans run DIRECTLY (not via rAF, which is paused in hidden/throttled
  // iframes) so above-the-fold content reveals reliably.
  runScans();
  window.addEventListener("load", runScans);
  setTimeout(runScans, 150);
  setTimeout(runScans, 500);
  setTimeout(runScans, 1200);
  // Safety net: keep scanning briefly in case the iframe was offscreen at load.
  var safety = 0;
  var safetyTimer = setInterval(function () {
    runScans();
    if (++safety > 12 || (!reveals.length && !counters.length)) clearInterval(safetyTimer);
  }, 400);

  /* ---------- Year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
