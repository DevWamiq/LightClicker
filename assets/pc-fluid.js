(() => {
  const canvas = document.getElementById("pc-fluid-canvas");
  if (!canvas) return;

  function loadScript(src, onload, onerror) {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = onload || null;
    s.onerror = onerror || null;
    document.head.appendChild(s);
  }

  function supportsWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl2", { alpha: true }) ||
         c.getContext("webgl", { alpha: true }) ||
         c.getContext("experimental-webgl", { alpha: true }))
      );
    } catch (e) {
      return false;
    }
  }

  let fallbackStarted = false;
  function startFallback() {
    if (fallbackStarted || window.PC_TOOLS_FALLBACK_FLUID_READY) return;
    fallbackStarted = true;
    loadScript("assets/pc-fluid-fallback.js?v=universal-1");
  }

  if (!supportsWebGL()) {
    startFallback();
    return;
  }

  const failTimer = setTimeout(() => {
    if (!window.PC_TOOLS_WEBGL_FLUID_READY) startFallback();
  }, 1800);

  window.addEventListener("error", (event) => {
    const file = String(event.filename || "");
    if (file.includes("pc-fluid-webgl.js")) {
      clearTimeout(failTimer);
      startFallback();
    }
  }, true);

  loadScript(
    "assets/pc-fluid-webgl.js?v=universal-1",
    () => {
      setTimeout(() => {
        if (!window.PC_TOOLS_WEBGL_FLUID_READY) startFallback();
      }, 900);
    },
    () => {
      clearTimeout(failTimer);
      startFallback();
    }
  );
})();
