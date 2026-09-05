import React from 'react';
import { useTranslation } from 'react-i18next';

interface ReadinessGaugeProps {
  percentage: number;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ percentage }) => {
  const { t } = useTranslation();
  // Clamp percentage between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  // Map percentage to a liquid top Y coordinate (0 = bottom, 100 = top)
  // Our circle is bounded from Y=5 to Y=95 (radius 45 around center 50)
  // So at 0%, liquid is at Y=95, at 100%, liquid is at Y=5.
  const liquidTop = 95 - (validPercentage * 0.9);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading">{t('dashboard.readinessTitle', 'Role Readiness')}</h3>
      
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Liquid Gauge */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <clipPath id="bubble-clip">
              <circle cx="50" cy="50" r="45" />
            </clipPath>
            
            {/* Saffron gradient for subtle top highlight */}
            <linearGradient id="saffron-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#FF9933" stopOpacity="0" />
            </linearGradient>

            {/* Reusable wave path that repeats every 100 units */}
            <path 
              id="wave-path" 
              d="M 0,0 Q 25,-8 50,0 T 100,0 T 150,0 T 200,0 L 200,120 L 0,120 Z" 
            />
          </defs>

          {/* Unfilled area - consistent with background */}
          <circle cx="50" cy="50" r="45" fill="#FFFFFF" />

          {/* Liquid layers */}
          <g clipPath="url(#bubble-clip)">
            {/* Back wave (lighter green, moving right to left) */}
            <g transform={`translate(0, ${liquidTop})`}>
              <g fill="#138808" opacity="0.4">
                <animateTransform 
                  attributeName="transform" 
                  type="translate" 
                  from="0,0" 
                  to="-100,0" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
                <use href="#wave-path" />
              </g>
            </g>

            {/* Front wave (India green, moving left to right) */}
            <g transform={`translate(0, ${liquidTop})`}>
              <g fill="#138808" opacity="0.85">
                <animateTransform 
                  attributeName="transform" 
                  type="translate" 
                  from="-100,0" 
                  to="0,0" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
                <use href="#wave-path" />
              </g>
            </g>
          </g>

          {/* Outer ring with very subtle saffron highlight at the top */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="url(#saffron-highlight)" 
            strokeWidth="3" 
          />
          
          {/* Subtle inner border to define the bubble better */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="#138808" 
            strokeOpacity="0.2"
            strokeWidth="1" 
          />
        </svg>

        {/* Overlay Text - Dark navy percentage text */}
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ textShadow: "0px 1px 3px rgba(255,255,255,0.8)" }}>
          <span className="text-3xl font-bold text-[#1E1B4B]">{validPercentage}%</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-4 text-center font-medium">{t('dashboard.skillsAcquired', 'of target skills acquired')}</p>
    </div>
  );
};
