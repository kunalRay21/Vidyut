import { query } from '../../database/db';

type QuestionSeed = {
  skillName: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  explanation: string;
};

const questions: QuestionSeed[] = [
  //  PYTHON
  {
    skillName: 'Python',
    question_text: 'Which keyword is used to define a function in Python?',
    option_a: 'func',
    option_b: 'def',
    option_c: 'function',
    option_d: 'define',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: 'Python uses the def keyword to define functions.'
  },
  {
    skillName: 'Python',
    question_text: 'Which data type stores key-value pairs in Python?',
    option_a: 'List',
    option_b: 'Tuple',
    option_c: 'Dictionary',
    option_d: 'Set',
    correct_option: 'C',
    difficulty: 'EASY',
    explanation: 'A Python dictionary stores data as key-value pairs.'
  },
  {
    skillName: 'Python',
    question_text: 'What is the output type of len([1,2,3])?',
    option_a: 'String',
    option_b: 'Integer',
    option_c: 'Float',
    option_d: 'Boolean',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: 'len() returns the number of elements as an integer.'
  },
  {
    skillName: 'Python',
    question_text: 'Which symbol starts a comment in Python?',
    option_a: '//',
    option_b: '/*',
    option_c: '#',
    option_d: '--',
    correct_option: 'C',
    difficulty: 'EASY',
    explanation: 'The # symbol starts a single-line comment in Python.'
  },

  // GIT 
  {
    skillName: 'Git & GitHub',
    question_text: 'Which command creates a new Git branch?',
    option_a: 'git branch feature',
    option_b: 'git new feature',
    option_c: 'git create feature',
    option_d: 'git make feature',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'git branch feature creates a new branch named feature.'
  },
  {
    skillName: 'Git & GitHub',
    question_text: 'Which command uploads local commits to a remote repository?',
    option_a: 'git upload',
    option_b: 'git push',
    option_c: 'git send',
    option_d: 'git commit',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: 'git push sends local commits to the configured remote repository.'
  },
  {
    skillName: 'Git & GitHub',
    question_text: 'Which command downloads changes from a remote repository without merging them?',
    option_a: 'git pull',
    option_b: 'git fetch',
    option_c: 'git download',
    option_d: 'git clone',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    explanation: 'git fetch downloads remote changes without merging them.'
  },

  // HTTP
  {
    skillName: 'HTTP',
    question_text: 'Which HTTP method is commonly used to retrieve data?',
    option_a: 'POST',
    option_b: 'PUT',
    option_c: 'GET',
    option_d: 'PATCH',
    correct_option: 'C',
    difficulty: 'EASY',
    explanation: 'GET is normally used to retrieve resources.'
  },
  {
    skillName: 'HTTP',
    question_text: 'What does HTTP status code 404 indicate?',
    option_a: 'Success',
    option_b: 'Unauthorized',
    option_c: 'Server Error',
    option_d: 'Resource Not Found',
    correct_option: 'D',
    difficulty: 'EASY',
    explanation: '404 means that the requested resource could not be found.'
  },
  {
    skillName: 'HTTP',
    question_text: 'What does HTTP status code 201 usually indicate?',
    option_a: 'Created',
    option_b: 'Not Found',
    option_c: 'Unauthorized',
    option_d: 'Bad Request',
    correct_option: 'A',
    difficulty: 'MEDIUM',
    explanation: '201 Created indicates that a resource was successfully created.'
  },

  //  REST API 
  {
    skillName: 'REST API',
    question_text: 'Which HTTP method is commonly used to create a new resource?',
    option_a: 'GET',
    option_b: 'POST',
    option_c: 'DELETE',
    option_d: 'HEAD',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: 'POST is commonly used to create resources.'
  },
  {
    skillName: 'REST API',
    question_text: 'Which HTTP method is commonly used to completely replace a resource?',
    option_a: 'GET',
    option_b: 'POST',
    option_c: 'PUT',
    option_d: 'DELETE',
    correct_option: 'C',
    difficulty: 'MEDIUM',
    explanation: 'PUT is commonly used for complete replacement of a resource.'
  },
  {
    skillName: 'REST API',
    question_text: 'What format is commonly used for REST API responses?',
    option_a: 'JSON',
    option_b: 'EXE',
    option_c: 'DLL',
    option_d: 'BIN',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'JSON is widely used for REST API request and response payloads.'
  },

  // SQL 
  {
    skillName: 'SQL',
    question_text: 'Which SQL command is used to retrieve data?',
    option_a: 'INSERT',
    option_b: 'UPDATE',
    option_c: 'SELECT',
    option_d: 'DELETE',
    correct_option: 'C',
    difficulty: 'EASY',
    explanation: 'SELECT retrieves data from database tables.'
  },
  {
    skillName: 'SQL',
    question_text: 'Which SQL clause filters rows?',
    option_a: 'WHERE',
    option_b: 'ORDER BY',
    option_c: 'GROUP BY',
    option_d: 'LIMIT',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'WHERE filters rows according to a condition.'
  },
  {
    skillName: 'SQL',
    question_text: 'Which constraint uniquely identifies each row?',
    option_a: 'FOREIGN KEY',
    option_b: 'PRIMARY KEY',
    option_c: 'CHECK',
    option_d: 'DEFAULT',
    correct_option: 'B',
    difficulty: 'EASY',
    explanation: 'A primary key uniquely identifies each record.'
  },
  {
    skillName: 'SQL',
    question_text: 'Which JOIN returns matching rows from both tables?',
    option_a: 'LEFT JOIN',
    option_b: 'RIGHT JOIN',
    option_c: 'INNER JOIN',
    option_d: 'FULL JOIN',
    correct_option: 'C',
    difficulty: 'MEDIUM',
    explanation: 'INNER JOIN returns rows having matching values in both tables.'
  },

  // ================= DATABASE DESIGN =================
  {
    skillName: 'Database Design',
    question_text: 'What is normalization primarily used for?',
    option_a: 'Increasing duplicate data',
    option_b: 'Reducing data redundancy',
    option_c: 'Deleting databases',
    option_d: 'Encrypting passwords',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    explanation: 'Normalization reduces redundancy and improves data consistency.'
  },
  {
    skillName: 'Database Design',
    question_text: 'What does a foreign key represent?',
    option_a: 'A relationship to another table',
    option_b: 'A password',
    option_c: 'A database backup',
    option_d: 'A programming variable',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'A foreign key references a key in another table.'
  },

  // ================= AUTHENTICATION =================
  {
    skillName: 'Authentication',
    question_text: 'What is authentication?',
    option_a: 'Checking user identity',
    option_b: 'Checking database speed',
    option_c: 'Deleting users',
    option_d: 'Compressing data',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'Authentication verifies who a user is.'
  },
  {
    skillName: 'Authentication',
    question_text: 'Which token format is commonly used for stateless authentication?',
    option_a: 'JWT',
    option_b: 'HTML',
    option_c: 'CSS',
    option_d: 'SQL',
    correct_option: 'A',
    difficulty: 'MEDIUM',
    explanation: 'JWT is commonly used for stateless authentication.'
  },

  // ================= API SECURITY =================
  {
    skillName: 'API Security',
    question_text: 'Which practice helps protect an API from unauthorized access?',
    option_a: 'Authentication',
    option_b: 'Removing validation',
    option_c: 'Using plain passwords',
    option_d: 'Disabling HTTPS',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'Authentication ensures only authorized users can access protected resources.'
  },
  {
    skillName: 'API Security',
    question_text: 'Why should passwords be hashed before storage?',
    option_a: 'To make them longer',
    option_b: 'To protect passwords if the database is exposed',
    option_c: 'To improve UI',
    option_d: 'To increase network speed',
    correct_option: 'B',
    difficulty: 'MEDIUM',
    explanation: 'Password hashing prevents storing passwords in plain text.'
  },

  // ================= DOCKER =================
  {
    skillName: 'Docker',
    question_text: 'What is Docker primarily used for?',
    option_a: 'Containerization',
    option_b: 'Image editing',
    option_c: 'Database normalization',
    option_d: 'Version control',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'Docker packages applications and dependencies into containers.'
  },
  {
    skillName: 'Docker',
    question_text: 'Which file commonly defines Docker image build instructions?',
    option_a: 'Dockerfile',
    option_b: 'package.json',
    option_c: 'docker.json',
    option_d: 'image.txt',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'A Dockerfile contains instructions for building a Docker image.'
  },

  // ================= TESTING =================
  {
    skillName: 'Testing',
    question_text: 'What is unit testing?',
    option_a: 'Testing individual units of code',
    option_b: 'Testing only the database',
    option_c: 'Testing network hardware',
    option_d: 'Testing UI colors',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'Unit tests verify individual functions or components.'
  },
  {
    skillName: 'Testing',
    question_text: 'What is integration testing used to verify?',
    option_a: 'Interaction between components',
    option_b: 'Font sizes',
    option_c: 'Git branches',
    option_d: 'Computer hardware',
    correct_option: 'A',
    difficulty: 'MEDIUM',
    explanation: 'Integration testing verifies that multiple components work together correctly.'
  },

  // ================= CI/CD =================
  {
    skillName: 'CI/CD',
    question_text: 'What does CI stand for?',
    option_a: 'Continuous Integration',
    option_b: 'Code Installation',
    option_c: 'Continuous Internet',
    option_d: 'Computer Integration',
    correct_option: 'A',
    difficulty: 'EASY',
    explanation: 'CI stands for Continuous Integration.'
  },
  {
    skillName: 'CI/CD',
    question_text: 'What is the primary goal of CI/CD?',
    option_a: 'Automate build, test and deployment',
    option_b: 'Remove version control',
    option_c: 'Delete production systems',
    option_d: 'Replace databases',
    correct_option: 'A',
    difficulty: 'MEDIUM',
    explanation: 'CI/CD automates software integration, testing and delivery/deployment.'
  }
];

async function seedQuestions() {
  console.log('🌱 Seeding assessment questions...');

  let inserted = 0;

  for (const q of questions) {
    const skillResult = await query<{ id: string }>(
      `SELECT id FROM skills WHERE name = $1 LIMIT 1`,
      [q.skillName]
    );

    if (skillResult.rows.length === 0) {
      console.log(`⚠️ Skill not found: ${q.skillName}`);
      continue;
    }

    await query(
      `
      INSERT INTO questions
        (
          skill_id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          difficulty,
          explanation
        )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        skillResult.rows[0].id,
        q.question_text,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        q.difficulty,
        q.explanation
      ]
    );

    inserted++;
  }

  console.log(`✅ ${inserted} assessment questions seeded successfully!`);
}

seedQuestions().catch((error) => {
  console.error('❌ Assessment question seed failed:', error);
  process.exit(1);
});