import React from 'react';

interface SunflowerIconProps {
  className?: string;
  size?: number;
}

export const SunflowerIcon: React.FC<SunflowerIconProps> = ({ className = "w-5 h-5", size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`inline-block ${className}`}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Golden Petals (12 petals rotated around center) */}
      <g className="sunflower-petals">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, index) => (
          <ellipse
            key={angle}
            cx="50"
            cy="20"
            rx="7"
            ry="18"
            fill={index % 2 === 0 ? "#F59E0B" : "#FBBF24"}
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
        {/* Inner Petal Layer */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="26"
            rx="5.5"
            ry="14"
            fill="#F59E0B"
            opacity="0.9"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>
      {/* Sunflower Seed Center */}
      <circle cx="50" cy="50" r="18" fill="#78350F" />
      <circle cx="50" cy="50" r="14" fill="#451A03" />
      {/* Seed texture details */}
      <circle cx="47" cy="47" r="2" fill="#92400E" opacity="0.8" />
      <circle cx="53" cy="52" r="1.8" fill="#92400E" opacity="0.8" />
      <circle cx="51" cy="45" r="1.5" fill="#B45309" opacity="0.8" />
      <circle cx="45" cy="53" r="1.5" fill="#B45309" opacity="0.8" />
    </svg>
  );
};
