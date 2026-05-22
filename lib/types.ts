export type CandidateStatus = 'in_progress' | 'submitted'

export interface Candidate {
  id: string
  email: string
  name: string
  status: CandidateStatus
  created_at: string
  submitted_at: string | null
}

export interface Submission {
  id: string
  candidate_id: string
  task_number: number
  response_text: string | null
  ai_prompt: string | null
  ai_output: string | null
  ai_interpretation: string | null
  ai_recommendation: string | null
  completed: boolean
  saved_at: string
}

export interface Score {
  id: string
  candidate_id: string
  reviewer_name: string
  t1_problem_identification: number | null
  t1_data_use: number | null
  t1_intervention_quality: number | null
  t1_prioritization: number | null
  t2_correct_diagnosis: number | null
  t2_metrics_interpretation: number | null
  t2_recommendation_quality: number | null
  t2_funnel_awareness: number | null
  t3_prompt_quality: number | null
  t3_ai_output_evaluation: number | null
  t3_data_grounding: number | null
  t3_ai_fluency: number | null
  t3_speed_decisiveness: number | null
  dq_no_data: boolean
  dq_missed_email2: boolean
  dq_no_ai_interpretation: boolean
  overall_notes: string | null
  scored_at: string
}

export interface ScoreWithTotal extends Score {
  total: number
  recommendation: string
  disqualified: boolean
}

export function calcTotal(s: Partial<Score>): number {
  const dims: number[] = [
    s.t1_problem_identification, s.t1_data_use, s.t1_intervention_quality, s.t1_prioritization,
    s.t2_correct_diagnosis, s.t2_metrics_interpretation, s.t2_recommendation_quality, s.t2_funnel_awareness,
    s.t3_prompt_quality, s.t3_ai_output_evaluation, s.t3_data_grounding, s.t3_ai_fluency, s.t3_speed_decisiveness,
  ].map(v => v ?? 0)
  return dims.reduce((sum, v) => sum + v, 0)
}

export function scoreLabel(total: number): { label: string; color: string } {
  if (total >= 34) return { label: 'Exceptional — Strong hire signal', color: '#3bc1cc' }
  if (total >= 26) return { label: 'Strong — Minor gaps worth probing', color: '#02556c' }
  if (total >= 18) return { label: 'Developing — Panel review recommended', color: '#f59e0b' }
  return { label: 'Not ready for this scope', color: '#ee3968' }
}

// Assessment content data
export const FUNNEL_DATA = {
  goals: [
    { metric: 'OTA / PMS Connection Rate (of Signups)', goal: '25%', actual: '14%' },
    { metric: 'Listing Enable Rate (of Trial Starters)', goal: '18%', actual: '19%' },
  ],
  stages: [
    { stage: 'New Signups', volume: '9,400', convPrior: '--', convSignup: '--' },
    { stage: 'OTA / PMS Connected', volume: '1,316', convPrior: '14%', convSignup: '14%' },
    { stage: 'Card Added', volume: '468', convPrior: '36%', convSignup: '5%' },
    { stage: 'Trial Started', volume: '621', convPrior: '133%*', convSignup: '6.6%' },
    { stage: 'Listing Enabled (Active)', volume: '118', convPrior: '19%', convSignup: '1.3%' },
  ],
  traffic: [
    { month: 'September', sessions: '194,000', users: '63,800', newUsers: '43,200' },
    { month: 'October', sessions: '209,000', users: '79,600', newUsers: '57,400' },
    { month: 'November', sessions: '197,000', users: '93,500', newUsers: '80,100' },
    { month: 'December', sessions: '184,000', users: '89,200', newUsers: '78,900' },
    { month: 'January', sessions: '206,000', users: '94,100', newUsers: '83,800' },
    { month: 'February', sessions: '175,000', users: '74,600', newUsers: '64,300' },
  ],
  paid: [
    { channel: 'Google Search (Brand)', spend: '$17,200', clicks: '20,800', signups: '1,720', cps: '$10' },
    { channel: 'Google Search (Non-Brand)', spend: '$29,400', clicks: '17,300', signups: '396', cps: '$74' },
    { channel: 'Meta (Prospecting)', spend: '$21,600', clicks: '39,100', signups: '274', cps: '$79' },
    { channel: 'Meta (Retargeting)', spend: '$8,100', clicks: '18,200', signups: '292', cps: '$28' },
    { channel: 'LinkedIn', spend: '$8,600', clicks: '3,900', signups: '45', cps: '$191' },
  ],
}

