import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DiscrepancyNotice: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Calibration Discrepancy Alert</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Your self-assessed skill level for <strong>Python</strong> is higher than your recent assessment results. 
              We recommend completing the advanced Python assessment to calibrate your true skill level and unlock better opportunities.
            </p>
          </div>
          <div className="mt-4">
            <button className="bg-amber-100 text-amber-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors">
              Take Calibration Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
