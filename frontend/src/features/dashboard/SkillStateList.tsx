import React from 'react';
import { CheckCircle2, CircleDashed, Circle } from 'lucide-react';

interface Skill {
  name: string;
  assessed_level: string;
  target_level: string;
  status: string;
}

interface SkillStateListProps {
  skills: Skill[];
}

export const SkillStateList: React.FC<SkillStateListProps> = ({ skills }) => {
  const completed = skills.filter(s => s.status === 'completed');
  const inProgress = skills.filter(s => s.status === 'in_progress');
  const notStarted = skills.filter(s => s.status === 'not_started');

  const renderSkillItem = (skill: Skill, icon: React.ReactNode) => (
    <div key={skill.name} className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded border border-gray-100">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-gray-800">{skill.name}</span>
      </div>
      <div className="text-sm text-gray-500">
        <span className="font-semibold text-gray-700">{skill.assessed_level}</span> / {skill.target_level}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Skill Matrix</h3>
      
      <div className="space-y-6">
        {completed.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wider">Completed</h4>
            {completed.map(skill => renderSkillItem(skill, <CheckCircle2 className="text-green-500 w-5 h-5" />))}
          </div>
        )}
        
        {inProgress.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wider">In Progress</h4>
            {inProgress.map(skill => renderSkillItem(skill, <CircleDashed className="text-blue-500 w-5 h-5" />))}
          </div>
        )}
        
        {notStarted.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Not Started</h4>
            {notStarted.map(skill => renderSkillItem(skill, <Circle className="text-gray-400 w-5 h-5" />))}
          </div>
        )}
      </div>
    </div>
  );
};
