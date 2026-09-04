import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DiscrepancyNoticeProps {
  message?: string;
  skillName?: string;
}

export const DiscrepancyNotice: React.FC<DiscrepancyNoticeProps> = ({
  message,
  skillName = 'Python',
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FFF9EB] border border-amber-300/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-amber-900 font-heading">Calibration Discrepancy Alert</h3>
            <span className="gov-badge text-[10px] py-0.5 px-2">Diagnostic Sync</span>
          </div>
          <p className="mt-2 text-sm text-amber-900/80 leading-relaxed">
            {message || (
              <>
                Your self-assessed skill level for <strong className="text-amber-950 font-semibold">{skillName}</strong> differs from your recent diagnostic evaluation. 
                Key prerequisite modules are prioritized in your adaptive roadmap to solidify your fundamentals.
              </>
            )}
          </p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/roadmap')}
              className="btn-saffron text-xs py-2 px-4 shadow-sm rounded-xl font-semibold cursor-pointer"
            >
              View Prioritized Roadmap Modules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
