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
  // =========================================================================
  // 1. MATHEMATICS & THEORETICAL FOUNDATIONS
  // =========================================================================
  {
    skillName: 'Linear Algebra',
    title: 'NPTEL: Linear Algebra (Prof. K.C. Sivakumar, IIT Madras)',
    url: 'https://nptel.ac.in/courses/111106051',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Madras',
  },
  {
    skillName: 'Linear Algebra',
    title: 'MIT 18.06: Linear Algebra (Prof. Gilbert Strang)',
    url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
    type: 'COURSE',
    isFree: true,
    provider: 'MIT OpenCourseWare',
  },
  {
    skillName: 'Linear Algebra',
    title: 'Essence of Linear Algebra Visual Series',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
    type: 'VIDEO',
    isFree: true,
    provider: '3Blue1Brown',
  },
  {
    skillName: 'Linear Algebra',
    title: 'Immersive Linear Algebra with Interactive 3D Visualizations',
    url: 'https://immersivemath.com/ila/index.html',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Immersive Math',
  },
  {
    skillName: 'Statistics',
    title: 'NPTEL: Probability and Statistics (Prof. Somesh Kumar, IIT Kharagpur)',
    url: 'https://nptel.ac.in/courses/111105041',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Kharagpur',
  },
  {
    skillName: 'Statistics',
    title: 'Stanford Online: Statistical Learning & Probability Foundations',
    url: 'https://online.stanford.edu/courses/sohs-ystatslearning-statistical-learning',
    type: 'COURSE',
    isFree: true,
    provider: 'Stanford Online',
  },
  {
    skillName: 'Statistics',
    title: 'Penn State STAT 414: Mathematical Statistics Course Notes',
    url: 'https://online.stat.psu.edu/stat414/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Penn State University',
  },
  {
    skillName: 'Statistics',
    title: 'Statistics Fundamentals, Distributions and Hypothesis Testing',
    url: 'https://www.youtube.com/watch?v=qBigTkBLU6g',
    type: 'VIDEO',
    isFree: true,
    provider: 'StatQuest with Josh Starmer',
  },
  {
    skillName: 'Programming Fundamentals',
    title: 'CS50x: Introduction to Computer Science & Computational Thinking',
    url: 'https://cs50.harvard.edu/x/',
    type: 'COURSE',
    isFree: true,
    provider: 'Harvard University / edX',
  },
  {
    skillName: 'Programming Fundamentals',
    title: 'NPTEL: Programming, Data Structures & Algorithms Using Python',
    url: 'https://nptel.ac.in/courses/106106145',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Madras',
  },
  {
    skillName: 'Programming Fundamentals',
    title: 'freeCodeCamp: Foundational Coding Concepts & Algorithms',
    url: 'https://www.freecodecamp.org/learn/foundational-c-sharp-with-microsoft/',
    type: 'COURSE',
    isFree: true,
    provider: 'freeCodeCamp',
  },

  // =========================================================================
  // 2. DATA SCIENCE, WRANGLING & ANALYTICS
  // =========================================================================
  {
    skillName: 'NumPy',
    title: 'NumPy Absolute Beginner Guide & Vectorization Manual',
    url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'NumPy.org',
  },
  {
    skillName: 'NumPy',
    title: 'Python NumPy Tutorial for High-Performance Scientific Computing',
    url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'NumPy',
    title: 'Interactive NumPy Multi-Dimensional Array Operations',
    url: 'https://www.w3schools.com/python/numpy/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'W3Schools',
  },
  {
    skillName: 'Pandas',
    title: '10 Minutes to Pandas Guide & Essential Cookbook',
    url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Pandas Dev Team',
  },
  {
    skillName: 'Pandas',
    title: 'Kaggle Learn: Data Cleaning, Reshaping & Wrangling with Pandas',
    url: 'https://www.kaggle.com/learn/pandas',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Kaggle',
  },
  {
    skillName: 'Pandas',
    title: 'NPTEL: Data Science for Engineers (Prof. Ragunathan Rengasamy, IIT Madras)',
    url: 'https://nptel.ac.in/courses/106106179',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Madras',
  },
  {
    skillName: 'Data Preprocessing',
    title: 'Scikit-Learn Preprocessing & Feature Scaling Guide',
    url: 'https://scikit-learn.org/stable/modules/preprocessing.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Scikit-Learn Docs',
  },
  {
    skillName: 'Data Preprocessing',
    title: 'Kaggle Learn: Data Cleaning - Missing Values, Imputation & Encodings',
    url: 'https://www.kaggle.com/learn/data-cleaning',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Kaggle',
  },
  {
    skillName: 'Data Preprocessing',
    title: 'DeepLearning.AI: Data Engineering for ML Pipelines',
    url: 'https://www.deeplearning.ai/courses/data-engineering-for-machine-learning-specialization/',
    type: 'COURSE',
    isFree: true,
    provider: 'DeepLearning.AI',
  },
  {
    skillName: 'Feature Engineering',
    title: 'Kaggle Learn: Mutual Information, Target Encoding & PCA',
    url: 'https://www.kaggle.com/learn/feature-engineering',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Kaggle',
  },
  {
    skillName: 'Feature Engineering',
    title: 'Google Machine Learning: Representation & Feature Engineering',
    url: 'https://developers.google.com/machine-learning/crash-course/representation/feature-engineering',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Google Developers',
  },
  {
    skillName: 'Data Visualization',
    title: 'Matplotlib & Seaborn Official Visualization User Guide',
    url: 'https://matplotlib.org/stable/users/index.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Matplotlib Org',
  },
  {
    skillName: 'Data Visualization',
    title: 'Data Analysis & Visual Storytelling with Python and Seaborn',
    url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'Data Visualization',
    title: 'Kaggle Learn: Distributions, Heatmaps, Boxplots & Categorical Plots',
    url: 'https://www.kaggle.com/learn/data-visualization',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Kaggle',
  },
  {
    skillName: 'SQL',
    title: 'NPTEL: Database Management Systems (Prof. Partha Pratim Das, IIT Kharagpur)',
    url: 'https://nptel.ac.in/courses/106105175',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Kharagpur',
  },
  {
    skillName: 'SQL',
    title: 'PostgreSQL Tutorial: Learn SQL from Scratch to Advanced Queries',
    url: 'https://www.postgresqltutorial.com/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'PostgreSQL Tutorial',
  },
  {
    skillName: 'SQL',
    title: 'The SQL Tutorial for Data Analysis: Joins, Window Functions & Aggregations',
    url: 'https://mode.com/sql-tutorial/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Mode Analytics',
  },
  {
    skillName: 'PostgreSQL',
    title: 'PostgreSQL 16 Official Manual & Query Planner Optimization',
    url: 'https://www.postgresql.org/docs/current/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'PostgreSQL Global Development Group',
  },
  {
    skillName: 'PostgreSQL',
    title: 'Use The Index, Luke! A Guide to Database Indexing & Query Execution Plans',
    url: 'https://use-the-index-luke.com/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Markus Winand',
  },
  {
    skillName: 'MySQL',
    title: 'MySQL 8.0 Reference Manual: InnoDB Engine, Transactions & Locking',
    url: 'https://dev.mysql.com/doc/refman/8.0/en/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Oracle MySQL',
  },
  {
    skillName: 'MySQL',
    title: 'MySQL Tutorial for Developers & Database Administrators',
    url: 'https://www.mysqltutorial.org/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'MySQL Tutorial',
  },

  // =========================================================================
  // 3. ARTIFICIAL INTELLIGENCE, MACHINE LEARNING & DEEP LEARNING
  // =========================================================================
  {
    skillName: 'Machine Learning Fundamentals',
    title: 'Machine Learning Specialization: Supervised & Unsupervised Learning',
    url: 'https://www.deeplearning.ai/courses/machine-learning-specialization/',
    type: 'COURSE',
    isFree: true,
    provider: 'DeepLearning.AI / Andrew Ng',
  },
  {
    skillName: 'Machine Learning Fundamentals',
    title: 'NPTEL: Introduction to Machine Learning (Prof. Balaraman Ravindran, IIT Madras)',
    url: 'https://nptel.ac.in/courses/106106139',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Madras',
  },
  {
    skillName: 'Machine Learning Fundamentals',
    title: 'Google Machine Learning Crash Course with TensorFlow',
    url: 'https://developers.google.com/machine-learning/crash-course',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Google Developers',
  },
  {
    skillName: 'Scikit-Learn',
    title: 'Scikit-Learn User Guide & Supervised Algorithms Reference',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Scikit-Learn Consortium',
  },
  {
    skillName: 'Scikit-Learn',
    title: 'Inria MOOC: Machine Learning in Python with Scikit-Learn',
    url: 'https://www.inria.fr/en/machine-learning-python-scikit-learn',
    type: 'COURSE',
    isFree: true,
    provider: 'Inria / scikit-learn',
  },
  {
    skillName: 'Model Evaluation',
    title: 'Google Machine Learning: Classification Metrics, ROC & Cost-Weighted Errors',
    url: 'https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Google Developers',
  },
  {
    skillName: 'Model Evaluation',
    title: 'StatQuest: ROC and AUC, Confusion Matrices & F1 Score Explained Visually',
    url: 'https://www.youtube.com/watch?v=4jRBRDbJemM',
    type: 'VIDEO',
    isFree: true,
    provider: 'StatQuest with Josh Starmer',
  },
  {
    skillName: 'Deep Learning',
    title: 'Deep Learning Specialization: Neural Networks & Backpropagation',
    url: 'https://www.deeplearning.ai/courses/deep-learning-specialization/',
    type: 'COURSE',
    isFree: true,
    provider: 'DeepLearning.AI',
  },
  {
    skillName: 'Deep Learning',
    title: 'MIT 6.S191: Introduction to Deep Learning',
    url: 'http://introtodeeplearning.com/',
    type: 'COURSE',
    isFree: true,
    provider: 'MIT OpenCourseWare',
  },
  {
    skillName: 'Deep Learning',
    title: 'Practical Deep Learning for Coders',
    url: 'https://course.fast.ai/',
    type: 'COURSE',
    isFree: true,
    provider: 'Fast.ai',
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
    skillName: 'PyTorch',
    title: 'PyTorch for Deep Learning & Computer Vision Bootcamp',
    url: 'https://www.freecodecamp.org/news/pytorch-for-deep-learning-course/',
    type: 'COURSE',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'PyTorch',
    title: 'PyTorch Official Tutorials: Neural Networks, Autograd & TorchScript',
    url: 'https://pytorch.org/docs/stable/index.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'PyTorch Org',
  },
  {
    skillName: 'TensorFlow',
    title: 'TensorFlow 2 Core Tutorials & Keras Model Subclassing',
    url: 'https://www.tensorflow.org/tutorials',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Google TensorFlow',
  },
  {
    skillName: 'TensorFlow',
    title: 'TensorFlow 2.0 Full Course: CNNs, RNNs & Transfer Learning',
    url: 'https://www.youtube.com/watch?v=tPYj3fFJGjk',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'Computer Vision',
    title: 'NPTEL: Computer Vision (Prof. Jayanta Mukhopadhyay, IIT Kharagpur)',
    url: 'https://nptel.ac.in/courses/106105216',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Kharagpur',
  },
  {
    skillName: 'Computer Vision',
    title: 'Computer Vision with Python & OpenCV Full Bootcamp',
    url: 'https://www.youtube.com/watch?v=oXlwWbU8l2o',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'OpenCV',
    title: 'OpenCV-Python Tutorials & Real-Time Video Processing',
    url: 'https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'OpenCV Dev Team',
  },
  {
    skillName: 'OpenCV',
    title: 'PyImageSearch: OpenCV Core Image Transformations & Edge Detection',
    url: 'https://pyimagesearch.com/start-here/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'PyImageSearch',
  },
  {
    skillName: 'NLP',
    title: 'Stanford CS224N: Natural Language Processing with Deep Learning',
    url: 'https://web.stanford.edu/class/cs224n/',
    type: 'COURSE',
    isFree: true,
    provider: 'Stanford University',
  },
  {
    skillName: 'NLP',
    title: 'Hugging Face NLP Course: Transformers, Tokenizers & Fine-Tuning',
    url: 'https://huggingface.co/learn/nlp-course/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Hugging Face',
  },
  {
    skillName: 'NLP',
    title: 'NPTEL: Natural Language Processing (Prof. Pawan Goyal, IIT Kharagpur)',
    url: 'https://nptel.ac.in/courses/106105158',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Kharagpur',
  },
  {
    skillName: 'Vector DB',
    title: 'Pinecone Learn: Vector Databases & HNSW Similarity Search',
    url: 'https://www.pinecone.io/learn/vector-database/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Pinecone',
  },
  {
    skillName: 'Vector DB',
    title: 'ChromaDB Getting Started Guide: Embeddings & RAG Architectures',
    url: 'https://docs.trychroma.com/getting-started',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'ChromaDB',
  },
  {
    skillName: 'Vector DB',
    title: 'DeepLearning.AI: Vector Databases for Production LLM Applications',
    url: 'https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/',
    type: 'COURSE',
    isFree: true,
    provider: 'DeepLearning.AI',
  },
  {
    skillName: 'MLOps',
    title: 'Full Stack Deep Learning: MLOps Course & Production Pipelines',
    url: 'https://fullstackdeeplearning.com/course/2022/',
    type: 'COURSE',
    isFree: true,
    provider: 'FSDL',
  },
  {
    skillName: 'MLOps',
    title: 'Made With ML: End-to-End MLOps Engine Architecture',
    url: 'https://madewithml.com/',
    type: 'COURSE',
    isFree: true,
    provider: 'Made With ML',
  },
  {
    skillName: 'Experiment Tracking',
    title: 'Weights & Biases: Interactive Experiment Tracking & Hyperparameter Sweeps',
    url: 'https://wandb.ai/site/courses',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Weights & Biases',
  },
  {
    skillName: 'Experiment Tracking',
    title: 'MLflow Tracking: Metrics, Parameters & Artifacts Logging',
    url: 'https://mlflow.org/docs/latest/tracking.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'MLflow Docs',
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
    skillName: 'Model Deployment',
    title: 'Triton Inference Server Documentation & High-Throughput Serving',
    url: 'https://docs.nvidia.com/deeplearning/triton-inference-server/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'NVIDIA',
  },

  // =========================================================================
  // 4. CORE SYSTEMS, WEB BACKEND & DISTRIBUTED ARCHITECTURE
  // =========================================================================
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
    skillName: 'Python',
    title: 'NPTEL: The Joy of Computing using Python (Prof. Sudarshan Iyengar, IIT Ropar)',
    url: 'https://nptel.ac.in/courses/106106182',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Ropar',
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
    title: 'Build High-Throughput APIs with FastAPI, PostgreSQL & Pydantic',
    url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp YouTube',
  },
  {
    skillName: 'Django',
    title: 'Writing Your First Django App: Complete Step-by-Step Guide',
    url: 'https://docs.djangoproject.com/en/5.0/intro/tutorial01/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Django Software Foundation',
  },
  {
    skillName: 'Django',
    title: 'MDN Web Docs: Django Web Framework (Python) Comprehensive Guide',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'MDN Web Docs',
  },
  {
    skillName: 'Go',
    title: 'A Tour of Go: Interactive Concurrency, Goroutines & Channels',
    url: 'https://go.dev/tour/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Go Dev Team',
  },
  {
    skillName: 'Go',
    title: 'Go by Example: Hands-on Idiomatic Go Patterns & Interfaces',
    url: 'https://gobyexample.com/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Go by Example',
  },
  {
    skillName: 'Go',
    title: 'Go Programming by Example for High-Throughput Distributed Microservices',
    url: 'https://www.youtube.com/watch?v=YS4e4q9oBaU',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'Java',
    title: 'NPTEL: Programming in Java (Prof. Debasis Samanta, IIT Kharagpur)',
    url: 'https://nptel.ac.in/courses/106105192',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Kharagpur',
  },
  {
    skillName: 'Java',
    title: 'Baeldung: Core Java Tutorials, Generics & Concurrency Masterclass',
    url: 'https://www.baeldung.com/category/java/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Baeldung',
  },
  {
    skillName: 'Spring Boot',
    title: 'Spring Boot Quickstart Guide: Building RESTful Web Services',
    url: 'https://spring.io/quickstart',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'VMware Tanzu / Spring',
  },
  {
    skillName: 'Spring Boot',
    title: 'Java Brains: Spring Boot Microservices Architecture & Cloud Integration',
    url: 'https://www.youtube.com/playlist?list=PLqq-6Pq4lTTYrJ633A4s_L_7iH6r8hE6S',
    type: 'VIDEO',
    isFree: true,
    provider: 'Java Brains',
  },
  {
    skillName: 'Node.js',
    title: 'Node.js Official Documentation: Architecture, Event Loop & Streams',
    url: 'https://nodejs.org/en/docs/guides',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'OpenJS Foundation',
  },
  {
    skillName: 'Node.js',
    title: 'Node.js and Express.js Full Course with Real-time APIs',
    url: 'https://www.freecodecamp.org/news/free-8-hour-node-js-express-course/',
    type: 'COURSE',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'TypeScript',
    title: 'TypeScript Official Handbook: Types, Generics & Type Narrowing',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Microsoft',
  },
  {
    skillName: 'TypeScript',
    title: 'Total TypeScript: Beginner to Pro Interactive Tutorial',
    url: 'https://www.totaltypescript.com/tutorials',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Matt Pocock / Total TypeScript',
  },
  {
    skillName: 'HTTP',
    title: 'MDN Web Docs: HTTP Overview, Headers, Methods & Status Codes',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'MDN Web Docs',
  },
  {
    skillName: 'HTTP',
    title: 'Cloudflare: What is HTTP and How Web Communication Operates',
    url: 'https://www.cloudflare.com/learning/ddos/glossary/hypertext-transfer-protocol-http/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Cloudflare',
  },
  {
    skillName: 'REST API',
    title: 'RESTful API Architecture and Best Practices Guide',
    url: 'https://restfulapi.net/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Restful API Net',
  },
  {
    skillName: 'REST API',
    title: 'Microsoft Azure REST API Guidelines & Idempotency Rules',
    url: 'https://github.com/microsoft/api-guidelines',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Microsoft',
  },
  {
    skillName: 'Database Design',
    title: 'NPTEL: Database Design - Relational Modeling & Normalization (IIT Madras)',
    url: 'https://nptel.ac.in/courses/106106093',
    type: 'COURSE',
    isFree: true,
    provider: 'NPTEL / IIT Madras',
  },
  {
    skillName: 'Database Design',
    title: 'Database Star: Relational Database Schema Design & Normalization Rules',
    url: 'https://www.databasestar.com/database-design/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Database Star',
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
    skillName: 'Redis',
    title: 'Redis Official Documentation: Data Types, Commands & Eviction Policies',
    url: 'https://redis.io/docs/latest/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Redis Docs',
  },
  {
    skillName: 'Kafka',
    title: 'Confluent Developer: Apache Kafka 101 Fundamentals',
    url: 'https://developer.confluent.io/courses/apache-kafka/fundamentals/',
    type: 'COURSE',
    isFree: true,
    provider: 'Confluent',
  },
  {
    skillName: 'Kafka',
    title: 'Apache Kafka Official Documentation: Distributed Commit Log & Streaming',
    url: 'https://kafka.apache.org/documentation/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Apache Software Foundation',
  },
  {
    skillName: 'gRPC',
    title: 'gRPC Core Concepts & Architecture Guide',
    url: 'https://grpc.io/docs/what-is-grpc/core-concepts/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'CNCF / gRPC',
  },
  {
    skillName: 'gRPC',
    title: 'Protocol Buffers (Proto3) Language Guide & Microservice Serialization',
    url: 'https://protobuf.dev/programming-guides/proto3/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Google Developers',
  },
  {
    skillName: 'System Design',
    title: 'MIT 6.824: Distributed Systems (Prof. Robert Morris)',
    url: 'https://pdos.csail.mit.edu/6.824/',
    type: 'COURSE',
    isFree: true,
    provider: 'MIT OpenCourseWare',
  },
  {
    skillName: 'System Design',
    title: 'The System Design Primer: Scalable Architectures & Distributed Caching',
    url: 'https://github.com/donnemartin/system-design-primer',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Donne Martin',
  },

  // =========================================================================
  // 5. CLOUD, DEVOPS & INFRASTRUCTURE
  // =========================================================================
  {
    skillName: 'Git & GitHub',
    title: 'Pro Git Book (Complete Reference Manual)',
    url: 'https://git-scm.com/book/en/v2',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Git SCM',
  },
  {
    skillName: 'Git & GitHub',
    title: 'GitHub Skills: Interactive Introduction to GitHub & Git Flow',
    url: 'https://skills.github.com/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'GitHub Skills',
  },
  {
    skillName: 'Git & GitHub',
    title: 'Git and GitHub for Beginners Crash Course',
    url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'Linux',
    title: 'Introduction to Linux (LFS101x): Command Line & Shell Fundamentals',
    url: 'https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux',
    type: 'COURSE',
    isFree: true,
    provider: 'The Linux Foundation',
  },
  {
    skillName: 'Linux',
    title: 'Linux Journey: Grasshopper to Penguin Interactive CLI Tutorials',
    url: 'https://linuxjourney.com/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Linux Journey',
  },
  {
    skillName: 'Linux',
    title: 'OverTheWire: Bandit Wargame - Terminal & Shell Mastery',
    url: 'https://overthewire.org/wargames/bandit/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'OverTheWire',
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
    skillName: 'Docker',
    title: 'Play with Docker: Interactive In-Browser Container Labs',
    url: 'https://labs.play-with-docker.com/',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Docker Labs',
  },
  {
    skillName: 'Kubernetes',
    title: 'Introduction to Kubernetes (LFS158x)',
    url: 'https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes',
    type: 'COURSE',
    isFree: true,
    provider: 'CNCF / The Linux Foundation',
  },
  {
    skillName: 'Kubernetes',
    title: 'Kubernetes Documentation: Architecture, Pods, Deployments & Services',
    url: 'https://kubernetes.io/docs/home/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Kubernetes.io',
  },
  {
    skillName: 'Kubernetes',
    title: 'Killercoda: Interactive Kubernetes Debugging & Cluster Scenarios',
    url: 'https://killercoda.com/playgrounds/scenario/kubernetes',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'Killercoda',
  },
  {
    skillName: 'CI/CD',
    title: 'GitHub Actions Documentation: Workflows, Triggers & Matrix Builds',
    url: 'https://docs.github.com/en/actions',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'GitHub Docs',
  },
  {
    skillName: 'CI/CD',
    title: 'DevOps CI/CD Pipelines with GitHub Actions and Automated Testing',
    url: 'https://www.youtube.com/watch?v=R8_veQiYBjI',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'Backend Deployment',
    title: 'Deploying and Securing Production Web Applications with Nginx & Systemd',
    url: 'https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'DigitalOcean',
  },
  {
    skillName: 'Backend Deployment',
    title: 'Fly.io / Render: Production Microservices & Zero-Downtime Deployment',
    url: 'https://fly.io/docs/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Fly.io',
  },

  // =========================================================================
  // 6. CYBER DEFENSE, SECURITY & CODE QUALITY
  // =========================================================================
  {
    skillName: 'Authentication',
    title: 'Auth0: Modern Web Authentication, JWTs, Cookies & OAuth 2.0',
    url: 'https://auth0.com/intro-to-iam/what-is-authentication',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'Auth0 by Okta',
  },
  {
    skillName: 'Authentication',
    title: 'Authentication & Authorization in Web Applications Full Course',
    url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
    type: 'VIDEO',
    isFree: true,
    provider: 'freeCodeCamp',
  },
  {
    skillName: 'API Security',
    title: 'OWASP API Security Top 10 Reference Guide',
    url: 'https://owasp.org/www-project-api-security/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'OWASP Foundation',
  },
  {
    skillName: 'API Security',
    title: 'PortSwigger Web Security Academy: Free Interactive API Security Labs',
    url: 'https://portswigger.net/web-security',
    type: 'INTERACTIVE',
    isFree: true,
    provider: 'PortSwigger',
  },
  {
    skillName: 'Testing',
    title: 'PyTest Official Documentation: Fixtures, Mocking & Parameterization',
    url: 'https://docs.pytest.org/en/stable/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'pytest.org',
  },
  {
    skillName: 'Testing',
    title: 'Testing Python & Node Services: Unit, Integration & API Contract Testing',
    url: 'https://testdriven.io/guides/',
    type: 'DOCUMENTATION',
    isFree: true,
    provider: 'TestDriven.io',
  },
];

