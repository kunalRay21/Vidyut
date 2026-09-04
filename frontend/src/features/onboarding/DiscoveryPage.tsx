import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  BrainCircuit,
  Server,
  BarChart3,
  Cloud,
  Layers,
  ShieldCheck,
  Code,
  ArrowRight,
  GitBranch,
  Clock,
  Briefcase,
  Sparkles,
  Filter,
} from 'lucide-react';
import { FadeIn } from '../../components/animations/FadeIn';
import { careersApi } from '../../services/api';

export interface DAGNode {
  id: string;
  name: string;
  level: 'Foundational' | 'Core Engineering' | 'Production & Scale';
  description: string;
  category: string;
}

export interface DomainItem {
  id: string;
  roleId: string;
  name: string;
  category: string;
  description: string;
  demand_level: 'High Demand' | 'Growing' | 'Critical Need';
  duration: string;
  openRolesCount: string;
  technologies: string[];
  prerequisites: string;
  iconType: 'ai' | 'backend' | 'data' | 'cloud' | 'fullstack' | 'security';
  dagNodes: DAGNode[];
}

const DEFAULT_DOMAINS: DomainItem[] = [
  {
    id: 'domain-ml',
    roleId: 'role-ml',
    name: 'Artificial Intelligence & Machine Learning',
    category: 'Artificial Intelligence',
    description: 'Design, evaluate and operationalize predictive machine learning models, deep learning architectures, and generative AI pipelines.',
    demand_level: 'High Demand',
    duration: '14 Weeks · 9 Milestones',
    openRolesCount: '120+ Active Openings',
    technologies: ['Python', 'PyTorch', 'Scikit-Learn', 'NumPy & Pandas', 'Linear Algebra', 'GenAI'],
    prerequisites: 'Calculus, Linear Algebra, Python Foundations',
    iconType: 'ai',
    dagNodes: [
      { id: 'ml-f1', name: 'Python for Scientific Computing', level: 'Foundational', category: 'PROGRAMMING', description: 'Syntax, vectorization, object-oriented paradigms and virtual environments.' },
      { id: 'ml-f2', name: 'Linear Algebra & Matrix Operations', level: 'Foundational', category: 'MATHEMATICS', description: 'Eigenvalues, vector spaces, dot products, and gradient calculus.' },
      { id: 'ml-f3', name: 'Git & Model Versioning', level: 'Foundational', category: 'TOOLS', description: 'Version control, reproducible notebooks, and collaboration workflows.' },
      { id: 'ml-c1', name: 'Data Wrangling with Pandas & NumPy', level: 'Core Engineering', category: 'DATA', description: 'Data ingestion, exploratory data analysis, imputation, and outlier detection.' },
      { id: 'ml-c2', name: 'Supervised & Unsupervised Learning', level: 'Core Engineering', category: 'ALGORITHMS', description: 'Regression, classification, decision trees, clustering, and cross-validation.' },
      { id: 'ml-c3', name: 'Deep Learning with PyTorch', level: 'Core Engineering', category: 'DEEP_LEARNING', description: 'Tensors, autograd, backpropagation, and multi-layer neural network training.' },
      { id: 'ml-p1', name: 'Model Evaluation & Calibration', level: 'Production & Scale', category: 'EVALUATION', description: 'Confusion matrices, ROC-AUC, bias-variance trade-off, and metric tracking.' },
      { id: 'ml-p2', name: 'Model Serving & API Deployment', level: 'Production & Scale', category: 'DEPLOYMENT', description: 'Packaging models with FastAPI, ONNX runtime, and containerized inferences.' },
    ],
  },
  {
    id: 'domain-backend',
    roleId: 'role-backend',
    name: 'Backend & Distributed Systems',
    category: 'Backend & APIs',
    description: 'Architect resilient server-side microservices, high-throughput relational databases, robust REST/gRPC APIs, and scalable infrastructure.',
    demand_level: 'High Demand',
    duration: '12 Weeks · 8 Milestones',
    openRolesCount: '185+ Active Openings',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'REST APIs'],
    prerequisites: 'Programming Fundamentals, Basic Data Structures',
    iconType: 'backend',
    dagNodes: [
      { id: 'be-f1', name: 'Programming Fundamentals & OOP', level: 'Foundational', category: 'PROGRAMMING', description: 'Data types, memory model, object-oriented principles, and error handling.' },
      { id: 'be-f2', name: 'HTTP Protocols & REST Standards', level: 'Foundational', category: 'NETWORKING', description: 'Status codes, headers, methods, idempotency, and stateless communication.' },
      { id: 'be-f3', name: 'Git & Collaborative Workflow', level: 'Foundational', category: 'TOOLS', description: 'Branching strategies, pull requests, merge conflict resolution, and CI hooks.' },
      { id: 'be-c1', name: 'Relational Database Schema & SQL', level: 'Core Engineering', category: 'DATABASE', description: 'Complex JOINs, indexing, normalization, ACID transactions, and query plans.' },
      { id: 'be-c2', name: 'RESTful API Engineering (FastAPI)', level: 'Core Engineering', category: 'FRAMEWORKS', description: 'Dependency injection, request validation with Pydantic, and async route handling.' },
      { id: 'be-c3', name: 'Authentication & Session Security', level: 'Core Engineering', category: 'SECURITY', description: 'JWT signing, password hashing with bcrypt, role-based access control (RBAC).' },
      { id: 'be-p1', name: 'Docker Containerization & Multi-Stage', level: 'Production & Scale', category: 'DEVOPS', description: 'Dockerfile optimization, container networking, and local multi-service composition.' },
      { id: 'be-p2', name: 'Distributed Caching & Redis Pipelines', level: 'Production & Scale', category: 'PERFORMANCE', description: 'In-memory caching strategies, eviction policies, and rate-limiting middleware.' },
    ],
  },
  {
    id: 'domain-data',
    roleId: 'role-ml',
    name: 'Data Science & Big Data Engineering',
    category: 'Data Science',
    description: 'Extract transformative business intelligence, orchestrate reliable ETL data pipelines, and architect high-capacity data lakes and warehouses.',
    demand_level: 'High Demand',
    duration: '11 Weeks · 7 Milestones',
    openRolesCount: '95+ Active Openings',
    technologies: ['Python', 'Advanced SQL', 'Pandas', 'Apache Spark', 'Data Warehousing', 'Kafka'],
    prerequisites: 'Descriptive Statistics, Relational SQL, Python',
    iconType: 'data',
    dagNodes: [
      { id: 'ds-f1', name: 'Probability & Descriptive Statistics', level: 'Foundational', category: 'STATISTICS', description: 'Distributions, hypothesis testing, confidence intervals, and variance.' },
      { id: 'ds-f2', name: 'Advanced SQL & Window Functions', level: 'Foundational', category: 'DATABASE', description: 'PARTITION BY, RANK, CTEs, self-joins, and query performance tuning.' },
      { id: 'ds-c1', name: 'Automated ETL Pipeline Engineering', level: 'Core Engineering', category: 'DATA_PIPELINES', description: 'Data extraction, schema validation, transformation logic, and automated scheduling.' },
      { id: 'ds-c2', name: 'Data Visualization & Storytelling', level: 'Core Engineering', category: 'ANALYTICS', description: 'Constructing interactive dashboards, KPI monitoring, and stakeholder presentation.' },
      { id: 'ds-p1', name: 'Distributed Processing with PySpark', level: 'Production & Scale', category: 'BIG_DATA', description: 'RDDs, DataFrames, cluster execution, and large-scale parallel computations.' },
      { id: 'ds-p2', name: 'Real-Time Event Streaming (Kafka)', level: 'Production & Scale', category: 'STREAMING', description: 'Pub/sub streaming architecture, consumer groups, and stream processing.' },
    ],
  },
  {
    id: 'domain-cloud',
    roleId: 'role-backend',
    name: 'Cloud Native & DevOps Engineering',
    category: 'Cloud & DevOps',
    description: 'Deploy resilient containerized workloads, configure automated CI/CD deployment pipelines, and maintain hyper-scaler cloud infrastructure.',
    demand_level: 'Critical Need',
    duration: '10 Weeks · 7 Milestones',
    openRolesCount: '140+ Active Openings',
    technologies: ['Docker', 'Kubernetes', 'AWS / Azure', 'Terraform', 'GitHub Actions', 'Linux Shell'],
    prerequisites: 'Operating Systems Concepts, Basic Computer Networking',
    iconType: 'cloud',
    dagNodes: [
      { id: 'cl-f1', name: 'Linux Administration & Shell Scripting', level: 'Foundational', category: 'SYSADMIN', description: 'File systems, permissions, process management, SSH keys, and Bash automation.' },
      { id: 'cl-f2', name: 'Computer Networking & DNS Basics', level: 'Foundational', category: 'NETWORKING', description: 'OSI model, TCP/UDP, TLS/SSL certificates, reverse proxies, and firewalls.' },
      { id: 'cl-c1', name: 'Container Orchestration with Docker', level: 'Core Engineering', category: 'CONTAINERS', description: 'Microservice isolation, persistent volumes, environment configs, and registries.' },
      { id: 'cl-c2', name: 'Automated CI/CD Pipelines', level: 'Core Engineering', category: 'CI_CD', description: 'Automated test runners, build pipelines, lint checks, and artifact publishing.' },
      { id: 'cl-p1', name: 'Kubernetes Cluster Management', level: 'Production & Scale', category: 'ORCHESTRATION', description: 'Pods, Deployments, Services, Ingress controllers, and auto-scaling policies.' },
      { id: 'cl-p2', name: 'Infrastructure as Code (Terraform)', level: 'Production & Scale', category: 'IAC', description: 'Declarative cloud provisioning, state management, and modular infrastructure.' },
    ],
  },
  {
    id: 'domain-fullstack',
    roleId: 'role-backend',
    name: 'Full-Stack Web Architecture',
    category: 'Full-Stack',
    description: 'Build rich, accessible user interfaces with modern React frameworks and connect them to secure, performant distributed backend services.',
    demand_level: 'High Demand',
    duration: '12 Weeks · 8 Milestones',
    openRolesCount: '210+ Active Openings',
    technologies: ['TypeScript', 'React.js', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Next.js'],
    prerequisites: 'HTML5, CSS3, Modern JavaScript (ES6+)',
    iconType: 'fullstack',
    dagNodes: [
      { id: 'fs-f1', name: 'Semantic HTML5 & Modern CSS3', level: 'Foundational', category: 'WEB', description: 'Document hierarchy, Flexbox, Grid layouts, and responsive media queries.' },
      { id: 'fs-f2', name: 'TypeScript & Type Safety', level: 'Foundational', category: 'PROGRAMMING', description: 'Interfaces, generics, union types, and compiler configuration.' },
      { id: 'fs-c1', name: 'React Component Architecture & Hooks', level: 'Core Engineering', category: 'FRONTEND', description: 'Custom hooks, state lifting, component lifecycle, and virtual DOM efficiency.' },
      { id: 'fs-c2', name: 'Backend API Integration (Node/Express)', level: 'Core Engineering', category: 'BACKEND', description: 'Route controllers, middleware chains, validation, and JSON response models.' },
      { id: 'fs-p1', name: 'Server-Side Rendering (Next.js)', level: 'Production & Scale', category: 'FULLSTACK', description: 'Server components, client boundaries, static site generation, and SEO mastery.' },
      { id: 'fs-p2', name: 'Automated Testing & End-to-End', level: 'Production & Scale', category: 'TESTING', description: 'Unit testing with Vitest/Jest, component testing with React Testing Library.' },
    ],
  },
  {
    id: 'domain-security',
    roleId: 'role-backend',
    name: 'Cybersecurity & Defensive Systems',
    category: 'Security',
    description: 'Analyze network vulnerabilities, implement zero-trust authentication protocols, and harden enterprise software applications against exploits.',
    demand_level: 'Critical Need',
    duration: '10 Weeks · 6 Milestones',
    openRolesCount: '80+ Active Openings',
    technologies: ['Network Security', 'OWASP Top 10', 'JWT & OAuth2', 'Linux Hardening', 'Cryptography'],
    prerequisites: 'Computer Networks, Linux CLI, HTTP Protocols',
    iconType: 'security',
    dagNodes: [
      { id: 'sec-f1', name: 'Network Protocol & Packet Analysis', level: 'Foundational', category: 'NETWORKING', description: 'Packet sniffing with Wireshark, TCP handshakes, ICMP, and port scanning.' },
      { id: 'sec-f2', name: 'Applied Cryptography Fundamentals', level: 'Foundational', category: 'CRYPTOGRAPHY', description: 'Symmetric/asymmetric encryption, hashing algorithms, and public key infrastructure (PKI).' },
      { id: 'sec-c1', name: 'Web Application Security (OWASP Top 10)', level: 'Core Engineering', category: 'APPSEC', description: 'Remediating SQL injections, XSS vulnerabilities, CSRF, and broken access controls.' },
      { id: 'sec-c2', name: 'Identity & Access Management (OAuth/JWT)', level: 'Core Engineering', category: 'AUTH', description: 'Token validation, refresh rotation, claim verification, and OAuth flow security.' },
      { id: 'sec-p1', name: 'Defensive SIEM & Threat Monitoring', level: 'Production & Scale', category: 'OPERATIONS', description: 'Log ingestion, alert triage, incident response procedures, and intrusion detection.' },
      { id: 'sec-p2', name: 'Zero-Trust Architecture & Hardening', level: 'Production & Scale', category: 'ENTERPRISE', description: 'Least privilege enforcement, kernel hardening, and compliance standards.' },
    ],
  },
];

