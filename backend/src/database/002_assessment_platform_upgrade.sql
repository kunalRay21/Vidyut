-- ==============================================================================
-- Migration: 002_assessment_platform_upgrade.sql
-- Module: Calibrated Diagnostic Engine / Assessment Platform
-- Note: Non-destructive additions with safe defaults for existing tables.
-- ==============================================================================

-- A. Enhance questions table for rich format and code snippets
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) DEFAULT 'MCQ_SINGLE', -- 'MCQ_SINGLE', 'MCQ_MULTI', 'CODE_SNIPPET'
  ADD COLUMN IF NOT EXISTS code_snippet TEXT,
  ADD COLUMN IF NOT EXISTS code_language VARCHAR(50) DEFAULT 'python',
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- B. Enhance assessment_sessions for state recovery, timing, and proctoring telemetry
ALTER TABLE assessment_sessions
  ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 900,
  ADD COLUMN IF NOT EXISTS time_remaining_seconds INTEGER DEFAULT 900,
  ADD COLUMN IF NOT EXISTS current_question_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS test_title VARCHAR(255) DEFAULT 'Diagnostic Assessment';

-- C. Enhance question_responses for granular telemetry & multi-select
ALTER TABLE question_responses
  ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_marked_for_review BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS selected_options TEXT[] DEFAULT '{}';