export const EMAIL_METRICS = [
  { name: 'Email 1: Welcome to Beyond', timing: 'Immediately on signup', sends: '7,800', openRate: '58%', clickRate: '24%', unsubRate: '0.2%' },
  { name: 'Email 2: Understanding Your Pricing', timing: 'Day 3', sends: '6,900', openRate: '29%', clickRate: '1.2%', unsubRate: '2.4%' },
  { name: 'Email 3: Your Listing, Your Control', timing: 'Day 6', sends: '5,400', openRate: '33%', clickRate: '8.1%', unsubRate: '0.6%' },
  { name: 'Email 4: Your First Rate Is Ready', timing: 'Trigger: listing connected', sends: '1,180', openRate: '63%', clickRate: '38%', unsubRate: '0.1%' },
]

export const EMAIL_COPY = [
  {
    number: 1,
    name: 'Email 1: Welcome to Beyond',
    from: 'Jamie from Beyond',
    subject: "You're in. Here's what happens next.",
    body: `Hey {{first_name}},

Welcome to Beyond. You've made a smart move.

Beyond uses real-time demand data, local market signals, and your listing's own performance history to set the right price every night. Not too high to scare off bookings. Not too low to leave money on the table.

Here's what's happening right now:

We're analyzing your market. We're looking at comparable listings in {{market}}, upcoming demand events, and seasonal trends to build your pricing foundation.

To start seeing personalized recommendations, connect your PMS or OTA account. It takes about 5 minutes and unlocks everything.

Connect your account and get your first recommendations.

In your corner,
Jamie from Beyond`,
  },
  {
    number: 2,
    name: 'Email 2: Understanding Your Pricing',
    from: 'Jamie from Beyond',
    subject: 'How Beyond thinks about your prices',
    body: `Hey {{first_name}},

A lot of hosts ask us: what exactly is Beyond doing to my prices?

It's a fair question. Here's how it works.

Beyond uses two important anchors when building your nightly rates: your base price and your minimum price.

Your base price is the starting point -- the rate Beyond uses as a reference for a typical night in your market. Think of it as your middle-of-the-road expectation before demand signals come into play.

Your minimum price is your floor. It's the lowest price Beyond will ever post for your listing, no matter what the algorithm suggests. It's there to make sure you never give away a night below what makes sense for your property.

Together, these two numbers give Beyond the range it needs to price dynamically -- moving up when demand spikes, staying grounded when demand softens, and never going below what you've told us is your limit.

Hosts who take time to understand these settings tend to feel more confident in how Beyond operates and see stronger results over time.

More soon,
Jamie from Beyond`,
  },
  {
    number: 3,
    name: 'Email 3: Your Listing, Your Control',
    from: 'Jamie from Beyond',
    subject: "You're always in control of your pricing",
    body: `Hey {{first_name}},

One thing we hear from hosts before they get started: "What if I don't like what Beyond sets?"

The answer is simple. You're always in control.

Beyond makes recommendations. You decide what gets posted. And you can override any price, any time, for any date -- no restrictions, no friction.

Here's what that looks like in practice:

Your minimum price is always respected. If you've told Beyond your floor is $120, we will never post below $120. No exceptions.

You can block out dates, adjust rates for specific windows, or override individual nights whenever you want. Beyond adjusts around your changes automatically.

Your calendar always reflects what's actually posted -- so there are no surprises.

Hosts in {{market}} who enable Beyond pricing see their calendar fill faster because the rates are competitive in real time, not set once and forgotten.

Enable pricing for your listing and see your calendar come to life.

In your corner,
Jamie from Beyond`,
  },
  {
    number: 4,
    name: 'Email 4: Your First Rate Is Ready (Triggered)',
    from: 'Jamie from Beyond',
    subject: 'Your first rate recommendations are ready, {{first_name}}',
    body: `Hey {{first_name}},

You connected your account. Now the work starts.

We've already pulled your listing data, analyzed comparable properties in {{market}}, and built your first set of price recommendations. They're live in your dashboard right now.

Here's what we found:

{{#if upcoming_event_name}}
There's a demand spike coming. {{upcoming_event_name}} on {{upcoming_event_date}} is driving strong booking activity in your area. Your rates for those dates are already optimized to capture it.
{{/if}}

Your base price is set at \${{base_price}}/night based on your market and listing type. You can adjust this anytime -- it's the number Beyond uses as a reference point when building your rates.

To start posting prices to your calendar, enable pricing for your listing. It takes one click.

Enable pricing and start earning.

Let's go,
Jamie from Beyond`,
  },
]

