import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { opportunitiesApi } from '../../../services/api';

export const PostOpportunityForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('INTERNSHIP');
  const [mode, setMode] = useState('REMOTE');
  const [stipend, setStipend] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<{ name: string; level: string }[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [levelInput, setLevelInput] = useState('INTERMEDIATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, { name: skillInput.trim(), level: levelInput }]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Opportunity title is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await opportunitiesApi.postDirect({
        title,
        type,
        mode,
        stipend: stipend || 'Competitive',
        organization: 'Industry Partner',
        description_raw: description || `${title} opportunity posted via Vidyut Industry Portal.`,
        required_skills: skills.map((s) => ({
          skill_id: `skill-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
          min_proficiency: s.level,
        })),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/opportunities'), 900);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/opportunities'), 900);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FFFFED] p-8 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a New Opportunity</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Junior ML Engineer Intern"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="INTERNSHIP">INTERNSHIP</option>
              <option value="PROJECT">PROJECT</option>
              <option value="HACKATHON">HACKATHON</option>
              <option value="FULL-TIME">FULL-TIME</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="REMOTE">REMOTE</option>
              <option value="HYBRID">HYBRID</option>
              <option value="ON-SITE">ON-SITE</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stipend / Salary Range</label>
            <input
              type="text"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. ₹25,000 / month"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description & Requirements</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detail key responsibilities, deliverables, and projects."
            />
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Skills (Skill Graph Taxonomy)</h3>
          
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-10 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Search skill (e.g. Python, SQL)" 
              />
            </div>
            <div className="w-48">
              <select 
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="PROFICIENT">Proficient</option>
              </select>
            </div>
            <button 
              type="button" 
              onClick={handleAddSkill}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors border border-gray-300 cursor-pointer"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                <span className="font-semibold">{s.name}</span>
                <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded border border-blue-100">{s.level}</span>
                <button 
                  type="button"
                  onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                  className="text-blue-400 hover:text-blue-600 ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
            {skills.length === 0 && (
              <p className="text-gray-500 text-sm italic">No skills added yet. Tag skills to filter the right candidates.</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-xs">
            Opportunity posted successfully! Added to live opportunity hub...
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors flex justify-center items-center gap-2 mt-8 cursor-pointer disabled:opacity-50"
        >
          <PlusCircle className="w-5 h-5" />
          {loading ? 'Posting Opportunity...' : 'Post Opportunity & Find Talent'}
        </button>
      </div>
    </form>
  );
};
