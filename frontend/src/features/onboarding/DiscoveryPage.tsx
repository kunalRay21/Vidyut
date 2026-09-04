import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';
import { careersApi } from '../../services/api';

interface DomainItem {
  id: string;
  name: string;
  description: string;
  demand_level: string;
  technologies?: string[];
  icon?: string;
}

const DEFAULT_DOMAINS: DomainItem[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Build intelligent systems using machine learning, deep learning and generative AI models.',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'GenAI'],
    demand_level: 'High Demand',
    icon: '🤖',
  },
  {
    id: 'software-development',
    name: 'Backend & Software Development',
    description: 'Design and build scalable full-stack applications, robust APIs and modern backend systems.',
    technologies: ['Python', 'FastAPI', 'Django', 'Docker', 'SQL'],
    demand_level: 'High Demand',
    icon: '💻',
  },
  {
    id: 'data-science',
    name: 'Data Science & Analytics',
    description: 'Turn structured and unstructured data into strategic insights using statistical modeling.',
    technologies: ['Python', 'SQL', 'Pandas', 'NumPy'],
    demand_level: 'High Demand',
    icon: '📊',
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps Engineering',
    description: 'Architect, deploy and scale modern containerized cloud services on hyper-scaler platforms.',
    technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'CI/CD'],
    demand_level: 'Growing',
    icon: '☁️',
  },
];

export default function DiscoveryPage() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<DomainItem[]>(DEFAULT_DOMAINS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDomains() {
      setLoading(true);
      try {
        const res = await careersApi.getDomains();
        if (mounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((d: any, idx: number) => ({
            id: d.id,
            name: d.name,
            description: d.description || 'Explore industry competencies and learning paths.',
            demand_level: d.demand_level || 'HIGH',
            technologies: d.top_technologies || DEFAULT_DOMAINS[idx % DEFAULT_DOMAINS.length]?.technologies || ['Python', 'SQL', 'Git'],
            icon: DEFAULT_DOMAINS[idx % DEFAULT_DOMAINS.length]?.icon || '⚡',
          }));
          setDomains(mapped);
        }
      } catch (err) {
        console.warn('Using default domains fallback:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDomains();
    return () => { mounted = false; };
  }, []);

  const handleAssessSkills = (domain: DomainItem) => {
    navigate('/assessment/self', { state: { selectedDomainId: domain.id, domainName: domain.name } });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <FadeIn delay={100}>
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-saffron/10 text-saffron-600 text-xs font-bold uppercase tracking-wider mb-3 border border-saffron/30">
            Career Discovery · Live Skill Graph
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-[#000080] leading-tight">
            Explore Your <span className="text-gradient-india">Career Domains</span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg mt-3 leading-relaxed">
            Discover high-demand technology sectors and explore the specific skills, frameworks, and prerequisites required for industry readiness.
          </p>
        </div>
      </FadeIn>

      {loading && (
        <div className="flex items-center justify-center py-6 text-sm text-gray-500">
          Syncing domains with Vidyut skill graph...
        </div>
      )}

      {/* Career Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {domains.map((domain, idx) => (
          <FadeIn key={domain.id || idx} delay={150 + idx * 80}>
            <div className="group relative bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 hover:border-saffron hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-saffron to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE3B3] flex items-center justify-center text-2xl shadow-xs">
                    {domain.icon}
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                    {domain.demand_level}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#000080] transition-colors">
                  {domain.name}
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed mt-2 min-h-[60px]">
                  {domain.description}
                </p>

                {domain.technologies && domain.technologies.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Top Technologies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {domain.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2.5 py-1 rounded-md bg-white text-gray-700 border border-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAssessSkills(domain)}
                className="w-full mt-6 py-2.5 rounded-lg border border-saffron text-saffron hover:bg-saffron hover:text-white font-semibold transition flex items-center justify-center gap-1.5 text-sm cursor-pointer"
              >
                <span>Assess Skills</span>
                <span>→</span>
              </button>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
