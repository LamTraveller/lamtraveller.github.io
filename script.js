/* ==========================================================
   Lamcellari · Portfolio script
     1. Animated network background (canvas)
     2. "Show more" toggles
   ========================================================== */


/* ---------- 1. Animated network background ---------- */
(function () {
  var canvas = document.getElementById("bg");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var toggleBtn = document.getElementById("motion");

  // animation is on by default; a visitor can pause it with the footer button
  // and that choice is remembered in their browser
  var animate = true;
  try {
    if (localStorage.getItem("bgMotion") === "off") animate = false;
  } catch (e) { /* storage unavailable: ignore */ }

  var RGB = "0, 229, 160";          // accent color
  var w = 0, h = 0, dpr = 1;
  var nodes = [];
  var linkDist = 140;
  var rafId = null;
  var lastTime = 0;
  var resizeTimer = null;

  function makeNode() {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.12 + Math.random() * 0.18;   // pixels per frame at 60fps
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // fewer nodes and shorter links on small screens (better battery and speed)
    var small = w < 700;
    linkDist = small ? 100 : 140;
    var target = Math.round(Math.min((w * h) / (small ? 16000 : 15000), small ? 40 : 80));

    while (nodes.length < target) nodes.push(makeNode());
    if (nodes.length > target) nodes.length = target;

    if (!animate) draw();
  }

  function step(dt) {
    var margin = 20;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      if (n.x < -margin) n.x = w + margin;
      if (n.x > w + margin) n.x = -margin;
      if (n.y < -margin) n.y = h + margin;
      if (n.y > h + margin) n.y = -margin;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // links
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          ctx.strokeStyle = "rgba(" + RGB + "," + (0.28 * (1 - d / linkDist)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // dots
    ctx.fillStyle = "rgba(" + RGB + ", 0.55)";
    for (var k = 0; k < nodes.length; k++) {
      ctx.beginPath();
      ctx.arc(nodes[k].x, nodes[k].y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(time) {
    // dt = 1 at 60fps, so speed looks the same on 120Hz screens
    var dt = lastTime ? Math.min((time - lastTime) / 16.667, 3) : 1;
    lastTime = time;
    step(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (!animate || rafId) return;
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // pause when the tab is hidden
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  // footer toggle
  function updateButton() {
    if (!toggleBtn) return;
    toggleBtn.textContent = "background animation: " + (animate ? "on" : "off");
    toggleBtn.setAttribute("aria-pressed", animate ? "true" : "false");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      animate = !animate;
      try { localStorage.setItem("bgMotion", animate ? "on" : "off"); } catch (e) { /* ignore */ }
      if (animate) start(); else { stop(); draw(); }
      updateButton();
    });
  }

  resize();
  updateButton();
  if (animate) start(); else draw();
})();


/* ---------- 2. "Show more" toggles ---------- */
document.querySelectorAll(".more").forEach(function (btn) {
  var grid = btn.previousElementSibling;

  // hide the button when the section has nothing extra to reveal
  if (!grid || !grid.querySelector(".extra")) {
    btn.style.display = "none";
    return;
  }

  btn.addEventListener("click", function () {
    var open = grid.classList.toggle("open");
    btn.textContent = open ? "Show less" : "Show more";
  });
});
