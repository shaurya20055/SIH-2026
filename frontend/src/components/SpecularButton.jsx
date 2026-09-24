/**
 * SpecularButton — premium button with specular light effect that follows the mouse
 *
 * Props:
 *   size          string  — 'sm' | 'md' | 'lg' (default 'md')
 *   radius        number  — border radius (default 12)
 *   tint          string  — tint colour (default '#ffffff')
 *   tintOpacity   number  — tint fill opacity (default 0)
 *   blur          number  — backdrop blur (default 0)
 *   textColor     string  — text colour (default '#f5f5f5')
 *   lineColor     string  — border colour (default '#ffffff')
 *   baseColor     string  — background colour (default '#525252')
 *   intensity     number  — shine intensity (default 1)
 *   shineSize     number  — shine size in % (default 10)
 *   shineFade     number  — shine fade spread in % (default 40)
 *   thickness     number  — border thickness (default 1)
 *   speed         number  — animation speed factor (default 0.35)
 *   followMouse   boolean — follow mouse (default true)
 *   proximity     number  — activation proximity in px (default 250)
 *   autoAnimate   boolean — auto-animate shine (default false)
 *   onClick       func    — click handler
 *   children      node    — button content
 */

import { useRef, useEffect, useState, useCallback } from 'react';

const SIZES = {
  sm: { padding: '0.5rem 1.2rem', fontSize: '0.8rem' },
  md: { padding: '0.7rem 1.8rem', fontSize: '0.9rem' },
  lg: { padding: '0.85rem 2.2rem', fontSize: '1rem' },
};

export default function SpecularButton({
  size = 'md',
  radius = 12,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  onClick,
  children,
  className = '',
  style = {},
}) {
  const btnRef = useRef(null);
  const [shinePos, setShinePos] = useState({ x: 50, y: 50 });
  const [isNear, setIsNear] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const autoRef = useRef(0);

  useEffect(() => {
    if (!followMouse) return;
    const handler = (e) => {
      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < proximity) {
        setIsNear(true);
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setShinePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      } else {
        setIsNear(false);
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [followMouse, proximity]);

  useEffect(() => {
    if (!autoAnimate) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      autoRef.current += 0.02 * speed;
      const x = 50 + Math.sin(autoRef.current) * 40;
      const y = 50 + Math.cos(autoRef.current * 0.7) * 30;
      setShinePos({ x, y });
      setIsNear(true);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, [autoAnimate, speed]);

  const sizeStyle = SIZES[size] || SIZES.md;
  const shineOpacity = (isNear || autoAnimate) ? intensity * 0.8 : 0;

  const bgGradient = isNear || autoAnimate
    ? `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,${0.12 * intensity}) 0%, rgba(255,255,255,${0.03 * intensity}) ${shineSize}%, transparent ${shineSize + shineFade}%), ${baseColor}`
    : baseColor;

  const borderGradient = isNear || autoAnimate
    ? `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, ${lineColor} 0%, rgba(255,255,255,${0.15 * intensity}) ${shineSize + 10}%, rgba(255,255,255,0.06) 100%)`
    : `rgba(255,255,255,0.08)`;

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={className}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...sizeStyle,
        borderRadius: radius,
        border: 'none',
        background: bgGradient,
        color: textColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: `all ${speed}s ease, transform 0.15s ease`,
        transform: isHover ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHover
          ? `0 4px 20px rgba(255,255,255,0.08), inset 0 0 0 ${thickness}px ${isNear ? lineColor + '40' : 'rgba(255,255,255,0.1)'}`
          : `inset 0 0 0 ${thickness}px rgba(255,255,255,0.08)`,
        backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {/* Specular shine overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: `radial-gradient(circle at ${shinePos.x}% ${shinePos.y}%, rgba(255,255,255,${shineOpacity * 0.4}) 0%, transparent ${shineSize + shineFade * 0.6}%)`,
          pointerEvents: 'none',
          transition: `opacity ${speed}s ease`,
          opacity: isNear || autoAnimate ? 1 : 0,
        }}
      />
      {/* Border gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: -thickness,
          borderRadius: radius + thickness,
          background: borderGradient,
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: thickness,
          pointerEvents: 'none',
          transition: `opacity ${speed}s ease`,
          opacity: isNear || autoAnimate ? 1 : 0.3,
        }}
      />
      {/* Content */}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
}
