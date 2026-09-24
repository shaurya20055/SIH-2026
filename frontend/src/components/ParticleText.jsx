/**
 * ParticleText — custom canvas-based particle text animation
 * API matches the react-bits Pro ParticleText component props.
 *
 * Props:
 *   text            string   — text to display
 *   particleSize    number   — radius of each particle (default 2)
 *   density         number   — gap between particles; lower = more particles (default 4)
 *   color           string   — base particle colour (default '#f8fafc')
 *   highlightColor  string   — accent/glow colour (default '#8b5cf6')
 *   scatter         number   — initial scatter radius in px (default 150)
 *   gatherDuration  number   — ms to gather particles on mount (default 1200)
 *   stagger         number   — ms stagger between waves (default 300)
 *   pointerRepel    number   — repel force strength (default 40)
 *   repelRadius     number   — radius around pointer to repel (default 100)
 *   idleDrift       number   — idle floating drift amount (default 0.5)
 *   trigger         string   — 'mount' | 'hover' (default 'mount')
 *   fontSize        string   — CSS font-size (default '6rem')
 *   fontWeight      number   — font weight (default 800)
 *   fontFamily      string   — font family (default 'Outfit, sans-serif')
 *   glow            boolean  — whether to apply glow filter (default false)
 *   className       string   — extra class on wrapper div
 *   style           object   — extra styles on wrapper div
 */