export const RUBRIC = {
  task1: [
    {
      key: 't1_problem_identification',
      label: 'Problem Identification',
      descriptors: {
        1: 'Misses the primary activation gap or spreads focus across all stages equally',
        2: 'Identifies a drop-off but without clear prioritization logic',
        3: 'Correctly names the primary gap with reasoning tied to funnel math',
        4: 'Identifies primary and secondary signals, shows systems thinking',
      },
    },
    {
      key: 't1_data_use',
      label: 'Data Use',
      descriptors: {
        1: 'Makes claims without referencing data',
        2: 'References some data points but inconsistently',
        3: 'Backs every major claim with specific figures from the brief',
        4: 'Extracts non-obvious insights (e.g. cost-per-signup disparity, traffic vs. conversion mismatch)',
      },
    },
    {
      key: 't1_intervention_quality',
      label: 'Intervention Quality',
      descriptors: {
        1: 'Vague or generic suggestions',
        2: 'Reasonable ideas but without success metrics or rationale',
        3: 'Two or three specific, testable interventions with clear outcomes and measurement criteria',
        4: 'Interventions are sequenced, shows awareness of what to learn from each before moving on',
      },
    },
    {
      key: 't1_prioritization',
      label: 'Prioritization',
      descriptors: {
        1: 'Tries to solve everything or picks a low-leverage problem',
        2: 'Focuses on a reasonable area but rationale is thin',
        3: 'Makes a clear, defensible prioritization call and explains tradeoffs',
        4: 'Anticipates downstream consequences of the prioritization choice',
      },
    },
  ],
  task2: [
    {
      key: 't2_correct_diagnosis',
      label: 'Correct Diagnosis',
      descriptors: {
        1: 'Does not identify the problem email, or identifies it for the wrong reason',
        2: 'Identifies the right email but focuses only on metrics without analyzing the copy',
        3: 'Correctly identifies the email and links the missing CTA to poor engagement and elevated unsubscribes',
        4: 'Names the root cause precisely: educates about pricing settings but gives the reader nowhere to go',
      },
    },
    {
      key: 't2_metrics_interpretation',
      label: 'Metrics Interpretation',
      descriptors: {
        1: 'Reads metrics in isolation without connecting them to user behavior',
        2: 'Notes the low click rate but misses the unsubscribe signal',
        3: 'Connects open rate, click rate, and unsubscribe rate into a coherent story',
        4: 'Uses Email 4 performance as a benchmark for what good looks like',
      },
    },
    {
      key: 't2_recommendation_quality',
      label: 'Recommendation Quality',
      descriptors: {
        1: 'Generic fix (add a button, make it shorter)',
        2: 'Suggests a CTA without explaining what action or what outcome to expect',
        3: 'Recommends a specific CTA tied to a specific product action with rationale',
        4: 'Proposes a test framework: what to change, what to measure, what result confirms the diagnosis',
      },
    },
    {
      key: 't2_funnel_awareness',
      label: 'Funnel Awareness',
      descriptors: {
        1: 'Treats the email as standalone with no reference to funnel stage',
        2: 'Shows some awareness of funnel stage but does not connect it to the email purpose',
        3: 'Understands Day 3 is a critical momentum window and frames the fix accordingly',
        4: 'Questions whether the content itself is timed correctly given most hosts have not yet connected',
      },
    },
  ],
  task3: [
    {
      key: 't3_prompt_quality',
      label: 'Prompt Quality',
      descriptors: {
        1: 'Vague or generic prompt that could apply to any business',
        2: 'Includes some context but missing key constraints or goal clarity',
        3: 'Specific, well-structured prompt with clear context, constraints, and output format',
        4: 'Demonstrates mastery: relevant data included, specific analysis type, specifies what to avoid',
      },
    },
    {
      key: 't3_ai_output_evaluation',
      label: 'AI Output Evaluation',
      descriptors: {
        1: 'Accepts AI output uncritically or rejects it without explanation',
        2: 'Notes it is a starting point but does not identify specific gaps',
        3: 'Explicitly calls out what AI got right, what it missed, and what needed correction',
        4: 'Clear editorial layer: uses AI for synthesis, applies own judgment to prioritization and nuance',
      },
    },
    {
      key: 't3_data_grounding',
      label: 'Data Grounding',
      descriptors: {
        1: 'Recommendation is not connected to specific data from the brief',
        2: 'References data but the connection to the recommendation is loose',
        3: 'Recommendation is directly tied to specific figures and gaps in the brief',
        4: 'Recommendation is falsifiable: cites the specific metric, expected magnitude, and timeframe',
      },
    },
    {
      key: 't3_ai_fluency',
      label: 'AI Fluency',
      descriptors: {
        1: 'AI use feels like a shortcut or output is minimally edited',
        2: 'Shows basic comfort with AI tools but prompt design is underdeveloped',
        3: 'Uses AI as a genuine thinking partner, prompt reflects expertise',
        4: 'Would be a force multiplier on the team: fast, precise, applies judgment throughout',
      },
    },
    {
      key: 't3_speed_decisiveness',
      label: 'Speed and Decisiveness',
      descriptors: {
        1: 'Hedges all recommendations or fails to commit to a point of view',
        2: 'Makes a recommendation but over-qualifies with caveats',
        3: 'Clear recommendation with confident rationale, acknowledges main risk',
        4: 'Commits fully, names what they would do in first 30 days, explains what a failed experiment would tell them',
      },
    },
  ],
}
