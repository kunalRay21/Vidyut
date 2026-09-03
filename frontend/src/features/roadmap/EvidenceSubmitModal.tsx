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
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800">Submit Evidence</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub / Project URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="url"
                required
                className="pl-10 w-full border border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="https://github.com/your/project"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows={3}
              placeholder="Briefly describe what you implemented..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            <UploadCloud className="w-5 h-5" />
            Submit for Verification
          </button>
        </form>
      </div>
    </div>
  );
};
