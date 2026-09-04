import React, { useState } from 'react';
import { X, UploadCloud, Link as LinkIcon } from 'lucide-react';

interface EvidenceSubmitModalProps {
  isOpen: boolean;
  milestoneId: string | null;
  onClose: () => void;
  onSubmit: (id: string, url: string, description: string) => void;
}

export const EvidenceSubmitModal: React.FC<EvidenceSubmitModalProps> = ({ isOpen, milestoneId, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');

  if (!isOpen || !milestoneId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(milestoneId, url, desc);
    setUrl('');
    setDesc('');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFEF2] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#EAE3B3]">
        <div className="flex justify-between items-center p-5 border-b border-[#EAE3B3]">
          <div>
            <h3 className="font-bold text-lg text-gray-900 font-heading">Submit Evidence</h3>
            <p className="text-xs text-gray-500">Provide proof of completion for verification</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">GitHub / Project URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                required
                className="pl-10 w-full border border-[#EAE3B3] rounded-xl py-2.5 px-3 focus:ring-1 focus:ring-saffron focus:border-saffron text-gray-900 text-sm bg-white"
                placeholder="https://github.com/your/project"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description (Optional)</label>
            <textarea
              className="w-full border border-[#EAE3B3] rounded-xl py-2.5 px-3 focus:ring-1 focus:ring-saffron focus:border-saffron text-gray-900 text-sm bg-white"
              rows={3}
              placeholder="Briefly describe what you implemented or key learning insights..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full btn-saffron py-2.5 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Submit for Verification
          </button>
        </form>
      </div>
    </div>
  );
};


