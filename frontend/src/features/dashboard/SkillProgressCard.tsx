import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export interface Skill {
  name: string;
  progress: number;
  currentLevel: number;
}

interface SkillProgressCardProps {
  skill: Skill;
}

const LEVELS = ['FOUNDATION', 'DEVELOPING', 'PROFICIENT', 'ADVANCED'];

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ skill }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [displayedProgress, setDisplayedProgress] = useState(skill.progress || 0);
  const [activeCheckpoints, setActiveCheckpoints] = useState<number>(skill.currentLevel || 1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Animate circular progress
    const duration = 2000;
    const steps = 120;
    const stepTime = duration / steps;
    const increment = skill.progress / steps;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= skill.progress) {
        setDisplayedProgress(skill.progress);
        clearInterval(progressInterval);
      } else {
        setDisplayedProgress(Math.floor(currentProgress));
      }
    }, stepTime);

    // Animate checkpoints sequentially
    let currentCheckpoint = 0;
    const checkpointInterval = setInterval(() => {
      currentCheckpoint++;
      if (currentCheckpoint > skill.currentLevel) {
        clearInterval(checkpointInterval);
      } else {
        setActiveCheckpoints(currentCheckpoint);
      }
    }, 600); // Slower delay between checkpoints

    return () => {
      clearInterval(progressInterval);
      clearInterval(checkpointInterval);
    };
  }, [isVisible, skill.progress, skill.currentLevel]);

  // SVG properties for circle
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayedProgress / 100) * circumference;

  let accentColor = '#000080'; // Ashoka Navy (Default/Active)
  if (skill.progress === 100) accentColor = '#138808'; // India Green (Completed)
  else if (skill.progress > 0) accentColor = '#FF9933'; // Saffron (In Progress)

  return (
    <div 
      ref={cardRef}
      className="group bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col w-full"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-6">{skill.name}</h3>

      <div className="flex flex-col md:flex-row items-center gap-12 w-full md:px-4">
        {/* Circular Progress */}
        <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105" style={{ width: size, height: size }}>
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={accentColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-100 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-gray-900">{displayedProgress}%</span>
          </div>
        </div>

        {/* Checkpoints */}
        <div className="flex-1 w-full max-w-[500px] flex justify-between relative mt-8 md:mt-0">
        {/* Connecting Lines Background */}
        <div className="absolute top-[14px] left-8 right-8 h-1 bg-slate-200 -z-10 rounded-full" />
        
        {/* Connecting Lines Foreground (Animated) */}
        <div className="absolute top-[14px] left-8 right-8 h-1 -z-10 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${(Math.max(0, activeCheckpoints - 1) / 3) * 100}%`,
              backgroundColor: accentColor
            }} 
          />
        </div>

        {LEVELS.map((level, index) => {
          const checkpointNum = index + 1;
          const isActivated = activeCheckpoints >= checkpointNum;
          const isCompleted = isActivated && checkpointNum < skill.currentLevel;
          const isCurrent = isActivated && checkpointNum === skill.currentLevel && skill.progress < 100;
          const isFullyCompleted = skill.progress === 100 && isActivated;

          let bgColor = '#F8FAFC'; 
          let borderColor = '#CBD5E1'; 
          let textColor = '#94A3B8';
          
          if (isCompleted || isFullyCompleted) {
            bgColor = accentColor;
            borderColor = accentColor;
            textColor = '#FFFFFF';
          } else if (isCurrent) {
            bgColor = '#FFFFFF';
            borderColor = accentColor;
            textColor = accentColor;
          }

          return (
            <div key={level} className="flex flex-col items-center relative z-10 w-16">
              <div 
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-white ${
                  isActivated ? 'scale-100 shadow-sm' : 'scale-95'
                }`}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
              >
                {(isCompleted || isFullyCompleted) ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold" style={{ color: textColor }}>{checkpointNum}</span>
                )}
              </div>
              <span 
                className={`text-[9px] font-bold mt-2 tracking-wider text-center transition-colors duration-300 ${
                  isActivated ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {level}
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
