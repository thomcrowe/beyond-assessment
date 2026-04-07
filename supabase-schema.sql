-- Run this in your Supabase SQL editor

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  status text not null default 'in_progress', -- in_progress | submitted
  created_at timestamptz default now(),
  submitted_at timestamptz
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  task_number int not null, -- 1, 2, 3
  -- Task 1 & 2 fields
  response_text text,
  -- Task 3 specific fields
  ai_prompt text,
  ai_output text,
  ai_interpretation text,
  ai_recommendation text,
  -- Meta
  completed boolean default false,
  saved_at timestamptz default now(),
  unique(candidate_id, task_number)
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  reviewer_email text not null,
  -- Task 1 dimensions
  t1_problem_identification int check (t1_problem_identification between 1 and 4),
  t1_data_use int check (t1_data_use between 1 and 4),
  t1_intervention_quality int check (t1_intervention_quality between 1 and 4),
  t1_prioritization int check (t1_prioritization between 1 and 4),
  -- Task 2 dimensions
  t2_correct_diagnosis int check (t2_correct_diagnosis between 1 and 4),
  t2_metrics_interpretation int check (t2_metrics_interpretation between 1 and 4),
  t2_recommendation_quality int check (t2_recommendation_quality between 1 and 4),
  t2_funnel_awareness int check (t2_funnel_awareness between 1 and 4),
  -- Task 3 dimensions
  t3_prompt_quality int check (t3_prompt_quality between 1 and 4),
  t3_ai_output_evaluation int check (t3_ai_output_evaluation between 1 and 4),
  t3_data_grounding int check (t3_data_grounding between 1 and 4),
  t3_ai_fluency int check (t3_ai_fluency between 1 and 4),
  t3_speed_decisiveness int check (t3_speed_decisiveness between 1 and 4),
  -- Disqualifiers
  dq_no_data boolean default false,
  dq_missed_email2 boolean default false,
  dq_no_ai_interpretation boolean default false,
  -- Notes
  overall_notes text,
  scored_at timestamptz default now()
);

-- Enable RLS
alter table candidates enable row level security;
alter table submissions enable row level security;
alter table scores enable row level security;

-- Allow all operations via anon key (app handles auth logic)
create policy "allow all" on candidates for all using (true) with check (true);
create policy "allow all" on submissions for all using (true) with check (true);
create policy "allow all" on scores for all using (true) with check (true);
