/* ============================================================
   KIRAN KUMAR P — graphics engine
   Hero particle universe · project viz · skills galaxy · contact
   All vanilla canvas, DPR-aware, rAF-gated, visibility-aware.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var accent = function () { return getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim() || "#34e2ff"; };
  var blue = function () { return getComputedStyle(document.documentElement).getPropertyValue("--blue").trim() || "#2f7bff"; };

  function fit(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height, ctx: ctx };
  }
  function vis(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > -200 && r.top < (window.innerHeight || 0) + 200;
  }
  // true when the canvas's CSS box differs from what we last measured
  function stale(canvas, W, H) {
    return Math.abs(canvas.clientWidth - W) > 2 || Math.abs(canvas.clientHeight - H) > 2;
  }

  /* ===========================================================
     HERO — particle universe / camera fly-through
     =========================================================== */
  var HERO = { aggressive: false };
  window.KK_HERO = HERO;
  (function heroUniverse() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    var dim = fit(canvas), ctx = dim.ctx, W = dim.w, H = dim.h;
    var stars = [], N = 0, mx = 0, my = 0, tmx = 0, tmy = 0, speed = 0, targetSpeed = 0.55;

    function seed() {
      var area = W * H;
      N = Math.max(90, Math.min(reduce ? 120 : 320, Math.round(area / 5200)));
      stars = [];
      for (var i = 0; i < N; i++) stars.push(mk(true));
    }
    function mk(init) {
      return {
        x: (Math.random() - 0.5) * W * 1.6,
        y: (Math.random() - 0.5) * H * 1.6,
        z: init ? Math.random() * W : W,
        pz: 0,
        c: Math.random() > 0.78 ? blue() : accent(),
        r: Math.random() * 1.4 + 0.4
      };
    }
    function resize() { dim = fit(canvas); ctx = dim.ctx; W = dim.w; H = dim.h; seed(); }
    window.addEventListener("resize", resize, { passive: true });
    seed();

    window.addEventListener("mousemove", function (e) {
      tmx = (e.clientX / window.innerWidth - 0.5);
      tmy = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    var raf;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!vis(canvas)) return;
      if (stale(canvas, W, H)) resize();
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      var agg = HERO.aggressive;
      targetSpeed = agg ? 3.2 : 0.55;
      speed += (targetSpeed - speed) * 0.04;

      ctx.clearRect(0, 0, W, H);
      var cx = W / 2 + mx * W * 0.16, cy = H / 2 + my * H * 0.16;
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < N; i++) {
        var s = stars[i];
        s.pz = s.z;
        s.z -= speed * (agg ? 14 : 6);
        if (s.z < 1) { stars[i] = mk(false); continue; }
        var k = 220 / s.z;
        var x = s.x * k + cx, y = s.y * k + cy;
        var pk = 220 / s.pz;
        var px = s.x * pk + cx, py = s.y * pk + cy;
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
        var size = (1 - s.z / W) * 2.6 * s.r + 0.3;
        var alpha = Math.min(1, (1 - s.z / W) * 1.3);
        ctx.strokeStyle = s.c;
        ctx.globalAlpha = alpha * (agg ? 0.95 : 0.8);
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
        if (size > 1.4) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.c;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.6, 0, 6.28);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    if (!reduce) frame();
    else { ctx.clearRect(0, 0, W, H); }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) { cancelAnimationFrame(raf); frame(); }
    });
  })();

  /* ===========================================================
     PROJECT VISUALS
     =========================================================== */
  function projViz(el) {
    var canvas = el.querySelector("canvas");
    var kind = el.getAttribute("data-viz");
    if (!canvas) return;
    var dim = fit(canvas), ctx = dim.ctx, W = dim.w, H = dim.h, t = 0, raf;
    function resize() { dim = fit(canvas); ctx = dim.ctx; W = dim.w; H = dim.h; if (kind === "graph") buildGraph(); }
    window.addEventListener("resize", resize, { passive: true });

    var nodes = [], edges = [];
    function buildGraph() {
      nodes = []; edges = [];
      var n = Math.max(10, Math.min(20, Math.round(W / 26)));
      for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25 });
      for (var j = 0; j < nodes.length; j++) {
        for (var k = j + 1; k < nodes.length; k++) {
          if (Math.hypot(nodes[j].x-nodes[k].x, nodes[j].y-nodes[k].y) < W * 0.26) edges.push([j, k]);
        }
      }
    }
    if (kind === "graph") buildGraph();

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!vis(canvas)) return;
      if (stale(canvas, W, H)) resize();
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      var A = accent(), B = blue();

      if (kind === "equity") {
        // grid
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
        for (var g = 1; g < 4; g++) { var yy = H * g / 4; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
        var pts = [], P = 60;
        for (var i = 0; i <= P; i++) {
          var x = i / P;
          var base = Math.pow(x, 1.5) * 0.8;
          var noise = Math.sin(i * 0.7 + 1) * 0.04 + Math.sin(i * 0.27) * 0.03;
          var y = base + noise;
          pts.push({ x: 30 + x * (W - 60), y: H - 30 - y * (H - 70) });
        }
        var show = P; // full curve every frame — entrance handled by section fade
        var grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, hexA(A, 0.28));
        grad.addColorStop(1, hexA(A, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(pts[0].x, H);
        for (var p = 0; p <= show; p++) ctx.lineTo(pts[p].x, pts[p].y);
        ctx.lineTo(pts[show] ? pts[show].x : pts[0].x, H); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = A; ctx.lineWidth = 2.4; ctx.lineJoin = "round";
        ctx.shadowColor = A; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (var q = 1; q <= show; q++) ctx.lineTo(pts[q].x, pts[q].y);
        ctx.stroke(); ctx.shadowBlur = 0;
        if (pts[show]) { ctx.fillStyle = A; ctx.beginPath(); ctx.arc(pts[show].x, pts[show].y, 4, 0, 6.28); ctx.fill();
          ctx.globalAlpha = 0.4 + Math.sin(t*4)*0.2; ctx.beginPath(); ctx.arc(pts[show].x, pts[show].y, 9, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1; }
      }

      else if (kind === "bars") {
        var cols = 26, gap = 4, bw = (W - 40 - gap * (cols - 1)) / cols;
        for (var b = 0; b < cols; b++) {
          var h = (Math.abs(Math.sin(b * 0.5 + t * 1.2)) * 0.6 + 0.15) * (H - 60);
          var x2 = 20 + b * (bw + gap);
          var gr = ctx.createLinearGradient(0, H - h, 0, H);
          gr.addColorStop(0, b % 3 === 0 ? A : B); gr.addColorStop(1, hexA(b % 3 === 0 ? A : B, 0.15));
          ctx.fillStyle = gr;
          roundRect(ctx, x2, H - 24 - h, bw, h, 2); ctx.fill();
        }
        // streaming dots
        ctx.fillStyle = A;
        for (var d = 0; d < 5; d++) {
          var dx = ((t * 60 + d * 80) % (W + 40)) - 20;
          ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(dx, 22, 2, 0, 6.28); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      else if (kind === "graph") {
        for (var e = 0; e < edges.length; e++) {
          var a = nodes[edges[e][0]], c = nodes[edges[e][1]];
          var dist = Math.hypot(a.x - c.x, a.y - c.y);
          ctx.strokeStyle = hexA(A, Math.max(0, 0.28 - dist / (W * 1.3)));
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(c.x, c.y); ctx.stroke();
        }
        // query path pulse
        var path = [0, 2, 4, 6].filter(function (i) { return nodes[i]; });
        ctx.strokeStyle = A; ctx.lineWidth = 2; ctx.shadowColor = A; ctx.shadowBlur = 10;
        ctx.beginPath();
        for (var pp = 0; pp < path.length; pp++) { var nd = nodes[path[pp]]; if (pp === 0) ctx.moveTo(nd.x, nd.y); else ctx.lineTo(nd.x, nd.y); }
        ctx.stroke(); ctx.shadowBlur = 0;
        for (var nn = 0; nn < nodes.length; nn++) {
          var no = nodes[nn];
          no.x += no.vx; no.y += no.vy;
          if (no.x < 8 || no.x > W - 8) no.vx *= -1;
          if (no.y < 8 || no.y > H - 8) no.vy *= -1;
          var hot = path.indexOf(nn) >= 0;
          ctx.fillStyle = hot ? A : hexA(B, 0.9);
          if (hot) { ctx.shadowColor = A; ctx.shadowBlur = 10; }
          ctx.beginPath(); ctx.arc(no.x, no.y, hot ? 4.5 : 3, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
        }
      }

      else if (kind === "vision") {
        // moving bounding boxes over a faux scene
        var boxes = [
          { x: 0.16, y: 0.22, w: 0.3, h: 0.36, l: "person 0.98" },
          { x: 0.56, y: 0.42, w: 0.26, h: 0.3, l: "object 0.91" },
          { x: 0.32, y: 0.6, w: 0.22, h: 0.24, l: "label 0.87" }
        ];
        boxes.forEach(function (bx, i) {
          var ox = Math.sin(t * 0.8 + i) * 6, oy = Math.cos(t * 0.7 + i) * 5;
          var X = bx.x * W + ox, Y = bx.y * H + oy, Wd = bx.w * W, Hd = bx.h * H;
          ctx.strokeStyle = i === 0 ? A : B; ctx.lineWidth = 1.6;
          ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 8;
          // corner brackets
          var c2 = 14;
          bracket(ctx, X, Y, c2, 1, 1); bracket(ctx, X + Wd, Y, c2, -1, 1);
          bracket(ctx, X, Y + Hd, c2, 1, -1); bracket(ctx, X + Wd, Y + Hd, c2, -1, -1);
          ctx.shadowBlur = 0;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.globalAlpha = 0.9; ctx.fillRect(X, Y - 15, ctx.measureText(bx.l).width + 10, 14);
          ctx.fillStyle = "#021018"; ctx.fillText(bx.l, X + 5, Y - 5); ctx.globalAlpha = 1;
        });
        // scan line
        var sy = (t * 50) % H;
        ctx.strokeStyle = hexA(A, 0.5); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
      }

      else if (kind === "agents") {
        // central orchestrator with 4 satellite agents exchanging packets
        var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.32;
        var names = ["Ingest", "Analyze", "Comply", "Report"];
        var ag = names.map(function (n, i) {
          var a2 = t * 0.4 + i * (Math.PI * 2 / 4);
          return { x: cx + Math.cos(a2) * R, y: cy + Math.sin(a2) * R * 0.82, n: n, i: i };
        });
        // links + traveling packets
        ag.forEach(function (a2) {
          ctx.strokeStyle = hexA(B, 0.18); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(a2.x, a2.y); ctx.stroke();
          var prog = (t * 0.6 + a2.i * 0.25) % 1;
          var dir = a2.i % 2 === 0 ? prog : 1 - prog;
          var px = cx + (a2.x - cx) * dir, py = cy + (a2.y - cy) * dir;
          ctx.fillStyle = A; ctx.shadowColor = A; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
        });
        // agent nodes
        ag.forEach(function (a2) {
          ctx.fillStyle = hexA(B, 0.95); ctx.strokeStyle = hexA(A, 0.5);
          ctx.shadowColor = B; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(a2.x, a2.y, 13, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = "#dbe8ff"; ctx.font = "9px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
          ctx.fillText(a2.n, a2.x, a2.y + 26);
        });
        ctx.textAlign = "left";
        // pulsing core
        var pr = 18 + Math.sin(t * 2) * 3;
        ctx.fillStyle = A; ctx.shadowColor = A; ctx.shadowBlur = 26;
        ctx.beginPath(); ctx.arc(cx, cy, pr, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = "#021018"; ctx.font = "bold 10px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
        ctx.fillText("LLM", cx, cy + 3.5); ctx.textAlign = "left";
      }

      else if (kind === "compiler") {
        // source lines flowing through stages into bytecode tokens
        ctx.font = "11px 'JetBrains Mono', monospace";
        var stages = ["lex", "parse", "symtab", "vm"];
        var colW = W / 5;
        // vertical stage separators with labels
        for (var s2 = 0; s2 < stages.length; s2++) {
          var sxp = colW * (s2 + 1);
          ctx.strokeStyle = hexA(B, 0.1); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(sxp, 18); ctx.lineTo(sxp, H - 18); ctx.stroke();
          ctx.fillStyle = hexA(A, 0.5); ctx.fillText(stages[s2], sxp - colW + 12, 26);
        }
        // tokens drifting left→right, color shifts per stage
        var TN = 16;
        for (var k2 = 0; k2 < TN; k2++) {
          var p2 = ((t * 0.18 + k2 / TN) % 1);
          var X2 = 12 + p2 * (W - 24);
          var row = (k2 * 53) % (H - 60) + 40;
          var stage = Math.min(3, Math.floor(p2 * 4));
          var col = stage >= 3 ? A : B;
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = hexA(col, 0.16); roundRect(ctx, X2, row, 26, 13, 3); ctx.fill();
          ctx.globalAlpha = 1; ctx.fillStyle = col;
          ctx.fillText(stage >= 3 ? "0x" + (k2 % 16).toString(16) : ["id", "(", ")", "{", ";", "="][k2 % 6], X2 + 4, row + 10);
        }
        ctx.globalAlpha = 1;
      }

      else if (kind === "audio") {
        // live waveform that resolves into a spectrogram-ish bar trail
        var mid = H / 2, N2 = 60, bw2 = W / N2;
        ctx.strokeStyle = A; ctx.lineWidth = 2; ctx.shadowColor = A; ctx.shadowBlur = 10;
        ctx.beginPath();
        for (var i2 = 0; i2 <= N2; i2++) {
          var x2 = i2 * bw2;
          var env = Math.exp(-Math.pow((i2 / N2 - 0.5) * 3.2, 2));
          var amp = Math.sin(i2 * 0.6 + t * 5) * Math.sin(i2 * 0.21 + t * 2) * env * (H * 0.32);
          if (i2 === 0) ctx.moveTo(x2, mid + amp); else ctx.lineTo(x2, mid + amp);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
        // mirrored faint
        ctx.strokeStyle = hexA(B, 0.3); ctx.lineWidth = 1;
        ctx.beginPath();
        for (var i3 = 0; i3 <= N2; i3++) {
          var x3 = i3 * bw2;
          var env2 = Math.exp(-Math.pow((i3 / N2 - 0.5) * 3.2, 2));
          var amp2 = Math.sin(i3 * 0.6 + t * 5) * Math.sin(i3 * 0.21 + t * 2) * env2 * (H * 0.32);
          if (i3 === 0) ctx.moveTo(x3, mid - amp2); else ctx.lineTo(x3, mid - amp2);
        }
        ctx.stroke();
        // decoded digit ticks
        ctx.fillStyle = hexA(A, 0.55); ctx.font = "10px 'JetBrains Mono', monospace";
        var digs = ["7", "·", "2", "·", "9", "·", "4"];
        for (var d2 = 0; d2 < digs.length; d2++) {
          var alpha = (Math.sin(t * 2 - d2 * 0.5) + 1) / 2;
          ctx.globalAlpha = 0.3 + alpha * 0.6;
          ctx.fillText(digs[d2], 16 + d2 * (W - 32) / digs.length, H - 14);
        }
        ctx.globalAlpha = 1;
      }

      else if (kind === "vo2") {
        // rising VO2 uptake curve toward plateau (VO2max), with samples
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
        for (var g2 = 1; g2 < 4; g2++) { var yy2 = H * g2 / 4; ctx.beginPath(); ctx.moveTo(0, yy2); ctx.lineTo(W, yy2); ctx.stroke(); }
        var P2 = 60, pts2 = [];
        for (var i4 = 0; i4 <= P2; i4++) {
          var xf = i4 / P2;
          // exponential rise to plateau + slight breathing oscillation
          var val = (1 - Math.exp(-xf * 3.4)) * 0.82 + Math.sin(xf * 22 + t * 1.5) * 0.012 * xf;
          pts2.push({ x: 16 + xf * (W - 32), y: H - 44 - val * (H - 78) });
        }
        // plateau (VO2max) marker line
        ctx.strokeStyle = hexA(A, 0.25); ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, pts2[P2].y); ctx.lineTo(W, pts2[P2].y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = hexA(A, 0.6); ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText("VO₂max", W - 60, pts2[P2].y - 6);
        // area + line
        var gr2 = ctx.createLinearGradient(0, 0, 0, H);
        gr2.addColorStop(0, hexA(A, 0.22)); gr2.addColorStop(1, hexA(A, 0));
        ctx.fillStyle = gr2; ctx.beginPath(); ctx.moveTo(pts2[0].x, H);
        pts2.forEach(function (p) { ctx.lineTo(p.x, p.y); });
        ctx.lineTo(pts2[P2].x, H); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = A; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
        ctx.shadowColor = A; ctx.shadowBlur = 12; ctx.beginPath();
        pts2.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
        ctx.stroke(); ctx.shadowBlur = 0;
        // a moving sampling dot
        var mi = Math.floor(((t * 0.25) % 1) * P2);
        if (pts2[mi]) { ctx.fillStyle = A; ctx.beginPath(); ctx.arc(pts2[mi].x, pts2[mi].y, 3.5, 0, 6.28); ctx.fill();
          ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(pts2[mi].x, pts2[mi].y, 8, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1; }
      }

      else if (kind === "embed") {
        // word vectors drifting into semantic clusters
        if (!el._emb) {
          var cc0 = [{ x: 0.28, y: 0.34 }, { x: 0.7, y: 0.32 }, { x: 0.5, y: 0.7 }];
          var pp = [];
          for (var ie = 0; ie < 48; ie++) { var c0 = cc0[ie % 3]; pp.push({ cx: c0.x, cy: c0.y, x: Math.random(), y: Math.random(), ci: ie % 3, ph: Math.random() * 6.28 }); }
          el._emb = { c: cc0, p: pp };
        }
        var E = el._emb, cols = [A, B, A];
        E.p.forEach(function (p) {
          var tx = p.cx + Math.cos(p.ph + t * 0.4) * 0.1, ty = p.cy + Math.sin(p.ph * 1.3 + t * 0.4) * 0.1;
          p.x += (tx - p.x) * 0.03; p.y += (ty - p.y) * 0.03;
          ctx.strokeStyle = hexA(cols[p.ci], 0.07); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x * W, p.y * H); ctx.lineTo(p.cx * W, p.cy * H); ctx.stroke();
        });
        E.p.forEach(function (p) {
          ctx.fillStyle = hexA(cols[p.ci], 0.9); ctx.shadowColor = cols[p.ci]; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 2.3, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
        });
        var labs = ["king · queen", "dog · cat", "run · ran"];
        ctx.font = "10px 'JetBrains Mono', monospace";
        E.c.forEach(function (c, i) { ctx.fillStyle = hexA(cols[i], 0.6); ctx.textAlign = "center"; ctx.fillText(labs[i], c.x * W, c.y * H - 16); });
        ctx.textAlign = "left";
      }

      else if (kind === "med") {
        // faux chest scan: ribcage, lungs, scanning line, detection bracket
        var cx2 = W / 2;
        ctx.strokeStyle = hexA(B, 0.12); ctx.lineWidth = 1;
        for (var rr = 0; rr < 5; rr++) { ctx.beginPath(); ctx.ellipse(cx2, H * 0.5, W * (0.12 + rr * 0.06), H * (0.16 + rr * 0.07), 0, 0, 6.28); ctx.stroke(); }
        [-1, 1].forEach(function (s3) {
          ctx.fillStyle = hexA(A, 0.05); ctx.strokeStyle = hexA(A, 0.22); ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.ellipse(cx2 + s3 * W * 0.13, H * 0.5, W * 0.095, H * 0.25, s3 * 0.2, 0, 6.28); ctx.fill(); ctx.stroke();
        });
        var sy2 = (t * 42) % H; ctx.strokeStyle = A; ctx.shadowColor = A; ctx.shadowBlur = 12; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, sy2); ctx.lineTo(W, sy2); ctx.stroke(); ctx.shadowBlur = 0;
        var bx2 = cx2 + W * 0.05, by2 = H * 0.44, bw2 = W * 0.14, bh2 = H * 0.17, cc2 = 12;
        ctx.strokeStyle = B; ctx.lineWidth = 1.6; ctx.shadowColor = B; ctx.shadowBlur = 8;
        bracket(ctx, bx2, by2, cc2, 1, 1); bracket(ctx, bx2 + bw2, by2, cc2, -1, 1);
        bracket(ctx, bx2, by2 + bh2, cc2, 1, -1); bracket(ctx, bx2 + bw2, by2 + bh2, cc2, -1, -1);
        ctx.shadowBlur = 0; ctx.fillStyle = B; ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText("opacity " + (0.9 + Math.sin(t * 2) * 0.04).toFixed(2), bx2, by2 - 6);
      }
    }
    function bracket(ctx, x, y, s, dx, dy) {
      ctx.beginPath(); ctx.moveTo(x + s * dx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + s * dy); ctx.stroke();
    }
    if (!reduce) frame(); else frame.call ? frame() : 0;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); if (!reduce) frame(); }
    });
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function hexA(hex, a) {
    hex = hex.trim();
    if (hex[0] !== "#") return hex;
    var n = hex.length === 4 ? hex.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : hex;
    var r = parseInt(n.slice(1, 3), 16), g = parseInt(n.slice(3, 5), 16), b = parseInt(n.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  document.querySelectorAll(".proj-visual[data-viz]").forEach(projViz);

  /* ===========================================================
     SKILLS GALAXY
     =========================================================== */
  (function galaxy() {
    var stage = document.getElementById("galaxyStage");
    var canvas = document.getElementById("galaxy-canvas");
    if (!stage || !canvas) return;
    var cats = [
      { n: "Machine Learning", r: 0.30, a: 0.00, sp: 0.18 },
      { n: "Deep Learning", r: 0.40, a: 0.79, sp: -0.13 },
      { n: "Quant Finance", r: 0.34, a: 1.57, sp: 0.16 },
      { n: "Computer Vision", r: 0.44, a: 2.36, sp: -0.1 },
      { n: "Agentic AI", r: 0.30, a: 3.14, sp: 0.2 },
      { n: "Cybersecurity", r: 0.40, a: 3.93, sp: -0.15 },
      { n: "Full-Stack Dev", r: 0.35, a: 4.71, sp: 0.14 },
      { n: "Cricket", r: 0.42, a: 5.50, sp: -0.12 }
    ];
    cats.forEach(function (c) {
      var el = document.createElement("div");
      el.className = "galaxy-label magnetic"; el.setAttribute("data-cursor", "");
      el.innerHTML = '<span class="gdot"></span>' + c.n;
      stage.appendChild(el); c.el = el; c.hover = false;
      el.addEventListener("mouseenter", function () { c.hover = true; });
      el.addEventListener("mouseleave", function () { c.hover = false; });
    });
    var dim = fit(canvas), ctx = dim.ctx, W = dim.w, H = dim.h, t = 0, raf;
    var mxp = 0.5, myp = 0.5;
    // Geometry is always derived from the STAGE box (never the canvas, which can
    // mis-measure at load); CSS-px values are what we position DOM labels with.
    function geo() { var r = stage.getBoundingClientRect(); return { w: r.w || r.width, h: r.height }; }
    function resize() { dim = fit(canvas); ctx = dim.ctx; W = dim.w; H = dim.h; }
    window.addEventListener("resize", function () { resize(); placeLabels(); }, { passive: true });
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect(); mxp = (e.clientX - r.left) / r.width; myp = (e.clientY - r.top) / r.height;
    }, { passive: true });

    // rAF-independent label placement — guarantees labels are never stuck at 0,0
    // even if requestAnimationFrame is throttled while the section is off-screen.
    function placeLabels() {
      var g = geo(); if (!g.w) return;
      var cx = g.w / 2, cy = g.h / 2, minDim = Math.min(g.w, g.h);
      var ox = (mxp - 0.5) * 40, oy = (myp - 0.5) * 30;
      cats.forEach(function (c) {
        var ang = c.a + t * c.sp * (c.hover ? 0.2 : 1);
        var rr = c.r * minDim * (c.hover ? 1.06 : 1);
        c.x = cx + Math.cos(ang) * rr + ox;
        c.y = cy + Math.sin(ang) * rr * 0.62 + oy;
        if (c.el) { c.el.style.left = c.x + "px"; c.el.style.top = (c.y - 26) + "px"; }
      });
    }
    placeLabels();
    window.addEventListener("scroll", placeLabels, { passive: true });
    setInterval(function () { if (document.hidden) placeLabels(); }, 600);

    var trails = [];
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!vis(canvas)) return;
      if (stale(canvas, W, H)) resize();
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      var A = accent(), B = blue();
      var g = geo(); var cx = g.w / 2, cy = g.h / 2, minDim = Math.min(g.w, g.h);
      ctx.globalCompositeOperation = "lighter";
      // orbit rings
      ctx.globalAlpha = 0.5;
      cats.forEach(function (c) {
        ctx.strokeStyle = hexA(B, 0.07); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, c.r * minDim, c.r * minDim * 0.62, 0, 0, 6.28); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      placeLabels();
      var ox = (mxp - 0.5) * 40, oy = (myp - 0.5) * 30;
      cats.forEach(function (c) {
        trails.push({ x: c.x, y: c.y, life: 1, c: c.hover ? A : B });
        ctx.strokeStyle = hexA(c.hover ? A : B, c.hover ? 0.4 : 0.12);
        ctx.lineWidth = c.hover ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(cx + ox * 0.3, cy + oy * 0.3); ctx.lineTo(c.x, c.y); ctx.stroke();
        ctx.fillStyle = c.hover ? A : B; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = c.hover ? 22 : 10;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.hover ? 7 : 4.5, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
      });
      for (var i = trails.length - 1; i >= 0; i--) {
        var tr = trails[i]; tr.life -= 0.04;
        if (tr.life <= 0) { trails.splice(i, 1); continue; }
        ctx.globalAlpha = tr.life * 0.4; ctx.fillStyle = tr.c;
        ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.life * 3, 0, 6.28); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    if (!reduce) frame();
    document.addEventListener("visibilitychange", function () {
      placeLabels();
      if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); if (!reduce) frame(); }
    });
  })();

  /* ===========================================================
     CONTACT — gentle drifting particle field
     =========================================================== */
  (function contactField() {
    var canvas = document.getElementById("contact-canvas");
    if (!canvas) return;
    var dim = fit(canvas), ctx = dim.ctx, W = dim.w, H = dim.h, raf, parts = [];
    function resize() { dim = fit(canvas); ctx = dim.ctx; W = dim.w; H = dim.h; seed(); }
    window.addEventListener("resize", resize, { passive: true });
    function seed() {
      var n = Math.max(28, Math.min(reduce ? 30 : 80, Math.round(W * H / 16000)));
      parts = [];
      for (var i = 0; i < n; i++) parts.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r: Math.random()*1.6+0.4 });
    }
    seed();
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!vis(canvas)) return;
      if (stale(canvas, W, H)) resize();
      ctx.clearRect(0, 0, W, H);
      var A = accent();
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        for (var j = i + 1; j < parts.length; j++) {
          var q = parts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < W * 0.08) { ctx.strokeStyle = hexA(A, (1 - d / (W*0.08)) * 0.12); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
        }
        ctx.fillStyle = hexA(A, 0.6); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (!reduce) frame();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); if (!reduce) frame(); }
    });
  })();

})();
