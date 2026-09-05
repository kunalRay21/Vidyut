import React from 'react';
import { SkillProgressCard, Skill } from './SkillProgressCard';


interface SkillStateListProps {
  skills: Skill[];
}

export const SkillStateList: React.FC<SkillStateListProps> = ({ skills }) => {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Skill Matrix</h3>
      {skills.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center text-sm text-gray-500 shadow-sm">
          No evaluated skills yet. Complete your diagnostic calibration to view your skill matrix.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {skills.map((skill) => (
            <SkillProgressCard key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
};
