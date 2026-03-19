import React, { useRef, useEffect } from "react";

/**
 * CustomDesk.js
 * Soft Wooden Desk - animated procedural grain using canvas
 *
 * Usage:
 *  import CustomDesk from "./components/CustomDesk";
 *  <CustomDesk />  // put as a background element (absolute, pointerEvents: none)
 */

export default function CustomDesk({
  style = {},
  grainDensity = 28,   // number of grain strokes across height
  grainSpeed = 0.28,   // animation speed
  warmTint = "#f6e7d2", // base desk tint
}) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    let dpr = Math.max(1, window.devicePixelRatio || 1);

    function resize() {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // use CSS pixels for drawing
    }

    // initial resize
    resize();
    // debounce resize
    let rtid = null;
    const onResize = () => {
      if (rtid) cancelAnimationFrame(rtid);
      rtid = requestAnimationFrame(() => {
        resize();
        rtid = null;
      });
    };
    window.addEventListener("resize", onResize);

    // helper: draw subtle wood gradient base
    function drawBase(w, h) {
      // warm gradient
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, warmTint);
      g.addColorStop(0.5, "#fffaf5");
      g.addColorStop(1, "#f0e5d1");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // soft vignette edges
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w,h)*0.1, w * 0.5, h * 0.45, Math.max(w,h)*0.9);
      vg.addColorStop(0, "rgba(255,255,255,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.06)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
    }

    // precompute slightly different stroke widths / alphas for natural look
    function drawWoodGrain(w, h, t) {
      // seed pseudo-random set per frame for subtle variance
      const baseAmp = Math.min(18, h * 0.02);
      const freq = 0.0045 + (w / 2000) * 0.002;
      const grainCount = Math.max(12, Math.floor(grainDensity));
      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < grainCount; i++) {
        const y = (i / grainCount) * h;
        const amplitude = baseAmp * (0.4 + 0.7 * Math.sin(i * 0.7 + 1.2));
        const lineAlpha = 0.03 + 0.02 * Math.sin(i * 0.9 + t * 0.2);
        const thickness = 0.6 + (i % 3 === 0 ? 0.8 : 0) + Math.random() * 0.3;

        ctx.beginPath();
        // sample across x with steps to make a smooth wavy path
        const step = Math.max(28, Math.floor(w / 28));
        ctx.moveTo(0, y + Math.sin(0 * freq + i * 0.6 + t * grainSpeed) * amplitude);

        for (let x = step; x <= w + step; x += step) {
          const nx = Math.min(x, w);
          const offset = Math.sin(nx * freq + i * 0.6 + t * grainSpeed) * amplitude;
          // slightly taper offset with vertical position so edges less intense
          const edgeFade = 1 - Math.pow(Math.abs((y / h) - 0.5) * 1.8, 2);
          const cy = y + offset * edgeFade;
          ctx.lineTo(nx, cy);
        }

        ctx.lineWidth = thickness;
        // color slightly darker than base for grain lines
        ctx.strokeStyle = `rgba(60,40,25, ${lineAlpha})`;
        ctx.stroke();
      }

      // add very fine micro-noise as global overlay (grain dust)
      const noiseAlpha = 0.02;
      ctx.fillStyle = `rgba(20,10,6,${noiseAlpha})`;
      const count = Math.floor((w * h) / 12000);
      for (let i = 0; i < count; i++) {
        const rx = Math.random() * w;
        const ry = Math.random() * h;
        if (Math.random() > 0.995) {
          ctx.fillRect(rx, ry, 1, 1);
        }
      }
    }

    // optional: highlight sheen that slowly moves
    function drawSheen(w, h, t) {
      ctx.globalCompositeOperation = "overlay";
      const sheenGrad = ctx.createLinearGradient(-w * 0.1 + (t % (w * 0.8)), h * 0.1, w * 0.7 + (t % (w * 0.8)), h * 0.9);
      sheenGrad.addColorStop(0, "rgba(255,255,255,0)");
      sheenGrad.addColorStop(0.45, "rgba(255,255,255,0.02)");
      sheenGrad.addColorStop(0.55, "rgba(255,255,255,0.015)");
      sheenGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now) {
      // now in ms
      timeRef.current = now * 0.001;
      const t = timeRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // draw
      drawBase(w, h);
      drawWoodGrain(w, h, t * 0.7);
      drawSheen(w, h, t * 20);

      // subtle overlay (soft shadow under UI)
      ctx.fillStyle = "rgba(0,0,0,0.02)";
      ctx.fillRect(0, 0, w, h);

      // schedule next
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rtid) cancelAnimationFrame(rtid);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grainDensity, grainSpeed, warmTint]);

  // component root style ensures canvas covers parent area
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none", // make sure underlying UI is clickable
        display: "block",
        ...style,
      }}
    />
  );
}
