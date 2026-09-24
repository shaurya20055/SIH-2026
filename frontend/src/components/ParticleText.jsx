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
  const containerRef = useRef(null);

  const [baseR, baseG, baseB] = hexToRgb(color);
  const [hlR, hlG, hlB] = hexToRgb(highlightColor);

  const sampleText = useCallback((canvas, ctx) => {
    const W = canvas.width;
    const H = canvas.height;

    // Determine font size in px
    let fsPx = 96;
    if (typeof fontSize === 'string') {
      if (fontSize.includes('clamp')) {
        // evaluate clamp roughly: pick middle value
        const parts = fontSize.replace('clamp(', '').replace(')', '').split(',');
        if (parts.length >= 2) {
          const mid = parts[1].trim();
          const parsed = parseFloat(mid);
          if (!isNaN(parsed)) fsPx = parsed;
          else fsPx = parseFloat(parts[0]) || 96;
        }
      } else {
        fsPx = parseFloat(fontSize) || 96;
      }
    } else {
      fsPx = fontSize || 96;
    }

    // Scale font to fit canvas width
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

    const imgData = ctx.getImageData(0, 0, W, H);
    const pixels = [];
    const gap = Math.max(1, Math.round(density));

    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        const idx = (y * W + x) * 4;
        if (imgData.data[idx + 3] > 128) {
          pixels.push({ x, y });
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    return pixels;
  }, [text, fontSize, fontWeight, fontFamily, density]);

  const buildParticles = useCallback((canvas, ctx) => {
    const pixels = sampleText(canvas, ctx);
    const W = canvas.width;
    const H = canvas.height;

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

    // Trigger gather on mount
    if (trigger === 'mount') {
      setTimeout(() => {
        gatheredRef.current = true;
      }, 60);
    }
  }, [buildParticles, trigger]);

  useEffect(() => {
    initCanvas();

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const ctx = canvas.getContext('2d');
    const startTime = performance.now();

    // Mouse move tracking (relative to canvas)
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mouseRef.current = {
        x: (e.clientX - rect.left),
        y: (e.clientY - rect.top),
      };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    if (trigger === 'hover') {
      container.addEventListener('mouseenter', () => { gatheredRef.current = true; });
      container.addEventListener('mouseleave', () => { gatheredRef.current = false; onMouseLeave(); });
    }
    window.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    const animate = (now) => {
      ctx.clearRect(0, 0, W, H);
      const elapsed = now - startTime;
      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const readyToGather = gatheredRef.current && elapsed > p.waveDelay;

        if (readyToGather) {
          // Spring toward target
          const t = Math.min(1, (elapsed - p.waveDelay) / gatherDuration);
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

    // Resize observer
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(animFrameRef.current);
      initCanvas();
      // restart anim after re-init by re-running useEffect cleanup/setup would be complex;
      // simpler: just reinit particles, the RAF loop above will re-read them
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      ro.disconnect();
    };
  }, [initCanvas, gatherDuration, repelRadius, pointerRepel, glow, highlightColor, trigger]);

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
