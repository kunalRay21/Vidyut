/**
 * Backend Resume Parser & Role Matching Service
 * Analyzes resume content and identifies skills, experience, and role alignment.
 */

export interface BackendRoleMatch {
  id: string;
  title: string;
  category: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface BackendParsedResume {
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  rawText: string;
  extractedSkills: string[];
  educationSignals: string[];
  experienceSignals: string[];
  primaryMatch: BackendRoleMatch;
  allMatches: BackendRoleMatch[];
  summary: string;
}

export const BACKEND_DOMAIN_TAXONOMY: Record<
  string,
  {
    id: string;
    title: string;
    category: string;
    coreSkills: string[];
    secondarySkills: string[];
  }
> = {
  'role-backend': {
    id: 'role-backend',
    title: 'Backend & Distributed Systems',
    category: 'Backend & APIs',
    coreSkills: [
      'python', 'fastapi', 'django', 'flask', 'node.js', 'nodejs', 'express',
      'java', 'spring boot', 'spring', 'golang', 'go', 'postgresql', 'postgres',
      'sql', 'redis', 'docker', 'rest api', 'restful', 'graphql', 'grpc',
      'microservices', 'rabbitmq', 'kafka', 'mongodb', 'mysql', 'caching'
    ],
    secondarySkills: ['git', 'linux', 'ci/cd', 'unit testing', 'jwt', 'oauth', 'aws', 'celery']
  },
  'role-ml': {
    id: 'role-ml',
    title: 'Artificial Intelligence & Machine Learning',
    category: 'Artificial Intelligence',
    coreSkills: [
      'machine learning', 'deep learning', 'artificial intelligence', 'pytorch',
      'tensorflow', 'keras', 'scikit-learn', 'scikit', 'sklearn', 'pandas', 'numpy',
      'computer vision', 'opencv', 'nlp', 'natural language processing', 'genai',
      'generative ai', 'transformers', 'hugging face', 'huggingface', 'llm',
      'linear algebra', 'calculus', 'statistics', 'neural networks'
    ],
    secondarySkills: ['python', 'jupyter', 'matplotlib', 'seaborn', 'fastapi', 'docker', 'cuda']
  },
  'role-cloud': {
    id: 'role-cloud',
    title: 'Cloud Native & DevOps Engineering',
    category: 'Cloud & DevOps',
    coreSkills: [
      'docker', 'kubernetes', 'k8s', 'aws', 'amazon web services', 'azure',
      'gcp', 'google cloud', 'terraform', 'ci/cd', 'github actions', 'gitlab ci',
      'jenkins', 'linux', 'bash', 'shell scripting', 'helm', 'ansible',
      'prometheus', 'grafana', 'nginx', 'networking'
    ],
    secondarySkills: ['python', 'git', 'yaml', 'security', 'monitoring', 'load balancing']
  },
  'role-data': {
    id: 'role-data',
    title: 'Data Science & Big Data Engineering',
    category: 'Data Science',
    coreSkills: [
      'data science', 'big data', 'data engineering', 'sql', 'advanced sql',
      'etl', 'apache spark', 'pyspark', 'spark', 'hadoop', 'kafka', 'pandas',
      'numpy', 'snowflake', 'databricks', 'data warehouse', 'data lake',
      'airflow', 'tableau', 'power bi', 'statistics'
    ],
    secondarySkills: ['python', 'postgresql', 'git', 'docker', 'analytics', 'data modeling']
  },
  'role-fullstack': {
    id: 'role-fullstack',
    title: 'Full-Stack Web Architecture',
    category: 'Full-Stack',
    coreSkills: [
      'react', 'react.js', 'typescript', 'javascript', 'next.js', 'nextjs',
      'html', 'html5', 'css', 'css3', 'tailwind', 'tailwind css', 'node.js',
      'nodejs', 'express', 'fullstack', 'full stack', 'redux', 'rest api', 'frontend'
    ],
    secondarySkills: ['postgresql', 'mongodb', 'git', 'jest', 'vitest', 'docker', 'ui/ux']
  },
  'role-security': {
    id: 'role-security',
    title: 'Cybersecurity & Defensive Systems',
    category: 'Security',
    coreSkills: [
      'cybersecurity', 'security', 'infosec', 'penetration testing', 'pen testing',
      'ethical hacking', 'owasp', 'cryptography', 'network security', 'wireshark',
      'linux hardening', 'kali linux', 'vulnerability assessment', 'siem',
      'firewalls', 'zero trust', 'oauth', 'jwt'
    ],
    secondarySkills: ['linux', 'python', 'bash', 'tcp/ip', 'incident response']
  }
};

const SKILL_NAMES_MAP: Record<string, string> = {
  python: 'Python',
  fastapi: 'FastAPI',
  django: 'Django',
  flask: 'Flask',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  express: 'Express.js',
  java: 'Java',
  'spring boot': 'Spring Boot',
  spring: 'Spring Boot',
  golang: 'Go (Golang)',
  go: 'Go',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  sql: 'SQL',
  redis: 'Redis',
  docker: 'Docker',
  'rest api': 'REST APIs',
  restful: 'REST APIs',
  graphql: 'GraphQL',
  grpc: 'gRPC',
  microservices: 'Microservices',
  rabbitmq: 'RabbitMQ',
  kafka: 'Apache Kafka',
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  caching: 'Caching Strategies',
  git: 'Git',
  linux: 'Linux',
  'ci/cd': 'CI/CD Pipelines',
  'machine learning': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'artificial intelligence': 'Artificial Intelligence',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  keras: 'Keras',
  'scikit-learn': 'Scikit-Learn',
  scikit: 'Scikit-Learn',
  sklearn: 'Scikit-Learn',
  pandas: 'Pandas',
  numpy: 'NumPy',
  'computer vision': 'Computer Vision',
  opencv: 'OpenCV',
  nlp: 'Natural Language Processing',
  'natural language processing': 'Natural Language Processing',
  genai: 'Generative AI',
  'generative ai': 'Generative AI',
  transformers: 'Transformers',
  'hugging face': 'Hugging Face',
  huggingface: 'Hugging Face',
  llm: 'Large Language Models (LLMs)',
  'linear algebra': 'Linear Algebra',
  calculus: 'Calculus',
  statistics: 'Statistics',
  'neural networks': 'Neural Networks',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS Cloud',
  'amazon web services': 'AWS Cloud',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud Platform',
  'google cloud': 'Google Cloud Platform',
  terraform: 'Terraform (IaC)',
  'github actions': 'GitHub Actions',
  'gitlab ci': 'GitLab CI',
  jenkins: 'Jenkins',
  bash: 'Bash Automation',
  helm: 'Helm',
  ansible: 'Ansible',
  prometheus: 'Prometheus',
  grafana: 'Grafana',
  nginx: 'Nginx',
  'data science': 'Data Science',
  'big data': 'Big Data',
  'data engineering': 'Data Engineering',
  'advanced sql': 'Advanced SQL',
  etl: 'ETL Pipelines',
  'apache spark': 'Apache Spark',
  pyspark: 'PySpark',
  spark: 'Apache Spark',
  hadoop: 'Hadoop',
  snowflake: 'Snowflake',
  databricks: 'Databricks',
  'data warehouse': 'Data Warehousing',
  airflow: 'Apache Airflow',
  tableau: 'Tableau',
  'power bi': 'Power BI',
  react: 'React.js',
  'react.js': 'React.js',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  html: 'HTML5',
  html5: 'HTML5',
  css: 'CSS3',
  css3: 'CSS3',
  tailwind: 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS',
  fullstack: 'Full-Stack Architecture',
  'full stack': 'Full-Stack Architecture',
  redux: 'Redux State Management',
  cybersecurity: 'Cybersecurity',
  security: 'Information Security',
  'penetration testing': 'Penetration Testing',
  'ethical hacking': 'Ethical Hacking',
  owasp: 'OWASP Security Standards',
  cryptography: 'Applied Cryptography',
  'network security': 'Network Security',
  wireshark: 'Wireshark Packet Analysis',
  'linux hardening': 'Linux Hardening',
  'kali linux': 'Kali Linux',
  siem: 'SIEM Log Ingestion',
  'zero trust': 'Zero-Trust Architecture',
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ResumeParserService {
  /**
   * Parse resume text and match across official Vidyut domains
   */
  public static parse(
    text: string,
    fileName: string = 'Uploaded_Resume.pdf',
    fileSize: number = 0
  ): BackendParsedResume {
    if (!text || text.trim().length === 0) {
      throw new Error('Resume content is empty.');
    }

    const normalized = text.toLowerCase();
    const matchedSkillKeys = new Set<string>();
    const detectedSkillsFormatted = new Set<string>();

    Object.values(BACKEND_DOMAIN_TAXONOMY).forEach((domain) => {
      const allSkills = [...domain.coreSkills, ...domain.secondarySkills];
      allSkills.forEach((skill) => {
        const escaped = escapeRegExp(skill);
        const pattern = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, 'i');
        if (pattern.test(normalized)) {
          matchedSkillKeys.add(skill);
          const displayName = SKILL_NAMES_MAP[skill] || skill.toUpperCase();
          detectedSkillsFormatted.add(displayName);
        }
      });
    });

    // Education signals
    const educationSignals: string[] = [];
    const eduPatterns = [
      { label: 'B.Tech / B.E. Degree', regex: /\b(b\.?tech|b\.?e|bachelor of technology|bachelor of engineering)\b/i },
      { label: 'M.Tech / M.E. Degree', regex: /\b(m\.?tech|m\.?e|master of technology)\b/i },
      { label: 'B.Sc / BCA Degree', regex: /\b(b\.?sc|bca|bachelor of computer)\b/i },
      { label: 'Computer Science Major', regex: /\b(computer science|cse|information technology|software engineering)\b/i },
      { label: 'Engineering Institution', regex: /\b(vit|iit|nit|iiit|bits|university|institute of technology|college)\b/i },
    ];
    eduPatterns.forEach((p) => {
      if (p.regex.test(text)) {
        educationSignals.push(p.label);
      }
    });

    // Experience signals
    const experienceSignals: string[] = [];
    const expPatterns = [
      { label: 'Software Engineering Intern', regex: /\b(intern|internship|trainee)\b/i },
      { label: 'Open Source / Projects', regex: /\b(github|open-source|lead|hackathon|winner)\b/i },
      { label: 'Industry Experience', regex: /\b([0-9]+)\s*(years?|yrs?)\s*(of\s*)?experience\b/i },
      { label: 'Student / Early Career', regex: /\b(student|fresher|undergraduate|final year)\b/i },
    ];
    expPatterns.forEach((p) => {
      if (p.regex.test(text)) {
        experienceSignals.push(p.label);
      }
    });

    // Calculate match scores
    const roleMatches: BackendRoleMatch[] = Object.values(BACKEND_DOMAIN_TAXONOMY).map((domain) => {
      const matchedCore = domain.coreSkills.filter((sk) => matchedSkillKeys.has(sk));
      const matchedSec = domain.secondarySkills.filter((sk) => matchedSkillKeys.has(sk));

      const totalCoreCount = domain.coreSkills.length;
      const totalSecCount = domain.secondarySkills.length;
      const coreRatio = totalCoreCount > 0 ? matchedCore.length / totalCoreCount : 0;
      const secRatio = totalSecCount > 0 ? matchedSec.length / totalSecCount : 0;

      let rawScore = Math.round((coreRatio * 0.75 + secRatio * 0.25) * 100);

      if (matchedCore.length >= 4) {
        rawScore = Math.min(96, rawScore + 30);
      } else if (matchedCore.length >= 2) {
        rawScore = Math.min(88, rawScore + 20);
      } else if (matchedCore.length >= 1) {
        rawScore = Math.min(65, rawScore + 15);
      }

      const matchPercentage = Math.max(0, Math.min(98, rawScore));

      const matchedNames = Array.from(
        new Set(
          [...matchedCore, ...matchedSec].map((s) => SKILL_NAMES_MAP[s] || s.toUpperCase())
        )
      );

      const missingCore = domain.coreSkills
        .filter((sk) => !matchedSkillKeys.has(sk))
        .slice(0, 5)
        .map((s) => SKILL_NAMES_MAP[s] || s.toUpperCase());

      return {
        id: domain.id,
        title: domain.title,
        category: domain.category,
        matchPercentage,
        matchedSkills: matchedNames,
        missingSkills: missingCore,
      };
    });

    roleMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    const primaryMatch = roleMatches[0] || {
      id: 'role-backend',
      title: 'Backend & Distributed Systems',
      category: 'Backend & APIs',
      matchPercentage: 45,
      matchedSkills: ['Programming Fundamentals'],
      missingSkills: ['PostgreSQL', 'Docker', 'FastAPI'],
    };

    const extractedSkillsList = Array.from(detectedSkillsFormatted);
    const summary = `Parsed resume with ${extractedSkillsList.length} verified technical skills. Top alignment: ${primaryMatch.title} (${primaryMatch.matchPercentage}% match).`;

    return {
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      rawText: text.slice(0, 10000),
      extractedSkills: extractedSkillsList,
      educationSignals,
      experienceSignals,
      primaryMatch,
      allMatches: roleMatches,
      summary,
    };
  }
}
