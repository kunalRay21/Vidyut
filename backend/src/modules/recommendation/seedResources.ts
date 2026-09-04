import { query } from '../../database/db';

interface ResourceSeedItem {
  skillName: string;
  title: string;
  url: string;
  type: 'DOCUMENTATION' | 'VIDEO' | 'COURSE' | 'INTERACTIVE';
  isFree: boolean;
  provider: string;
}

const RESOURCES_SEED: ResourceSeedItem[] = [
  // Backend & Languages
  {
    skillName: 'Python',
    title: 'Python for Beginners & Core Language Concepts',
    url: 'https://docs.python.org/3/tutorial/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Python Software Foundation',
  },
  {
    skillName: 'Python',
    title: 'Complete Python Bootcamp: Go from Zero to Hero',
    url: 'https://www.freecodecamp.org/news/learn-python-basics-python-tutorial-for-beginners/',
    type: 'COURSE',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'FastAPI',
    title: 'FastAPI Tutorial - User Guide & High-Performance Microservices',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'FastAPI Official',
  },
  {
    skillName: 'FastAPI',
    title: 'Build High-Throughput APIs with FastAPI & Pydantic',
    url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp YouTube',
  },
  {
    skillName: 'Django',
    title: 'Writing Your First Django App',
    url: 'https://docs.djangoproject.com/en/5.0/intro/tutorial01/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Django Software Foundation',
  },
  {
    skillName: 'SQL',
    title: 'PostgreSQL Tutorial: Learn SQL from Scratch',
    url: 'https://www.postgresqltutorial.com/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'PostgreSQL Tutorial',
  },
  {
    skillName: 'SQL',
    title: 'SQL & Relational Database Design Masterclass',
    url: 'https://mode.com/sql-tutorial/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Mode Analytics',
  },
  {
    skillName: 'Redis',
    title: 'Redis University: Fast In-Memory Data Storage & Caching',
    url: 'https://university.redis.com/',
    type: 'COURSE',
    isFree: true,
    provider: 'Redis Labs',
  },
  {
    skillName: 'Docker',
    title: 'Docker Getting Started Guide: Containers & Multi-stage Builds',
    url: 'https://docs.docker.com/get-started/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Docker Docs',
  },
  {
    skillName: 'Docker',
    title: 'Docker Crash Course for Backend Developers',
    url: 'https://www.youtube.com/watch?v=pg19Z8LL06w',
    type: 'VIDEO',
    isFree: true,
    provider: 'TechWorld with Nana',
  },
  {
    skillName: 'Git & GitHub',
    title: 'Pro Git Book (Complete Reference)',
    url: 'https://git-scm.com/book/en/v2',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Git SCM',
  },
  {
    skillName: 'REST API',
    title: 'RESTful API Architecture and Best Practices Guide',
    url: 'https://restfulapi.net/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Restful API Net',
  },

  // Machine Learning & AI
  {
    skillName: 'Machine Learning Fundamentals',
    title: 'Supervised Machine Learning: Regression and Classification',
    url: 'https://www.deeplearning.ai/courses/machine-learning-specialization/',
    type: 'COURSE',
    isFree: true,
    provider: 'DeepLearning.AI / Andrew Ng',
  },
  {
    skillName: 'PyTorch',
    title: 'Deep Learning with PyTorch: A 60-Minute Blitz',
    url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'PyTorch Docs',
  },
  {
    skillName: 'Deep Learning',
    title: 'Deep Learning Specialization - Neural Networks & Optimization',
    url: 'https://www.deeplearning.ai/courses/deep-learning-specialization/',
    type: 'COURSE',
    isFree: true,
    provider: 'DeepLearning.AI',
  },
  {
    skillName: 'Pandas',
    title: '10 Minutes to Pandas Guide',
    url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Pandas Dev Team',
  },
  {
    skillName: 'Model Deployment',
    title: 'Deploying Machine Learning Models into Production APIs',
    url: 'https://madewithml.com/',
    type: 'COURSE',
    isFree: true,
    provider: 'Made With ML',
  },
  {
    skillName: 'MLOps',
    title: 'Full Stack Deep Learning: MLOps Course',
    url: 'https://fullstackdeeplearning.com/course/2022/',
    type: 'COURSE',
    isFree: true,
    provider: 'FSDL',
  },
];

export async function seedResources(): Promise<number> {
  console.log('🌱 Seeding learning resources into PostgreSQL...');
  let inserted = 0;

  for (const item of RESOURCES_SEED) {
    // Find skill by name
    const skillRes = await query<{ id: string }>(
      `SELECT id FROM skills WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [item.skillName]
    );

    if (skillRes.rows.length === 0) {
      continue;
    }

    const skillId = skillRes.rows[0].id;

    // Check if resource already exists
    const existing = await query<{ id: string }>(
      `SELECT id FROM resources WHERE skill_id = $1 AND title = $2 LIMIT 1`,
      [skillId, item.title]
    );

    if (existing.rows.length === 0) {
      await query(
        `
        INSERT INTO resources (skill_id, title, url, type, is_free, provider)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [skillId, item.title, item.url, item.type, item.isFree, item.provider]
      );
      inserted++;
    }
  }

  console.log(`✅ ${inserted} learning resources seeded into PostgreSQL!`);
  return inserted;
}

if (require.main === module) {
  seedResources()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Resources seed error:', err);
      process.exit(1);
    });
}