import { useEffect, useRef, useCallback } from 'react';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export default function ParticleText({
  text = 'Hello',
  particleSize = 2,
  density = 4,
  color = '#f8fafc',
  highlightColor = '#8b5cf6',
  scatter = 150,
  gatherDuration = 1200,
  stagger = 300,
  pointerRepel = 40,
  repelRadius = 100,
  idleDrift = 0.5,
  trigger = 'mount',
  fontSize = '6rem',
  fontWeight = 800,
  fontFamily = 'Outfit, sans-serif',
  textAlign = 'center',
  glow = false,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const gatheredRef = useRef(false);
  // Timestamp (performance.now()) marking when the current gather animation
  // actually started — NOT when the component mounted. Using a mount-time
  // baseline meant particles could "jump" partway into the animation by the
  // time fonts finished loading and the canvas was actually ready.
  const gatherStartRef = useRef(null);
  const containerRef = useRef(null);

  const [baseR, baseG, baseB] = hexToRgb(color);
  const [hlR, hlG, hlB] = hexToRgb(highlightColor);

  const sampleText = useCallback((canvas, ctx) => {
    // canvas.width/height are physical (device) pixels — already multiplied
    // by devicePixelRatio. The context also has ctx.scale(dpr, dpr) applied
    // (see initCanvas), so all *drawing* coordinates must be expressed in
    // CSS-pixel space, not device-pixel space, or everything gets scaled
    // twice and ends up drawn outside the visible canvas.
    const dpr = window.devicePixelRatio || 1;
    const pxW = canvas.width;   // device pixels — for getImageData only
    const pxH = canvas.height;
    const W = pxW / dpr;        // CSS pixels — for layout/measure/draw
    const H = pxH / dpr;

    // Determine font size in px
    let fsPx = 96;
    const parseSize = (str) => {
      let val = parseFloat(str) || 96;
      if (str.includes('rem')) val *= 16;
      else if (str.includes('vw')) val *= (window.innerWidth / 100);
      return val;
    };

    if (typeof fontSize === 'string') {
      if (fontSize.includes('clamp')) {
        const parts = fontSize.replace('clamp(', '').replace(')', '').split(',');
        if (parts.length >= 2) {
          fsPx = parseSize(parts[1]);
        } else {
          fsPx = parseSize(parts[0]);
        }
      } else {
        fsPx = parseSize(fontSize);
      }
    } else {
      fsPx = fontSize || 96;
    }

    // Scale font to fit canvas width (CSS-pixel space — measureText is not
    // affected by the current transform, so it's already in this space)
    ctx.font = `${fontWeight} ${fsPx}px ${fontFamily}`;
    let measured = ctx.measureText(text).width;
    while (measured > W * 0.9 && fsPx > 10) {
      fsPx -= 2;
      ctx.font = `${fontWeight} ${fsPx}px ${fontFamily}`;
      measured = ctx.measureText(text).width;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    let xPos = W / 2;
    if (textAlign === 'left') xPos = 0;
    else if (textAlign === 'right') xPos = W;

    ctx.fillText(text, xPos, H / 2);

    // getImageData always reads the raw device-pixel buffer, unaffected by
    // the current transform — so this must use the physical dimensions.
    const imgData = ctx.getImageData(0, 0, pxW, pxH);
    const pixels = [];
    const gap = Math.max(1, Math.round(density * dpr));

    for (let y = 0; y < pxH; y += gap) {
      for (let x = 0; x < pxW; x += gap) {
        const idx = (y * pxW + x) * 4;
        if (imgData.data[idx + 3] > 128) {
          // Convert sampled device-pixel coords back to CSS-pixel space so
          // they line up with everything else (mouse position, particle
          // drawing) which all live in CSS-pixel space.
          pixels.push({ x: x / dpr, y: y / dpr });
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    return pixels;
  }, [text, fontSize, fontWeight, fontFamily, density, textAlign]);

  const buildParticles = useCallback((canvas, ctx) => {
    const pixels = sampleText(canvas, ctx);

    return pixels.map((p, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = scatter * (0.5 + Math.random() * 0.5);
      const startX = trigger === 'hover' ? p.x : p.x + Math.cos(angle) * dist;
      const startY = trigger === 'hover' ? p.y : p.y + Math.sin(angle) * dist;
      // random highlight percentage
      const isHighlight = Math.random() < 0.18;
      const waveDelay = (i / pixels.length) * stagger;
      const drift = {
        ox: Math.random() * Math.PI * 2,
        oy: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6,
        amp: idleDrift * (0.5 + Math.random()),
      };
      return {
        tx: p.x, ty: p.y,        // target
        x: startX, y: startY,    // current
        vx: 0, vy: 0,            // velocity
        size: particleSize * (0.7 + Math.random() * 0.6),
        isHighlight,
        waveDelay,
        drift,
        gathered: false,
        opacity: trigger === 'hover' ? 0 : 1,
      };
    });
  }, [sampleText, scatter, stagger, particleSize, idleDrift, trigger]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const W = container.clientWidth || 800;
    const H = container.clientHeight || 200;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    particlesRef.current = buildParticles(canvas, ctx);
    gatheredRef.current = false;
    gatherStartRef.current = null;

    // Trigger gather on mount
    if (trigger === 'mount') {
      setTimeout(() => {
        gatheredRef.current = true;
        gatherStartRef.current = performance.now();
      }, 60);
    }
  }, [buildParticles, trigger]);

  useEffect(() => {
    let isMounted = true;
    document.fonts.ready.then(() => {
      if (!isMounted) return;
      initCanvas();
    });

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    // Mouse move tracking (relative to canvas, in CSS-pixel space)
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left),
        y: (e.clientY - rect.top),
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    const onHoverEnter = () => {
      gatheredRef.current = true;
      gatherStartRef.current = performance.now();
    };
    const onHoverLeave = () => {
      gatheredRef.current = false;
      gatherStartRef.current = null;
      onMouseLeave();
    };

    if (trigger === 'hover') {
      container.addEventListener('mouseenter', onHoverEnter);
      container.addEventListener('mouseleave', onHoverLeave);
    } else {
      container.addEventListener('mouseleave', onMouseLeave);
    }
    window.addEventListener('mousemove', onMouseMove);

    const animate = (now) => {
      // Read the canvas's *current* size every frame — it's set
      // asynchronously by initCanvas (after fonts load), so capturing it
      // once up front would clear the wrong (stale/default) area.
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const elapsedSinceGather = gatherStartRef.current !== null
        ? now - gatherStartRef.current
        : 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const readyToGather = gatheredRef.current
          && gatherStartRef.current !== null
          && elapsedSinceGather > p.waveDelay;

        if (readyToGather) {
          // Spring toward target
          const t = Math.min(1, (elapsedSinceGather - p.waveDelay) / gatherDuration);
          const ease = 1 - Math.pow(1 - t, 4);

          // Drift when near target
          const driftX = Math.sin(now * 0.001 * p.drift.speed + p.drift.ox) * p.drift.amp;
          const driftY = Math.cos(now * 0.001 * p.drift.speed + p.drift.oy) * p.drift.amp;

          // Spring force
          const dx = (p.tx + driftX) - p.x;
          const dy = (p.ty + driftY) - p.y;
          p.vx += dx * 0.12;
          p.vy += dy * 0.12;

          // Pointer repel
          const rdx = p.x - mx;
          const rdy = p.y - my;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          if (rdist < repelRadius && rdist > 0) {
            const force = (repelRadius - rdist) / repelRadius * pointerRepel;
            p.vx += (rdx / rdist) * force;
            p.vy += (rdy / rdist) * force;
          }

          p.vx *= 0.78;
          p.vy *= 0.78;
          p.x += p.vx;
          p.y += p.vy;

          if (trigger === 'hover') {
            p.opacity = Math.min(1, p.opacity + 0.06);
          } else {
            p.opacity = Math.min(1, 0.3 + ease * 0.7);
          }
        } else {
          // Scatter drift while waiting
          if (!readyToGather && trigger === 'mount') {
            p.x += Math.sin(now * 0.001 + i) * 0.3;
            p.y += Math.cos(now * 0.001 + i) * 0.3;
          }
        }

        // Draw particle
        const r = p.isHighlight ? hlR : baseR;
        const g = p.isHighlight ? hlG : baseG;
        const b = p.isHighlight ? hlB : baseB;
        const alpha = (p.opacity ?? 1).toFixed(3);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (glow && p.isHighlight) {
          ctx.shadowColor = highlightColor;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Resize observer — rebuild particles for the new size, but never touch
    // the animation loop. ResizeObserver always fires once immediately after
    // observe() starts (even with no real resize), so cancelling the rAF
    // loop here — with nothing to ever restart it — killed the animation
    // almost immediately after mount. The loop already reads
    // particlesRef.current fresh every frame, so it picks up the rebuilt
    // particles on its own without needing to be stopped.
    const ro = new ResizeObserver(() => {
      initCanvas();
    });
    ro.observe(container);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      if (trigger === 'hover') {
        container.removeEventListener('mouseenter', onHoverEnter);
        container.removeEventListener('mouseleave', onHoverLeave);
      } else {
        container.removeEventListener('mouseleave', onMouseLeave);
      }
      ro.disconnect();
    };
  }, [initCanvas, gatherDuration, repelRadius, pointerRepel, glow, highlightColor, color, trigger]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}