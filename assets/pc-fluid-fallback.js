(() => {
  if (window.PC_TOOLS_FALLBACK_FLUID_READY) return;
  window.PC_TOOLS_FALLBACK_FLUID_READY = true;

  const canvas = document.getElementById("pc-fluid-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let t = 0;
  let pointer = { x: 0, y: 0, px: 0, py: 0, active: false };
  const blobs = [];
  const maxBlobs = 155;

  const palette = [
    [46, 214, 255],
    [0, 145, 255],
    [68, 255, 195],
    [18, 218, 190],
    [94, 79, 255],
    [153, 61, 255]
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!pointer.active) {
      pointer.x = pointer.px = width * 0.58;
      pointer.y = pointer.py = height * 0.42;
    }
  }

  function addBlob(x, y, vx, vy, power = 1) {
    const c = palette[Math.floor(Math.random() * palette.length)];
    blobs.push({
      x, y,
      vx: vx * (0.012 + Math.random() * 0.010) + (Math.random() - 0.5) * 0.7,
      vy: vy * (0.012 + Math.random() * 0.010) + (Math.random() - 0.5) * 0.7,
      r: (70 + Math.random() * 150) * power,
      life: 1,
      decay: 0.0045 + Math.random() * 0.006,
      color: c,
      spin: (Math.random() - 0.5) * 0.04,
      stretch: 1.6 + Math.random() * 1.2
    });

    while (blobs.length > maxBlobs) blobs.shift();
  }

  function onPointerMove(e) {
    pointer.active = true;
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    const dx = pointer.x - pointer.px;
    const dy = pointer.y - pointer.py;
    const speed = Math.hypot(dx, dy);

    if (speed > 0.4) {
      const n = Math.min(7, Math.max(2, Math.floor(speed / 18)));
      for (let i = 0; i < n; i++) {
        const k = n === 1 ? 1 : i / (n - 1);
        addBlob(pointer.px + dx * k, pointer.py + dy * k, dx, dy, speed > 24 ? 1.15 : 0.9);
      }
    }
  }

  function seedIdle() {
    if (blobs.length < 28) {
      addBlob(
        width * (0.12 + Math.random() * 0.76),
        height * (0.16 + Math.random() * 0.58),
        (Math.random() - 0.5) * 85,
        (Math.random() - 0.5) * 55,
        0.9
      );
    }
  }

  function drawBackgroundFlow() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "blur(18px)";
    for (let i = 0; i < 4; i++) {
      const y = height * (0.24 + i * 0.13) + Math.sin(t * 0.008 + i) * 45;
      const grad = ctx.createLinearGradient(0, y, width, y + 90);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(0.24, i % 2 ? "rgba(44, 212, 255, 0.08)" : "rgba(90, 255, 195, 0.06)");
      grad.addColorStop(0.58, i % 2 ? "rgba(100, 70, 255, 0.07)" : "rgba(34, 145, 255, 0.08)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 90 - i * 12;
      ctx.beginPath();
      ctx.moveTo(-120, y);
      ctx.bezierCurveTo(
        width * 0.22, y - 130 + Math.sin(t * 0.010 + i) * 65,
        width * 0.54, y + 145 - Math.cos(t * 0.007 + i) * 60,
        width + 120, y - 20
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBlob(b, i) {
    const [r, g, bl] = b.color;
    const radius = Math.max(0, b.r * b.life);
    if (radius < 0.5) return;

    const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
    glow.addColorStop(0.00, `rgba(${r}, ${g}, ${bl}, ${0.30 * b.life})`);
    glow.addColorStop(0.18, `rgba(${r}, ${g}, ${bl}, ${0.17 * b.life})`);
    glow.addColorStop(0.48, `rgba(${r}, ${g}, ${bl}, ${0.065 * b.life})`);
    glow.addColorStop(1.00, `rgba(${r}, ${g}, ${bl}, 0)`);

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(t * b.spin + i);
    ctx.scale(b.stretch, 0.58);
    ctx.translate(-b.x, -b.y);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    t += 1;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(2, 6, 12, 0.92)";
    ctx.fillRect(0, 0, width, height);

    drawBackgroundFlow();

    ctx.globalCompositeOperation = "screen";
    ctx.filter = "blur(12px) saturate(145%)";

    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      const curl = Math.sin((b.x * 0.007) + (b.y * 0.006) + t * 0.026) * 0.55;
      b.vx += Math.cos(t * 0.012 + i) * 0.035 + curl * 0.035;
      b.vy += Math.sin(t * 0.010 + i) * 0.030 - curl * 0.030;
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.986;
      b.vy *= 0.986;
      b.life -= b.decay;

      drawBlob(b, i);

      if (b.life <= 0 || b.x < -420 || b.x > width + 420 || b.y < -420 || b.y > height + 420) {
        blobs.splice(i, 1);
      }
    }

    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";

    if (t % 70 === 0) seedIdle();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    onPointerMove(e);
    for (let i = 0; i < 12; i++) {
      addBlob(e.clientX, e.clientY, (Math.random() - 0.5) * 170, (Math.random() - 0.5) * 170, 1.25);
    }
  }, { passive: true });

  resize();
  for (let i = 0; i < 34; i++) seedIdle();
  frame();
})();
