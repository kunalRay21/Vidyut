import { useNavigate } from 'react-router-dom';
import { FadeIn } from '../../components/animations/FadeIn';

const careerDomains = [
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description:
      'Build intelligent systems using machine learning, deep learning and generative AI models.',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'GenAI'],
    demand: 'High Demand',
    icon: '🤖',
  },
  {
    id: 'software-development',
    title: 'Software Development',
    description:
      'Design and build scalable full-stack applications, robust APIs and modern backend systems.',
    technologies: ['Java', 'C++', 'Spring Boot', 'Node.js'],
    demand: 'High Demand',
    icon: '💻',
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description:
      'Turn structured and unstructured data into strategic insights using statistical modeling.',
    technologies: ['Python', 'SQL', 'Pandas', 'Power BI'],
    demand: 'High Demand',
    icon: '📊',
  },
  {
    id: 'cloud',
    title: 'Cloud Computing',
    description:
      'Architect, deploy and scale modern containerized cloud services on hyper-scaler platforms.',
    technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes'],
    demand: 'Growing',
    icon: '☁️',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description:
      'Protect applications, microservices, networks and sensitive data from modern security threats.',
    technologies: ['Network Security', 'Linux', 'Ethical Hacking', 'SIEM'],
    demand: 'High Demand',
    icon: '🔐',
  },
  {
    id: 'web-development',
    title: 'Web Development',
    description:
      'Create performant, responsive and accessible web applications using modern UI libraries.',
    technologies: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    demand: 'High Demand',
    icon: '🌐',
  },
];

export default function DiscoveryPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <FadeIn delay={100}>
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-saffron/10 text-saffron-600 text-xs font-bold uppercase tracking-wider mb-3 border border-saffron/30">
            Career Discovery
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-[#000080] leading-tight">
            Explore Your <span className="text-gradient-india">Career Domains</span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg mt-3 leading-relaxed">
            Discover high-demand technology sectors and explore the specific skills, frameworks, and prerequisites required for industry readiness.
          </p>
        </div>
      </FadeIn>

      {/* Career Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {careerDomains.map((domain, idx) => (
          <FadeIn key={domain.id} delay={150 + idx * 80}>
            <div className="group relative bg-[#FFFEF2] border border-[#EAE3B3] rounded-2xl p-6 hover:border-saffron hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-saffron to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE3B3] flex items-center justify-center text-2xl shadow-xs">
                    {domain.icon}
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                    {domain.demand}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#000080] transition-colors">
                  {domain.title}
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed mt-2 min-h-[60px]">
                  {domain.description}
                </p>

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
              </div>

              <button
                type="button"
                onClick={() => navigate('/assessment/self')}
                className="w-full mt-6 py-2.5 rounded-lg border border-saffron text-saffron hover:bg-saffron hover:text-white font-semibold transition flex items-center justify-center gap-1.5 text-sm"
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