/**
 * Common skill name aliases to gracefully connect resources to database records
 * regardless of slight name variations (e.g. "Git" vs "Git & GitHub").
 */
const SKILL_ALIASES: Record<string, string[]> = {
  'git': ['git & github', 'git'],
  'git & github': ['git', 'git & github'],
  'rest api': ['rest apis', 'rest api design', 'rest api'],
  'sql': ['sql & relational databases', 'sql'],
  'database design': ['database design', 'database schema design', 'database & schema design'],
  'pandas': ['pandas & data wrangling', 'pandas'],
  'http': ['http & web architecture', 'http protocols & rest standards', 'http'],
  'linear algebra': ['linear algebra & matrix operations', 'linear algebra'],
  'machine learning fundamentals': ['supervised & unsupervised learning', 'machine learning fundamentals'],
  'docker': ['docker containerization', 'docker'],
  'system design': ['system design & distributed systems', 'system design'],
};

/** ML domain skill names to assign proper role when auto-provisioning */
const ML_SKILL_NAMES = new Set([
  'linear algebra',
  'statistics',
  'numpy',
  'pandas',
  'data preprocessing',
  'feature engineering',
  'data visualization',
  'machine learning fundamentals',
  'scikit-learn',
  'model evaluation',
  'deep learning',
  'pytorch',
  'tensorflow',
  'computer vision',
  'opencv',
  'nlp',
  'vector db',
  'mlops',
  'experiment tracking',
  'model deployment',
]);

