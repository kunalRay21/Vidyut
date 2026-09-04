import React from 'react';
import { useNavigate } from 'react-router-dom';

const careerDomains = [
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description:
      'Build intelligent systems using machine learning, deep learning and generative AI.',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'GenAI'],
    demand: 'High Demand',
    icon: '🤖',
  },
  {
    id: 'software-development',
    title: 'Software Development',
    description:
      'Design and build scalable applications, APIs and software systems.',
    technologies: ['Java', 'C++', 'Spring Boot', 'Node.js'],
    demand: 'High Demand',
    icon: '💻',
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description:
      'Turn data into insights using statistics, analytics and machine learning.',
    technologies: ['Python', 'SQL', 'Pandas', 'Power BI'],
    demand: 'High Demand',
    icon: '📊',
  },
  {
    id: 'cloud',
    title: 'Cloud Computing',
    description:
      'Build, deploy and manage modern applications on cloud platforms.',
    technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes'],
    demand: 'Growing',
    icon: '☁️',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description:
      'Protect applications, networks and data from security threats.',
    technologies: ['Network Security', 'Linux', 'Ethical Hacking', 'SIEM'],
    demand: 'High Demand',
    icon: '🔐',
  },
  {
    id: 'web-development',
    title: 'Web Development',
    description:
      'Create modern, responsive and interactive web applications.',
    technologies: ['React', 'JavaScript', 'HTML', 'CSS'],
    demand: 'High Demand',
    icon: '🌐',
  },
];

export default function DiscoveryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A111F] text-white">

      {/* Header */}
      <header className="border-b border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">⚡</span>

            <span className="text-xl font-bold">
              VIDYUT
            </span>
          </button>

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate('/assessment/self')}
              className="px-5 py-2.5 rounded-lg bg-[#FF9933] hover:bg-[#e88722] font-semibold transition"
            >
              Start Assessment
            </button>

          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10">

        <div className="max-w-3xl">

          <p className="text-[#FF9933] font-semibold mb-3">
            CAREER DISCOVERY
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Explore Your
            <span className="text-[#FF9933]"> Career Domains</span>
          </h1>

          <p className="text-slate-400 text-lg mt-5 leading-relaxed">
            Explore high-demand technology domains and discover the
            skills and technologies required to build your career.
          </p>

        </div>
      </section>

      {/* Career Cards */}
      <main className="max-w-7xl mx-auto px-6 pb-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {careerDomains.map((domain) => (

            <div
              key={domain.id}
              className="group bg-[#111D32] border border-[#1F3152] rounded-2xl p-6 hover:border-[#FF9933] hover:-translate-y-1 transition-all duration-300"
            >

              {/* Icon + Demand */}
              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-xl bg-[#0A111F] flex items-center justify-center text-3xl">
                  {domain.icon}
                </div>

                <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {domain.demand}
                </span>

              </div>

              {/* Title */}
              <h2 className="text-xl font-bold mt-6">
                {domain.title}
              </h2>

              {/* Description */}
              <p className="text-slate-400 text-sm leading-relaxed mt-3 min-h-[72px]">
                {domain.description}
              </p>

              {/* Technologies */}
              <div className="mt-5">

                <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                  Top Technologies
                </p>

                <div className="flex flex-wrap gap-2">

                  {domain.technologies.map((technology) => (

                    <span
                      key={technology}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-[#0A111F] text-slate-300 border border-[#263A5A]"
                    >
                      {technology}
                    </span>

                  ))}

                </div>

              </div>

              {/* Button */}
              <button
                onClick={() => navigate('/assessment/self')}
                className="w-full mt-6 py-2.5 rounded-lg border border-[#FF9933] text-[#FF9933] hover:bg-[#FF9933] hover:text-white font-medium transition"
              >
                Explore Domain →
              </button>

            </div>

          ))}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F3152] bg-[#0D1728]">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative
        </div>
      </footer>

    </div>
  );
}