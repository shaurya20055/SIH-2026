/**
 * CursorGrid — interactive canvas grid that reacts to mouse movement
 * 
 * Props:
 *   cellSize      number   — size of each grid cell (default 70)
 *   color         string   — line/highlight colour (default '#D946EF')
 *   radius        number   — effect radius around cursor (default 140)
 *   falloff       string   — 'smooth' | 'linear' (default 'smooth')
 *   holdTime      number   — ms cells stay lit after cursor leaves (default 400)
 *   fadeDuration  number   — ms for fade out (default 800)
 *   lineWidth     number   — grid line width (default 1.2)
 *   maxOpacity    number   — max opacity of lit lines (default 1)
 *   fillOpacity   number   — fill opacity of lit cells (default 0)
 *   gridOpacity   number   — base grid opacity (default 0)
 *   cellRadius    number   — cell corner radius (default 0)
 *   clickPulse    boolean  — emit pulse on click (default false)
 *   pulseSpeed    number   — pulse expansion speed ms (default 600)
 */

import { useEffect, useRef, useCallback } from 'react';

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function CursorGrid({
  cellSize = 70,
  color = '#D946EF',
  radius = 140,
  falloff = 'smooth',
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = false,
  pulseSpeed = 600,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const cellsRef = useRef({});
  const pulsesRef = useRef([]);
  const animRef = useRef(null);

  const [r, g, b] = hexToRgb(color);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    let W, H;

    const resize = () => {
      W = container.clientWidth;
      H = container.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    };
    resize();

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    const onClick = (e) => {
      if (!clickPulse) return;
      const rect = canvas.getBoundingClientRect();
      pulsesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        startTime: performance.now(),
        maxRadius: Math.max(W, H) * 0.6,
      });
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('click', onClick);

    const ro = new ResizeObserver(() => {
      resize();
      ctx.scale(dpr, dpr);
    });
    ro.observe(container);

    const animate = (now) => {
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cols = Math.ceil(W / cellSize) + 1;
      const rows = Math.ceil(H / cellSize) + 1;

      // Update cell opacities
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * cellSize + cellSize / 2;
          const cy = row * cellSize + cellSize / 2;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const key = `${col}_${row}`;
          const cell = cellsRef.current[key] || { opacity: 0, lastActive: 0 };

          // Check pulse effect
          let pulseBoost = 0;
          for (const p of pulsesRef.current) {
            const elapsed = now - p.startTime;
            const pulseR = (elapsed / pulseSpeed) * p.maxRadius;
            const pDist = Math.abs(dist - pulseR);
            if (pDist < cellSize * 2) {
              const pFade = 1 - Math.min(1, elapsed / (pulseSpeed * 2));
              pulseBoost = Math.max(pulseBoost, (1 - pDist / (cellSize * 2)) * pFade);
            }
          }

          if (dist < radius) {
            let intensity;
            if (falloff === 'smooth') {
              const t = dist / radius;
              intensity = 1 - t * t; // quadratic falloff
            } else {
              intensity = 1 - dist / radius;
            }
            cell.opacity = Math.min(maxOpacity, intensity * maxOpacity + pulseBoost);
            cell.lastActive = now;
          } else {
            const elapsed = now - cell.lastActive;
            if (elapsed < holdTime) {
              // holding
            } else if (elapsed < holdTime + fadeDuration) {
              const fadeT = (elapsed - holdTime) / fadeDuration;
              cell.opacity = Math.max(0, cell.opacity * (1 - fadeT * 0.1));
            } else {
              cell.opacity = Math.max(0, cell.opacity - 0.02);
            }
            cell.opacity = Math.max(cell.opacity, pulseBoost * maxOpacity);
          }

          cellsRef.current[key] = cell;

          const x = col * cellSize;
          const y = row * cellSize;
          const op = Math.max(gridOpacity, cell.opacity);

          if (op > 0.005) {
            // Fill
            if (fillOpacity > 0 && cell.opacity > 0.01) {
              ctx.fillStyle = `rgba(${r},${g},${b},${cell.opacity * fillOpacity})`;
              if (cellRadius > 0) {
                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, cellRadius);
                ctx.fill();
              } else {
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
              }
            }

            // Stroke
            ctx.strokeStyle = `rgba(${r},${g},${b},${op * 0.6})`;
            ctx.lineWidth = lineWidth;
            if (cellRadius > 0) {
              ctx.beginPath();
              ctx.roundRect(x, y, cellSize, cellSize, cellRadius);
              ctx.stroke();
            } else {
              ctx.strokeRect(x, y, cellSize, cellSize);
            }
          }
        }
      }

      // Clean old pulses
      pulsesRef.current = pulsesRef.current.filter(p => now - p.startTime < pulseSpeed * 3);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('click', onClick);
      ro.disconnect();
    };
  }, [cellSize, color, radius, falloff, holdTime, fadeDuration, lineWidth, maxOpacity, fillOpacity, gridOpacity, cellRadius, clickPulse, pulseSpeed]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'auto', ...style }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
