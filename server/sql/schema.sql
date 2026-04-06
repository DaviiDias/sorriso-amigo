CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'caregiver',
  accepted_terms_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_checklists (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checklist_date DATE NOT NULL,
  brushing_morning BOOLEAN NOT NULL DEFAULT false,
  brushing_afternoon BOOLEAN NOT NULL DEFAULT false,
  brushing_night BOOLEAN NOT NULL DEFAULT false,
  resistance_level VARCHAR(16) NOT NULL CHECK (resistance_level IN ('none', 'light', 'moderate', 'severe')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, checklist_date)
);

CREATE TABLE IF NOT EXISTS guide_steps (
  id SERIAL PRIMARY KEY,
  step_order INT NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  explanation TEXT NOT NULL,
  UNIQUE (question_id, option_text)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_id INT,
  is_correct BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS educational_videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  audience VARCHAR(80) NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_times JSONB NOT NULL DEFAULT '[]'::jsonb,
  accessibility_mode VARCHAR(32) NOT NULL DEFAULT 'default',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_checklists_user_date
  ON daily_checklists (user_id, checklist_date DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user
  ON quiz_attempts (user_id, created_at DESC);
