import React from 'react';

interface RadialLogoProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

export const RadialLogo: React.FC<RadialLogoProps> = ({
  size = 40,
  className = '',
  glow = false,
}) => {
  // Generate 24 radial lines around center (26, 26)
  // inner radius 10.4, outer radius 22.6, angles from -π/2
  const count = 24;
  const cx = 26;
  const cy = 26;
  const rInner = 10.4;
  const rOuter = 22.6;

  const rays = Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const x1 = (cx + rInner * Math.cos(angle)).toFixed(2);
    const y1 = (cy + rInner * Math.sin(angle)).toFixed(2);
    const x2 = (cx + rOuter * Math.cos(angle)).toFixed(2);
    const y2 = (cy + rOuter * Math.sin(angle)).toFixed(2);
    return { x1, y1, x2, y2, key: i };
  });

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-60 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, #ffd000 0%, #86ca8a 50%, #78d0cd 100%)',
          }}
        />
      )}
      <svg
        viewBox="0 0 52 52"
        className="w-full h-full relative z-10 block radial-logo-svg"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          {rays.map((ray) => (
            <line
              key={ray.key}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
            />
          ))}
        </g>
        <circle cx="26" cy="26" r="7.4" fill="currentColor" />
      </svg>
    </div>
  );
};