const SKILL_CATEGORIES: Record<string, string> = {
  'Linear Algebra': 'MATHEMATICS',
  'Statistics': 'MATHEMATICS',
  'Programming Fundamentals': 'FOUNDATION',
  'NumPy': 'DATA',
  'Pandas': 'DATA',
  'Data Preprocessing': 'DATA',
  'Feature Engineering': 'MACHINE_LEARNING',
  'Data Visualization': 'DATA',
  'SQL': 'DATABASE',
  'PostgreSQL': 'DATABASE',
  'MySQL': 'DATABASE',
  'Machine Learning Fundamentals': 'MACHINE_LEARNING',
  'Scikit-Learn': 'MACHINE_LEARNING',
  'Model Evaluation': 'MACHINE_LEARNING',
  'Deep Learning': 'DEEP_LEARNING',
  'PyTorch': 'FRAMEWORK',
  'TensorFlow': 'FRAMEWORK',
  'Computer Vision': 'MACHINE_LEARNING',
  'OpenCV': 'MACHINE_LEARNING',
  'NLP': 'MACHINE_LEARNING',
  'Vector DB': 'DATABASE',
  'MLOps': 'MLOPS',
  'Experiment Tracking': 'MLOPS',
  'Model Deployment': 'DEPLOYMENT',
  'Python': 'PROGRAMMING',
  'FastAPI': 'FRAMEWORK',
  'Django': 'FRAMEWORK',
  'Go': 'PROGRAMMING',
  'Java': 'PROGRAMMING',
  'Spring Boot': 'FRAMEWORK',
  'Node.js': 'FRAMEWORK',
  'TypeScript': 'PROGRAMMING',
  'HTTP': 'WEB',
  'REST API': 'WEB',
  'Database Design': 'DATABASE',
  'Redis': 'DATABASE',
  'Kafka': 'ARCHITECTURE',
  'gRPC': 'WEB',
  'System Design': 'ARCHITECTURE',
  'Git & GitHub': 'TOOLS',
  'Linux': 'DEVOPS',
  'Docker': 'DEVOPS',
  'Kubernetes': 'DEVOPS',
  'CI/CD': 'DEVOPS',
  'Backend Deployment': 'DEPLOYMENT',
  'Authentication': 'SECURITY',
  'API Security': 'SECURITY',
  'Testing': 'QUALITY',
};

