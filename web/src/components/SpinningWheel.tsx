import { useEffect, useState } from 'react';
import type { WeightMap } from 'feature-sleuth';
import './SpinningWheel.css';

interface SpinningWheelProps {
  weights: WeightMap;
  isSpinning: boolean;
  selectedValue: string | null;
  onSpinComplete?: () => void;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#AAB7B8',
];

export function SpinningWheel({
  weights,
  isSpinning,
  selectedValue,
  onSpinComplete,
}: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const values = Object.keys(weights);
  const probabilities = Object.values(weights);

  // Calculate wheel segments
  const segments = values.map((value, index) => {
    const probability = probabilities[index];
    const startAngle = probabilities
      .slice(0, index)
      .reduce((sum, p) => sum + p * 360, 0);
    const endAngle = startAngle + probability * 360;
    const midAngle = (startAngle + endAngle) / 2;

    return {
      value,
      probability,
      startAngle,
      endAngle,
      midAngle,
      color: COLORS[index % COLORS.length],
    };
  });

  // Handle spinning
  useEffect(() => {
    if (isSpinning && selectedValue) {
      setIsAnimating(true);

      // Find the target segment
      const targetSegment = segments.find((s) => s.value === selectedValue);
      if (!targetSegment) return;

      // Calculate rotation to land on target
      // We want the pointer (at top, 0 degrees) to land on the segment
      // Add multiple rotations for effect + random variation
      const extraSpins = 5 + Math.random(); // 5-6 full rotations
      const targetAngle = 360 - targetSegment.midAngle; // Reverse because wheel rotates clockwise
      const finalRotation = 360 * extraSpins + targetAngle;

      setRotation(finalRotation);

      // Call onSpinComplete after animation
      setTimeout(() => {
        setIsAnimating(false);
        onSpinComplete?.();
      }, 2000);
    }
  }, [isSpinning, selectedValue]);

  return (
    <div className="spinning-wheel-container">
      <div className="wheel-pointer">▼</div>
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        className="spinning-wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isAnimating ? 'transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
        }}
      >
        {/* Center circle */}
        <circle cx="200" cy="200" r="200" fill="#f0f0f0" />

        {/* Segments */}
        {segments.map((segment, index) => {
          const { startAngle, endAngle, color } = segment;

          // Convert angles to radians
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          // Calculate path for segment
          const x1 = 200 + 200 * Math.cos(startRad - Math.PI / 2);
          const y1 = 200 + 200 * Math.sin(startRad - Math.PI / 2);
          const x2 = 200 + 200 * Math.cos(endRad - Math.PI / 2);
          const y2 = 200 + 200 * Math.sin(endRad - Math.PI / 2);

          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

          const pathData = [
            `M 200 200`,
            `L ${x1} ${y1}`,
            `A 200 200 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
          ].join(' ');

          // Calculate text position (middle of segment, 2/3 radius)
          const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;
          const textX = 200 + 130 * Math.cos(midRad - Math.PI / 2);
          const textY = 200 + 130 * Math.sin(midRad - Math.PI / 2);
          const textRotation = (startAngle + endAngle) / 2;

          return (
            <g key={index}>
              <path d={pathData} fill={color} stroke="#fff" strokeWidth="2" />
              <text
                x={textX}
                y={textY}
                fill="#fff"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
              >
                {segment.value}
              </text>
            </g>
          );
        })}

        {/* Center circle (decorative) */}
        <circle cx="200" cy="200" r="30" fill="#333" />
        <circle cx="200" cy="200" r="25" fill="#fff" />
        <circle cx="200" cy="200" r="10" fill="#333" />
      </svg>
    </div>
  );
}
