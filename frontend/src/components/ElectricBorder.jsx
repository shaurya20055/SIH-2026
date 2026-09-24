import React, { useEffect, useRef } from 'react';

const ElectricBorder = ({
  children,
  color = '#7df9ff',
  speed = 1,
  chaos = 0.12,
  thickness = 2,
  style = {},
  className = ''
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animId;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();

    let time = 0;

    const getPos = (d, w, h, p) => {
      d = d % p;
      if (d < 0) d += p;
      if (d <= w) return { x: d, y: 0 };
      if (d <= w + h) return { x: w, y: d - w };
      if (d <= 2 * w + h) return { x: w - (d - (w + h)), y: h };
      return { x: 0, y: h - (d - (2 * w + h)) };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += speed * 2.5;

      const p = 2 * width + 2 * height;
      if (p === 0) {
        animId = requestAnimationFrame(animate);
        return;
      }

      // Draw faint base electricity
      ctx.beginPath();
      const numPoints = 100;
      for (let i = 0; i <= numPoints; i++) {
        const dist = (i / numPoints) * p;
        const pos = getPos(dist, width, height, p);

        const noise = (Math.random() - 0.5) * chaos * 30;
        let dx = 0, dy = 0;

        if (dist <= width || (dist > width + height && dist <= 2 * width + height)) {
          dy = noise;
        } else {
          dx = noise;
        }

        if (i === 0) ctx.moveTo(pos.x + dx, pos.y + dy);
        else ctx.lineTo(pos.x + dx, pos.y + dy);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = thickness * 0.5;
      ctx.globalAlpha = 0.4;
      ctx.stroke();

      // Draw bright active beam
      ctx.beginPath();
      const beamLength = p * 0.25;
      const beamStart = time % p;
      const segments = 25;

      for (let i = 0; i <= segments; i++) {
        const dist = beamStart + (i / segments) * beamLength;
        const pos = getPos(dist, width, height, p);
        
        const noise = (Math.random() - 0.5) * chaos * 60;
        let dx = 0, dy = 0;

        const modDist = dist % p;
        if (modDist <= width || (modDist > width + height && modDist <= 2 * width + height)) {
          dy = noise;
        } else {
          dx = noise;
        }

        if (i === 0) ctx.moveTo(pos.x + dx, pos.y + dy);
        else ctx.lineTo(pos.x + dx, pos.y + dy);
      }

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = thickness;
      ctx.globalAlpha = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [color, speed, chaos, thickness]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: thickness + 2 + 'px',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: style.borderRadius }}>
        {children}
      </div>
    </div>
  );
};

export default ElectricBorder;