export async function seedResources(): Promise<number> {
  console.log('🌱 Seeding learning resources into PostgreSQL...');
  let inserted = 0;

  for (const item of RESOURCES_SEED) {
    // 1. Try finding the skill directly by name
    let skillRes = await query<{ id: string }>(
      `SELECT id FROM skills WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [item.skillName]
    );

    // 2. Check aliases if not found directly
    if (skillRes.rows.length === 0) {
      const aliases = SKILL_ALIASES[item.skillName.toLowerCase()] || [];
      for (const alias of aliases) {
        skillRes = await query<{ id: string }>(
          `SELECT id FROM skills WHERE LOWER(name) = LOWER($1) LIMIT 1`,
          [alias]
        );
        if (skillRes.rows.length > 0) {
          break;
        }
      }
    }

    let skillId: string | undefined = skillRes.rows[0]?.id;

    // 3. If skill still not in database, ensure it exists under a valid role
    if (!skillId) {
      const isML = ML_SKILL_NAMES.has(item.skillName.toLowerCase());
      const targetRoleName = isML ? 'Machine Learning Engineer' : 'Backend Developer';

      const roleRes = await query<{ id: string }>(
        `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
        [targetRoleName]
      );

      const roleId = roleRes.rows[0]?.id;
      if (roleId) {
        const category = SKILL_CATEGORIES[item.skillName] || (isML ? 'MACHINE_LEARNING' : 'BACKEND');
        const insertedSkill = await query<{ id: string }>(
          `
          INSERT INTO skills (role_id, name, description, category)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (role_id, name) DO UPDATE SET description = EXCLUDED.description
          RETURNING id
          `,
          [
            roleId,
            item.skillName,
            `${item.skillName} core engineering concepts and practical applications.`,
            category,
          ]
        );
        skillId = insertedSkill.rows[0]?.id;
      }
    }

    if (!skillId) {
      console.warn(`⚠️ Could not resolve skill ID for "${item.skillName}". Skipping.`);
      continue;
    }

    // 4. Check if resource already exists (idempotency check)
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
