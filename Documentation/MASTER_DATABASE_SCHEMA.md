# Master Database Schema — Single Source of Truth
**Project:** Vidyut (Adaptive Career & Skill Trainer)  
**Database:** PostgreSQL 16 (Relational DB + JSONB)  
**Shared Across:** All Backend, Data, and AI Modules

---

## 1. Authentication & Users (Owned by Team Leader)

### Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `gen_random_uuid()` | Unique user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | VARCHAR(50) | NOT NULL | `STUDENT`, `INSTITUTION`, `INDUSTRY`, `ADMIN` |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | Registration timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `NOW()` | Update timestamp |

---

## 2. Profiles & Entities (Owned by Team Leader)

### Table: `student_profiles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `gen_random_uuid()` | Unique profile ID |
| `user_id` | UUID | UNIQUE, REFERENCES `users(id)` ON DELETE CASCADE | Linked user account |
| `full_name` | VARCHAR(255) | NOT NULL | Student's full name |
| `institution` | VARCHAR(255) | NOT NULL | College / university name |
| `degree` | VARCHAR(255) | NOT NULL | e.g. "B.Tech CSE" |
| `year_of_study` | INTEGER | NOT NULL | 1, 2, 3, or 4 |
| `interests` | TEXT[] | NULLABLE | Array of interest tags |
| `selected_role_id` | UUID | NULLABLE, REFERENCES `roles(id)` | Chosen target role |
| `readiness_pct` | FLOAT | DEFAULT 0.0 | Cached overall readiness score (0-100) |
| `created_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Timestamp |

### Table: `institutions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `gen_random_uuid()` | Unique institution ID |
| `user_id` | UUID | UNIQUE, REFERENCES `users(id)` | Admin user account |
| `college_name` | VARCHAR(255) | NOT NULL | Official institution name |
| `aishe_code` | VARCHAR(100) | NULLABLE | Government AISHE ID |
| `officer_name` | VARCHAR(255) | NOT NULL | Placement director / TPO |
| `departments` | TEXT[] | NOT NULL | e.g. `['CSE', 'IT', 'ECE']` |

### Table: `companies`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, default `gen_random_uuid()` | Unique company ID |
| `user_id` | UUID | UNIQUE, REFERENCES `users(id)` | Recruiter user account |
| `company_name` | VARCHAR(255) | NOT NULL | Company name |
| `sector` | VARCHAR(100) | NOT NULL | e.g. "Artificial Intelligence", "Fintech" |
| `website` | VARCHAR(255) | NULLABLE | Official URL |

---

## 3. Career & Skill Graph (DAG) (Owned by Member 4)

### Table: `domains`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique domain ID (e.g. `domain-ai-ml`) |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | "Data and AI", "Software Engineering" |
| `description` | TEXT | NOT NULL | Summary of what professionals do |
| `demand_level` | VARCHAR(50) | NOT NULL | `HIGH`, `MODERATE`, `EMERGING` |
| `top_technologies` | TEXT[] | NOT NULL | e.g. `['Python', 'SQL', 'PyTorch']` |
| `display_order` | INTEGER | DEFAULT 0 | Ordering index |

### Table: `roles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Role ID (e.g. `role-ml-engineer`) |
| `domain_id` | UUID | REFERENCES `domains(id)` | Parent domain |
| `name` | VARCHAR(255) | NOT NULL | "Machine Learning Engineer" |
| `description` | TEXT | NOT NULL | Role description |
| `target_level` | VARCHAR(50) | DEFAULT 'ENTRY' | `ENTRY`, `MID`, `SENIOR` |

### Table: `skills`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Skill ID (e.g. `skill-python`) |
| `role_id` | UUID | REFERENCES `roles(id)` | Primary role |
| `name` | VARCHAR(255) | NOT NULL | "Python Language", "Docker" |
| `category` | VARCHAR(255) | NOT NULL | Competency cluster |
| `target_proficiency` | VARCHAR(50) | NOT NULL | `AWARENESS`, `BEGINNER`, `INTERMEDIATE`, `PROFICIENT`, `EXPERT` |
| `weight` | FLOAT | DEFAULT 1.0 | Importance multiplier (0.5 to 2.0) |

### Table: `skill_prerequisites` (Directed Edges of DAG)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `skill_id` | UUID | REFERENCES `skills(id)` | Dependent skill |
| `prerequisite_id` | UUID | REFERENCES `skills(id)` | Must be learned *before* `skill_id` |
| **PRIMARY KEY** | `(skill_id, prerequisite_id)` | Composite key | Directed edge |

### Table: `technology_branches` (Decision Points)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Branch ID |
| `parent_skill_id` | UUID | REFERENCES `skills(id)` | The node where branching occurs |
| `name` | VARCHAR(255) | NOT NULL | "PyTorch", "TensorFlow", "FastAPI" |
| `is_decision_point` | BOOLEAN | DEFAULT TRUE | Indicates branch selection required |

---

## 4. Student Skill State & Assessments (Owned by Member 4)

