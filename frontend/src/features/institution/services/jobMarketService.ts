export interface BranchData {
  id: string;
  name: string;
  studentCount: number;
}

export interface JobRoleInsight {
  id: string;
  title: string;
  demandLevel: 'High Demand' | 'Critical Need' | 'Growing';
  activeOpenings: number;
  readiness: {
    strongMatch: number;
    almostReady: number;
    needsDevelopment: number;
  };
  details?: {
    relevantBranches: string[];
    keySkills: string[];
    skillGaps: { name: string; readinessPct: number }[];
    institutionInsight: string;
  };
}

export interface JobMarketInsightResponse {
  totalStudentsAnalyzed: number;
  totalHighDemandRoles: number;
  overallStrongMatchPercent: number;
  overallNeedsDevPercent: number;
  branches: BranchData[];
  trendingJobs: JobRoleInsight[];
  recommendations: string[];
}

// Mock adapter simulating a future API connection to Vidyut backend
export const jobMarketApi = {
  getInsights: async (branchId: string = 'ALL'): Promise<{ success: boolean; data?: JobMarketInsightResponse; error?: string }> => {
    try {
      // Simulate network latency
      await new Promise(res => setTimeout(res, 400));
      
      const branches: BranchData[] = [
        { id: 'cse', name: 'CSE', studentCount: 240 },
        { id: 'it', name: 'IT', studentCount: 120 },
        { id: 'ece', name: 'ECE', studentCount: 85 },
      ];
      
      const allStudents = branches.reduce((acc, b) => acc + b.studentCount, 0);
      const currentStudentCount = branchId === 'ALL' ? allStudents : (branches.find(b => b.id === branchId)?.studentCount || 0);

      const trendingJobs: JobRoleInsight[] = [];
      
      if (branchId === 'ALL' || branchId === 'cse' || branchId === 'it') {
        trendingJobs.push({
          id: 'se',
          title: 'Software Engineer',
          demandLevel: 'High Demand',
          activeOpenings: Math.floor(180 * (currentStudentCount / allStudents)) || 180,
          readiness: {
            strongMatch: Math.floor(currentStudentCount * 0.62),
            almostReady: Math.floor(currentStudentCount * 0.25),
            needsDevelopment: Math.floor(currentStudentCount * 0.13),
          },
          details: {
            relevantBranches: ['CSE', 'IT'],
            keySkills: ['Programming Fundamentals', 'Data Structures & Algorithms', 'SQL', 'Backend Development', 'Git / Version Control'],
            skillGaps: [
              { name: 'SQL', readinessPct: 85 },
              { name: 'System Design', readinessPct: 40 },
              { name: 'Cloud / Deployment', readinessPct: 35 }
            ],
            institutionInsight: "Software Engineering has strong demand and a majority of CSE students currently meet the recommended readiness benchmark. The largest development opportunity is in system design and deployment skills."
          }
        });
        trendingJobs.push({
          id: 'da',
          title: 'Data Analyst',
          demandLevel: 'High Demand',
          activeOpenings: Math.floor(120 * (currentStudentCount / allStudents)) || 120,
          readiness: {
            strongMatch: Math.floor(currentStudentCount * 0.40),
            almostReady: Math.floor(currentStudentCount * 0.40),
            needsDevelopment: Math.floor(currentStudentCount * 0.20),
          },
          details: {
            relevantBranches: ['CSE', 'IT', 'ECE'],
            keySkills: ['Data Visualization', 'SQL', 'Python / Pandas', 'Statistics', 'Business Intelligence'],
            skillGaps: [
              { name: 'Python / Pandas', readinessPct: 50 },
              { name: 'Data Visualization', readinessPct: 45 },
            ],
            institutionInsight: "Data Analysis has growing demand, but Python/SQL skill gaps are visible among a significant portion of students. Consider adding focused Python workshops."
          }
        });
        trendingJobs.push({
          id: 'ce',
          title: 'Cloud Engineer',
          demandLevel: 'Growing',
          activeOpenings: Math.floor(75 * (currentStudentCount / allStudents)) || 75,
          readiness: {
            strongMatch: Math.floor(currentStudentCount * 0.30),
            almostReady: Math.floor(currentStudentCount * 0.35),
            needsDevelopment: Math.floor(currentStudentCount * 0.35),
          },
          details: {
            relevantBranches: ['CSE', 'IT'],
            keySkills: ['AWS/Azure', 'Linux Administration', 'Docker & Containers', 'Networking Basics', 'Terraform'],
            skillGaps: [
              { name: 'Docker & Containers', readinessPct: 30 },
              { name: 'Terraform / IaC', readinessPct: 20 },
            ],
            institutionInsight: "Cloud Engineering is seeing strong demand, but only a small fraction of enrolled students currently meet the recommended skill benchmark. Core infrastructure training is highly advised."
          }
        });
      }

      if (branchId === 'ALL' || branchId === 'ece') {
        trendingJobs.push({
          id: 'es',
          title: 'Embedded Systems Engineer',
          demandLevel: 'Critical Need',
          activeOpenings: Math.floor(60 * (currentStudentCount / allStudents)) || 60,
          readiness: {
            strongMatch: Math.floor(currentStudentCount * 0.45),
            almostReady: Math.floor(currentStudentCount * 0.35),
            needsDevelopment: Math.floor(currentStudentCount * 0.20),
          },
          details: {
            relevantBranches: ['ECE', 'CSE'],
            keySkills: ['C / C++', 'Microcontrollers', 'RTOS', 'Hardware Debugging', 'IoT Protocols'],
            skillGaps: [
              { name: 'RTOS', readinessPct: 35 },
              { name: 'Hardware Debugging', readinessPct: 40 },
            ],
            institutionInsight: "Embedded Systems offers stable, critical roles. ECE students show decent foundational readiness, but hands-on RTOS and debugging experience remains a clear bottleneck."
          }
        });
      }

      const recommendations = [
        "Cloud Engineering is seeing strong demand, but only ~30% of enrolled students currently meet the recommended skill benchmark.",
        "Backend Development has high student readiness and strong market demand.",
        "Data Analysis has growing demand, but Python/SQL skill gaps are visible among a significant portion of students."
      ];

      return {
        success: true,
        data: {
          totalStudentsAnalyzed: allStudents,
          totalHighDemandRoles: 12,
          overallStrongMatchPercent: 58,
          overallNeedsDevPercent: 27,
          branches,
          trendingJobs,
          recommendations,
        }
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
