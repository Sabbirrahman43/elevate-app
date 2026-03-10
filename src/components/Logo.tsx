import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Background Shape */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="24"
          fill="url(#logo-gradient)"
          className="animate-pulse-slow"
        />
        
        {/* Stylized 'E' / Upward Arrow */}
        <path
          d="M35 70V30H65M35 50H55M35 70H65"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Accent Dot */}
        <circle cx="75" cy="25" r="6" fill="white" className="animate-bounce" />
      </svg>
    </div>
  );
};