### Table: `student_skill_states`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID |
| `student_id` | UUID | REFERENCES `student_profiles(id)` | The student |
| `skill_id` | UUID | REFERENCES `skills(id)` | Evaluated skill |
| `self_rating` | VARCHAR(50) | NULLABLE | Student rating (`NOT_FAMILIAR`, `BEGINNER`, etc.) |
| `assessed_level` | VARCHAR(50) | NOT NULL | Actual test result (`AWARENESS` through `EXPERT`) |
| `score_pct` | FLOAT | DEFAULT 0.0 | Raw MCQ percentage (0-100) |
| `confidence` | VARCHAR(20) | DEFAULT 'MEDIUM' | `HIGH` (matched self-rating), `LOW` (discrepancy) |
| `last_assessed_at`| TIMESTAMPTZ | DEFAULT `NOW()` | Timestamp |
| **UNIQUE** | `(student_id, skill_id)` | Composite unique | One row per student per skill |

### Table: `questions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Question ID |
| `skill_id` | UUID | REFERENCES `skills(id)` | Tested skill |
| `proficiency_level`| VARCHAR(50) | NOT NULL | Target level tested |
| `question_text` | TEXT | NOT NULL | The MCQ question |
| `options` | JSONB | NOT NULL | `[{"label": "A", "text": "...", "is_correct": true}]` |
| `explanation` | TEXT | NOT NULL | Why the correct option is right |
| `difficulty` | VARCHAR(50) | NOT NULL | `EASY`, `MEDIUM`, `HARD` |

### Table: `assessment_sessions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Session ID |
| `student_id` | UUID | REFERENCES `student_profiles(id)` | Student taking test |
| `role_id` | UUID | REFERENCES `roles(id)` | Target role |
| `status` | VARCHAR(50) | DEFAULT 'PENDING' | `PENDING`, `COMPLETED` |
| `total_questions` | INTEGER | NOT NULL | Number of questions |
| `completed_at` | TIMESTAMPTZ | NULLABLE | Completion timestamp |

---

## 5. Adaptive Roadmap (Owned by Member 4)

### Table: `roadmap_states`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Roadmap ID |
| `student_id` | UUID | UNIQUE, REFERENCES `student_profiles(id)` | Associated student |
| `role_id` | UUID | REFERENCES `roles(id)` | Target role |
| `last_updated_at`| TIMESTAMPTZ | DEFAULT `NOW()` | Timestamp |

### Table: `milestones`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Milestone ID |
| `roadmap_state_id`| UUID | REFERENCES `roadmap_states(id)` | Parent roadmap |
| `skill_id` | UUID | REFERENCES `skills(id)` | Associated skill |
| `phase_number` | INTEGER | NOT NULL | Grouping phase (1 through 6) |
| `sequence_order` | INTEGER | NOT NULL | Topologically sorted order |
| `status` | VARCHAR(50) | NOT NULL | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `BRANCH_PENDING` |
| `branch_chosen_id`| UUID | NULLABLE, REFERENCES `technology_branches(id)` | Selected branch if decision point |

---

## 6. Opportunity Index (Owned by Member 5)

### Table: `opportunities`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Opportunity ID |
| `external_id` | VARCHAR(512) | NULLABLE | Identifier on source website |
| `source` | VARCHAR(50) | NOT NULL | `UNSTOP`, `INTERNSHALA`, `AICTE`, `DIRECT` |
| `original_url` | TEXT | NOT NULL | Redirect URL for application |
| `title` | TEXT | NOT NULL | Opportunity title |
| `organization` | TEXT | NOT NULL | Company / Host organization |
| `type` | VARCHAR(50) | NOT NULL | `INTERNSHIP`, `HACKATHON`, `PROJECT` |
| `mode` | VARCHAR(50) | NOT NULL | `REMOTE`, `ON_SITE`, `HYBRID` |
| `location` | TEXT | NULLABLE | City / Country |
| `deadline` | DATE | NULLABLE | Application cutoff |
| `stipend` | TEXT | NULLABLE | Stipend or prize description |
| `description_raw`| TEXT | NOT NULL | Full text description |
| `fingerprint` | VARCHAR(512) | UNIQUE, NOT NULL | Hash of `(source+external_id)` or `(title+org+deadline)` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Availability status |
| `extracted_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Ingestion timestamp |

### Table: `opportunity_skill_tags`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `opportunity_id` | UUID | REFERENCES `opportunities(id)` ON DELETE CASCADE | Linked opportunity |
| `skill_id` | UUID | REFERENCES `skills(id)` | Canonical skill ID |
| `raw_mention` | TEXT | NULLABLE | Extracted raw text keyword |
| `min_proficiency`| VARCHAR(50) | DEFAULT 'BEGINNER' | Required level |
| **PRIMARY KEY** | `(opportunity_id, skill_id)` | Composite key | Tag association |

---

## 7. Recommendations & Explanations (Owned by Member 6)

### Table: `recommendations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Recommendation ID |
| `student_id` | UUID | REFERENCES `student_profiles(id)` | Recipient student |
| `opportunity_id` | UUID | REFERENCES `opportunities(id)` | Evaluated opportunity |
| `compatibility_score`| FLOAT | NOT NULL | Calculated score (0.0 to 1.0) |
| `segment` | VARCHAR(50) | NOT NULL | `READY_NOW`, `ALMOST_READY`, `ASPIRATIONAL` |
| `explanation_json`| JSONB | NOT NULL | `{ "summary": "...", "matching_skills": [], "gap_skills": [] }` |
| `generated_at` | TIMESTAMPTZ | DEFAULT `NOW()` | Recalculation timestamp |
| **UNIQUE** | `(student_id, opportunity_id)` | Composite unique | One recommendation record per pair |