const CATEGORIES = [
  'ALL',
  'Artificial Intelligence',
  'Backend & APIs',
  'Data Science',
  'Cloud & DevOps',
  'Full-Stack',
  'Security',
];

export default function DiscoveryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [domains, setDomains] = useState<DomainItem[]>(DEFAULT_DOMAINS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDemand, setSelectedDemand] = useState('ALL');
  const [activeDagDomain, setActiveDagDomain] = useState<DomainItem | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadDomains() {
      setLoading(true);
      try {
        const res = await careersApi.getDomains();
        if (mounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge API data with rich fallback metadata
          const mapped = res.data.map((apiDomain: any, idx: number) => {
            const matchFallback = DEFAULT_DOMAINS.find(
              (d) => d.id === apiDomain.id || d.name.toLowerCase().includes(apiDomain.name.toLowerCase())
            ) || DEFAULT_DOMAINS[idx % DEFAULT_DOMAINS.length];

            return {
              ...matchFallback,
              id: apiDomain.id || matchFallback.id,
              name: apiDomain.name || matchFallback.name,
              description: apiDomain.description || matchFallback.description,
              demand_level: (apiDomain.demand_level === 'CRITICAL' ? 'Critical Need' : apiDomain.demand_level === 'GROWING' ? 'Growing' : 'High Demand') as any,
            };
          });

          // Ensure all default domains are included if backend only has 2 fallback items
          const mergedList = [...mapped];
          DEFAULT_DOMAINS.forEach((def) => {
            if (!mergedList.some((m) => m.id === def.id || m.name === def.name)) {
              mergedList.push(def);
            }
          });

          setDomains(mergedList);
        }
      } catch (err) {
        console.warn('Using enriched local domain taxonomy:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDomains();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAssessSkills = (domain: DomainItem) => {
    navigate('/assessment/self', {
      state: { selectedDomainId: domain.roleId || domain.id, domainName: domain.name },
    });
  };

  // Filter logic
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.technologies.some((tech) => tech.toLowerCase().includes(q)) ||
        d.prerequisites.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'ALL' ||
        d.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesDemand =
        selectedDemand === 'ALL' ||
        d.demand_level.toLowerCase().includes(selectedDemand.toLowerCase());

      return matchesSearch && matchesCategory && matchesDemand;
    });
  }, [domains, searchQuery, selectedCategory, selectedDemand]);

  const renderDomainIcon = (iconType: DomainItem['iconType']) => {
    switch (iconType) {
      case 'ai':
        return <BrainCircuit className="w-6 h-6 text-saffron-600" />;
      case 'backend':
        return <Server className="w-6 h-6 text-[#000080]" />;
      case 'data':
        return <BarChart3 className="w-6 h-6 text-indiaGreen" />;
      case 'cloud':
        return <Cloud className="w-6 h-6 text-sky-600" />;
      case 'fullstack':
        return <Code className="w-6 h-6 text-purple-600" />;
      case 'security':
        return <ShieldCheck className="w-6 h-6 text-rose-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-saffron-600" />;
    }
  };

  const getIconBgClass = (iconType: DomainItem['iconType']) => {
    switch (iconType) {
      case 'ai':
        return 'bg-amber-50 border-amber-200/80';
      case 'backend':
        return 'bg-blue-50 border-blue-200/80';
      case 'data':
        return 'bg-emerald-50 border-emerald-200/80';
      case 'cloud':
        return 'bg-sky-50 border-sky-200/80';
      case 'fullstack':
        return 'bg-purple-50 border-purple-200/80';
      case 'security':
        return 'bg-rose-50 border-rose-200/80';
      default:
        return 'bg-gray-50 border-gray-200/80';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-gray-900 pb-20">
      {/* =========================================================================
          HERO & HEADER
      ========================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-8 border-b border-gray-200/60 bg-white">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-80 h-80 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-1/4 w-80 h-80 bg-indiaGreen/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn delay={100}>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron-700 text-xs font-bold tracking-wide uppercase mb-3.5 border border-saffron/30">
                <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
                <span>{t('explorePage.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-gray-950 tracking-tight leading-tight">
                {t('explorePage.titlePrefix')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-[#000080] to-indiaGreen">
                  {t('explorePage.titleHighlight')}
                </span>
              </h1>

              <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-3 leading-relaxed">
                {t('explorePage.subtitle')}
              </p>
            </div>
          </FadeIn>

          {/* Key Metrics Ribbon */}
          <FadeIn delay={180}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
              <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-saffron/10 text-saffron-700 flex items-center justify-center font-bold text-sm shrink-0">
                  6+
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Standardized</div>
                  <div className="text-sm font-bold text-gray-900">Career Tracks</div>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#000080] flex items-center justify-center font-bold text-sm shrink-0">
                  48+
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Competency Nodes</div>
                  <div className="text-sm font-bold text-gray-900">Verified Skills</div>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-indiaGreen flex items-center justify-center font-bold text-sm shrink-0">
                  100%
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Curated Order</div>
                  <div className="text-sm font-bold text-gray-900">Prerequisite DAGs</div>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
                  Real
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Industry Aligned</div>
                  <div className="text-sm font-bold text-gray-900">Direct Calibration</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* =========================================================================
          CONTROLS: SEARCH & CATEGORY FILTER TABS
      ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('explorePage.searchPlaceholder')}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition bg-[#FAFAF9]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Demand Filter Toggle */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>Demand:</span>
              </span>
              <select
                value={selectedDemand}
                onChange={(e) => setSelectedDemand(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-[#FAFAF9] text-gray-800 focus:outline-hidden focus:border-saffron cursor-pointer"
              >
                <option value="ALL">{t('explorePage.allDemand')}</option>
                <option value="High Demand">High Demand</option>
                <option value="Critical Need">Critical Need</option>
                <option value="Growing">Growing</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-3 border-t border-gray-100 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#000080] text-white shadow-xs'
                      : 'bg-[#FAFAF9] text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                  }`}
                >
                  {cat === 'ALL' ? t('explorePage.allCategories') : cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          DOMAIN CARDS GRID
      ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 animate-spin text-saffron mr-2" />
            Syncing skill graph taxonomy with Vidyut core...
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDomains.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">{t('explorePage.noResults')}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search terms or selecting a different category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedDemand('ALL');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-saffron text-white hover:bg-saffron-600 transition"
            >
              {t('explorePage.clearFilters')}
            </button>
          </div>
        )}

        {/* Career Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.map((domain, idx) => (
            <FadeIn key={domain.id} delay={100 + (idx % 6) * 60} className="h-full">
              <div className="group relative bg-white border border-gray-200/85 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:border-saffron-500/70 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between overflow-hidden">
                {/* Tricolor Accent Line on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron via-[#000080] to-indiaGreen opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Card Header: Icon + Category + Demand Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${getIconBgClass(
                          domain.iconType
                        )}`}
                      >
                        {renderDomainIcon(domain.iconType)}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          {domain.category}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#000080] transition-colors leading-snug">
                          {domain.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Demand Pill */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        domain.demand_level === 'Critical Need'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : domain.demand_level === 'High Demand'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-[#000080] border-blue-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          domain.demand_level === 'Critical Need'
                            ? 'bg-amber-500 animate-pulse'
                            : domain.demand_level === 'High Demand'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span>{domain.demand_level}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      <span>{domain.openRolesCount}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed min-h-[56px] line-clamp-3">
                    {domain.description}
                  </p>

                  {/* Metadata Specs Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{domain.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      <span>{domain.dagNodes.length} Competency Nodes</span>
                    </div>
                  </div>

                  {/* Prerequisites Snippet */}
                  <div className="mt-3 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200/60 text-[11px] text-gray-600">
                    <span className="font-semibold text-gray-800">{t('explorePage.prerequisites')}:</span>{' '}
                    <span>{domain.prerequisites}</span>
                  </div>

                  {/* Technologies Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {domain.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-gray-700 border border-gray-200/80 shadow-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {domain.technologies.length > 5 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">
                        +{domain.technologies.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveDagDomain(domain)}
                    className="flex-1 py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:text-[#000080] hover:border-[#000080]/40 hover:bg-blue-50/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-gray-500" />
                    <span>{t('explorePage.previewDag')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAssessSkills(domain)}
                    className="flex-1 py-2 px-3 rounded-xl bg-saffron hover:bg-saffron-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group/btn"
                  >
                    <span>{t('explorePage.assessSkills')}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE SKILL DAG PREVIEW MODAL
      ========================================================================== */}
      {activeDagDomain && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setActiveDagDomain(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/80 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200/80 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-xs shrink-0 ${getIconBgClass(
                    activeDagDomain.iconType
                  )}`}
                >
                  {renderDomainIcon(activeDagDomain.iconType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-saffron-700 uppercase tracking-wider">
                      {activeDagDomain.category}
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs font-semibold text-gray-500">
                      {activeDagDomain.dagNodes.length} Prerequisite Nodes
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                    {activeDagDomain.name}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveDagDomain(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Architecture Directive Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-[#000080] flex items-start gap-2.5">
                <GitBranch className="w-4 h-4 text-[#000080] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Strictly Directed Prerequisite Architecture:</span> Higher-tier skills require validated mastery of foundational precursors. Vidyut prevents learning gaps by enforcing logical milestone sequencing.
                </div>
              </div>

              {/* 3 Phases of DAG */}
              <div className="space-y-6">
                {/* Phase 1: Foundational */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-saffron/10 text-saffron-700 font-black text-xs flex items-center justify-center border border-saffron/30">
                      1
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Phase 1: Foundational Prerequisites
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeDagDomain.dagNodes
                      .filter((n) => n.level === 'Foundational')
                      .map((node) => (
                        <div
                          key={node.id}
                          className="bg-[#FAF9F6] border border-gray-200/80 rounded-xl p-3 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{node.name}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-gray-500 border border-gray-200">
                              {node.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                            {node.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex items-center justify-center">
                  <div className="text-[11px] font-bold text-gray-400 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 flex items-center gap-1.5">
                    <span>↓ Unlocks Core Engineering Milestones</span>
                  </div>
                </div>

                {/* Phase 2: Core Engineering */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-[#000080] font-black text-xs flex items-center justify-center border border-blue-200">
                      2
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Phase 2: Core Engineering & Frameworks
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeDagDomain.dagNodes
                      .filter((n) => n.level === 'Core Engineering')
                      .map((node) => (
                        <div
                          key={node.id}
                          className="bg-white border border-gray-200/80 rounded-xl p-3 text-left shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{node.name}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-[#000080] border border-blue-100">
                              {node.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                            {node.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex items-center justify-center">
                  <div className="text-[11px] font-bold text-gray-400 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 flex items-center gap-1.5">
                    <span>↓ Unlocks Production Deployment & Scaling</span>
                  </div>
                </div>

                {/* Phase 3: Production & Scale */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-indiaGreen font-black text-xs flex items-center justify-center border border-emerald-200">
                      3
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Phase 3: Production Architecture & Scaling
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeDagDomain.dagNodes
                      .filter((n) => n.level === 'Production & Scale')
                      .map((node) => (
                        <div
                          key={node.id}
                          className="bg-white border border-gray-200/80 rounded-xl p-3 text-left shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{node.name}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-indiaGreen border border-emerald-100">
                              {node.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                            {node.description}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Technologies Required */}
              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  {t('explorePage.technologies')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDagDomain.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 rounded-md bg-gray-50 text-gray-700 border border-gray-200 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-200/80 bg-[#FAFAF9] flex items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setActiveDagDomain(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                {t('explorePage.close')}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetDomain = activeDagDomain;
                  setActiveDagDomain(null);
                  handleAssessSkills(targetDomain);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-saffron hover:bg-saffron-600 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <span>{t('explorePage.takeDiagnostic')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

