import React, { useState, useEffect } from 'react';
import { Briefcase, AlertCircle, ChevronRight, Activity, Zap } from 'lucide-react';
import { jobMarketApi, JobMarketInsightResponse, JobRoleInsight } from '../services/jobMarketService';
import { CustomDropdown } from '../../../components/common/CustomDropdown';
import { FadeIn } from '../../../components/animations/FadeIn';

export const JobMarketInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JobMarketInsightResponse | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobRoleInsight | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchInsights = async () => {
      setLoading(true);
      const res = await jobMarketApi.getInsights(selectedBranch);
      if (mounted && res.success && res.data) {
        setData(res.data);
      }
      if (mounted) setLoading(false);
    };
    fetchInsights();
    return () => { mounted = false; };
  }, [selectedBranch]);

  if (!data && !loading) return null;

  const branchOptions = [
    { value: 'ALL', label: 'All Branches' },
    { value: 'cse', label: 'Computer Science (CSE)' },
    { value: 'it', label: 'Information Tech (IT)' },
    { value: 'ece', label: 'Electronics (ECE)' },
  ];

  return (
    <div className="bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-[#EAE3B3] bg-white">
        <h2 className="text-lg font-extrabold text-gray-900 font-heading flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-saffron" />
          Job Market & Placement Insights
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Understand demand, student readiness, and placement opportunities.
        </p>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        {/* Branch Selector */}
        <div className="flex items-center justify-between relative z-50">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Branch</span>
          <div className="w-48">
            <CustomDropdown
              options={branchOptions}
              value={selectedBranch}
              onChange={(val) => setSelectedBranch(val)}
              placeholder="Select Branch"
              className="w-full px-3 py-1.5 text-xs bg-[#FAFAF9]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-gray-400">
            <Activity className="w-6 h-6 animate-spin text-saffron" />
          </div>
        ) : (
          <FadeIn>
            <div className="space-y-6">
              {/* Snapshot */}
              {selectedBranch === 'ALL' && (
                <div className="bg-gradient-to-br from-[#000080]/5 to-saffron/5 border border-gray-200/60 rounded-xl p-4">
                  <h3 className="text-[11px] font-bold text-[#000080] uppercase tracking-wider mb-3">Job Market Snapshot</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500 font-medium">Students Analyzed</div>
                      <div className="font-bold text-gray-900 text-sm">{data?.totalStudentsAnalyzed}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium">High-Demand Roles</div>
                      <div className="font-bold text-gray-900 text-sm">{data?.totalHighDemandRoles}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium">Strongly Matched</div>
                      <div className="font-bold text-emerald-600 text-sm">{data?.overallStrongMatchPercent}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium">Needs Skill Dev</div>
                      <div className="font-bold text-amber-600 text-sm">{data?.overallNeedsDevPercent}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Branch Distribution */}
              {selectedBranch === 'ALL' && (
                <div>
                  <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-3">Student Distribution</h3>
                  <div className="space-y-3">
                    {data?.branches.map(b => (
                      <div key={b.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-gray-900">{b.name}</span>
                          <span className="font-semibold text-gray-600">{b.studentCount} Students</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#000080] rounded-full" 
                            style={{ width: `${Math.min(100, (b.studentCount / data.totalStudentsAnalyzed) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Jobs & Alignment */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Trending Roles & Alignment</h3>
                </div>
                
                <div className="space-y-4">
                  {data?.trendingJobs.map(job => {
                    const totalForJob = job.readiness.strongMatch + job.readiness.almostReady + job.readiness.needsDevelopment;
                    const strongPct = totalForJob > 0 ? Math.round((job.readiness.strongMatch / totalForJob) * 100) : 0;
                    const almostPct = totalForJob > 0 ? Math.round((job.readiness.almostReady / totalForJob) * 100) : 0;
                    const needsPct = totalForJob > 0 ? Math.round((job.readiness.needsDevelopment / totalForJob) * 100) : 0;

                    return (
                      <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs transition hover:shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-gray-900">{job.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            job.demandLevel === 'Critical Need' ? 'bg-amber-100 text-amber-800' :
                            job.demandLevel === 'High Demand' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-blue-100 text-[#000080]'
                          }`}>
                            {job.demandLevel === 'High Demand' ? '🔥 ' : ''}{job.demandLevel}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-gray-500 mb-3 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{job.activeOpenings} Active Opportunities</span>
                        </div>

                        <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Placement Potential</div>
                          
                          {/* Strong Match */}
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-semibold text-emerald-700">Strong Match</span>
                              <span className="font-bold text-gray-800">{strongPct}% ({job.readiness.strongMatch})</span>
                            </div>
                            <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${strongPct}%` }} />
                            </div>
                          </div>
                          
                          {/* Almost Ready */}
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-semibold text-amber-700">Almost Ready</span>
                              <span className="font-bold text-gray-800">{almostPct}% ({job.readiness.almostReady})</span>
                            </div>
                            <div className="w-full h-1.5 bg-amber-50 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${almostPct}%` }} />
                            </div>
                          </div>
                          
                          {/* Needs Development */}
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="font-semibold text-red-700">Needs Development</span>
                              <span className="font-bold text-gray-800">{needsPct}% ({job.readiness.needsDevelopment})</span>
                            </div>
                            <div className="w-full h-1.5 bg-red-50 rounded-full overflow-hidden">
                              <div className="h-full bg-red-400 rounded-full" style={{ width: `${needsPct}%` }} />
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setSelectedJobDetail(job)}
                          className="w-full mt-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-center gap-1 border border-gray-200"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable Insights */}
              <div className="bg-[#FAF9F6] border border-saffron/30 rounded-xl p-4">
                <h3 className="text-[11px] font-bold text-saffron-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {data?.recommendations.map((rec, i) => (
                    <li key={i} className="text-[11px] text-gray-700 leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-saffron shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* JOB DETAIL MODAL */}
      {selectedJobDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-gray-900/40 backdrop-blur-sm sm:p-4">
          <FadeIn className="h-full w-full sm:w-[450px] bg-[#FFFEF2] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#EAE3B3]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#EAE3B3] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedJobDetail.title}</h3>
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedJobDetail.demandLevel === 'Critical Need' ? 'bg-amber-100 text-amber-800' :
                  selectedJobDetail.demandLevel === 'High Demand' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-blue-100 text-[#000080]'
                }`}>
                  {selectedJobDetail.demandLevel}
                </span>
              </div>
              <button 
                onClick={() => setSelectedJobDetail(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* MARKET OVERVIEW */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Market Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-semibold">Active Opportunities</div>
                    <div className="text-lg font-bold text-gray-900">{selectedJobDetail.activeOpenings}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-[10px] text-gray-500 font-semibold">Relevant Branches</div>
                    <div className="text-sm font-bold text-gray-900">{selectedJobDetail.details?.relevantBranches.join(', ')}</div>
                  </div>
                </div>
              </div>

              {/* STUDENT ALIGNMENT */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Student Alignment</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="text-[11px] font-semibold text-gray-600 mb-2">
                    Students Analyzed: {selectedJobDetail.readiness.strongMatch + selectedJobDetail.readiness.almostReady + selectedJobDetail.readiness.needsDevelopment}
                  </div>
                  
                  {/* Strong Match */}
                  {(() => {
                    const total = selectedJobDetail.readiness.strongMatch + selectedJobDetail.readiness.almostReady + selectedJobDetail.readiness.needsDevelopment;
                    const pct = total > 0 ? Math.round((selectedJobDetail.readiness.strongMatch / total) * 100) : 0;
                    return (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-emerald-700">Strong Match</span>
                          <span className="font-bold text-gray-800">{pct}% ({selectedJobDetail.readiness.strongMatch})</span>
                        </div>
                        <div className="w-full h-2 bg-emerald-50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Almost Ready */}
                  {(() => {
                    const total = selectedJobDetail.readiness.strongMatch + selectedJobDetail.readiness.almostReady + selectedJobDetail.readiness.needsDevelopment;
                    const pct = total > 0 ? Math.round((selectedJobDetail.readiness.almostReady / total) * 100) : 0;
                    return (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-amber-700">Almost Ready</span>
                          <span className="font-bold text-gray-800">{pct}% ({selectedJobDetail.readiness.almostReady})</span>
                        </div>
                        <div className="w-full h-2 bg-amber-50 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {/* Needs Development */}
                  {(() => {
                    const total = selectedJobDetail.readiness.strongMatch + selectedJobDetail.readiness.almostReady + selectedJobDetail.readiness.needsDevelopment;
                    const pct = total > 0 ? Math.round((selectedJobDetail.readiness.needsDevelopment / total) * 100) : 0;
                    return (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold text-red-700">Needs Development</span>
                          <span className="font-bold text-gray-800">{pct}% ({selectedJobDetail.readiness.needsDevelopment})</span>
                        </div>
                        <div className="w-full h-2 bg-red-50 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* KEY SKILL REQUIREMENTS */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Key Skill Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJobDetail.details?.keySkills.map(skill => (
                    <span key={skill} className="bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* SKILL GAPS */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Skill Gaps</h4>
                <div className="space-y-3">
                  {selectedJobDetail.details?.skillGaps.map(gap => (
                    <div key={gap.name}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-semibold text-gray-700">{gap.name}</span>
                        <span className="font-bold text-gray-500">{gap.readinessPct}% readiness</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${gap.readinessPct < 50 ? 'bg-red-400' : 'bg-[#000080]'}`} style={{ width: `${gap.readinessPct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INSTITUTION INSIGHT */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Institution Insight</h4>
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-xs text-[#000080] font-medium leading-relaxed">
                  {selectedJobDetail.details?.institutionInsight}
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
};
