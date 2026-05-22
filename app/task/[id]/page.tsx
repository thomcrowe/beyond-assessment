'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FUNNEL_DATA, EMAIL_METRICS, EMAIL_COPY } from '@/lib/types'

export default function TaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = parseInt(params.id as string)

  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [completed, setCompleted] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Task 1 & 2
  const [response, setResponse] = useState('')
  // Task 3
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiOutput, setAiOutput] = useState('')
  const [aiInterpretation, setAiInterpretation] = useState('')
  const [aiRecommendation, setAiRecommendation] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('candidate_id')
    if (!id) { router.push('/'); return }
    setCandidateId(id)
    loadSubmission(id)
  }, [taskId])

  async function loadSubmission(id: string) {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('candidate_id', id)
      .eq('task_number', taskId)
      .single()

    if (data) {
      setResponse(data.response_text || '')
      setAiPrompt(data.ai_prompt || '')
      setAiOutput(data.ai_output || '')
      setAiInterpretation(data.ai_interpretation || '')
      setAiRecommendation(data.ai_recommendation || '')
      setCompleted(data.completed || false)
    }
  }

  const autoSave = useCallback(async (fields: Record<string, string>, isComplete = false) => {
    const id = localStorage.getItem('candidate_id')
    if (!id) return
    setSaving(true)
    setSaved(false)

    await supabase.from('submissions').upsert({
      candidate_id: id,
      task_number: taskId,
      response_text: fields.response || '',
      ai_prompt: fields.aiPrompt || '',
      ai_output: fields.aiOutput || '',
      ai_interpretation: fields.aiInterpretation || '',
      ai_recommendation: fields.aiRecommendation || '',
      completed: isComplete,
      saved_at: new Date().toISOString(),
    }, { onConflict: 'candidate_id,task_number' })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }, [taskId])

  function scheduleAutoSave(fields: Record<string, string>) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(fields), 1500)
  }

  function handleResponseChange(val: string) {
    setResponse(val)
    scheduleAutoSave({ response: val, aiPrompt, aiOutput, aiInterpretation, aiRecommendation })
  }

  function handleT3Change(field: string, val: string) {
    const updated = { response, aiPrompt, aiOutput, aiInterpretation, aiRecommendation, [field]: val }
    if (field === 'aiPrompt') setAiPrompt(val)
    if (field === 'aiOutput') setAiOutput(val)
    if (field === 'aiInterpretation') setAiInterpretation(val)
    if (field === 'aiRecommendation') setAiRecommendation(val)
    scheduleAutoSave(updated)
  }

  async function handleMarkComplete() {
    const fields = { response, aiPrompt, aiOutput, aiInterpretation, aiRecommendation }
    await autoSave(fields, true)
    setCompleted(true)
    router.push('/dashboard')
  }

  function canComplete() {
    if (taskId === 1 || taskId === 2) return response.trim().length > 25
    return aiPrompt.trim().length > 25 && aiOutput.trim().length > 25 && aiInterpretation.trim().length > 25 && aiRecommendation.trim().length > 25
  }

  const TASK_TITLES = ['', 'Funnel Diagnosis', 'Email Sequence Analysis', 'AI-Powered Analysis']

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ background: '#252f38', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, flexShrink: 0 }}>
        <button onClick={() => router.push('/dashboard')} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Dashboard
        </button>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Task {taskId}: {TASK_TITLES[taskId]}</span>
        <div style={{ fontSize: 12, color: saving ? '#3bc1cc' : saved ? '#3bc1cc' : '#6b7280', minWidth: 80, textAlign: 'right' }}>
          {saving ? <span className="saving">Saving...</span> : saved ? '✓ Saved' : completed ? '✓ Complete' : 'Auto-saves'}
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Brief Panel (left) */}
        <div style={{ width: '42%', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: '28px 28px', background: 'white', flexShrink: 0 }}>
          <BriefPanel taskId={taskId} />
        </div>

        {/* Response Panel (right) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
          <ResponsePanel
            taskId={taskId}
            response={response}
            aiPrompt={aiPrompt}
            aiOutput={aiOutput}
            aiInterpretation={aiInterpretation}
            aiRecommendation={aiRecommendation}
            completed={completed}
            canComplete={canComplete()}
            onResponseChange={handleResponseChange}
            onT3Change={handleT3Change}
            onMarkComplete={handleMarkComplete}
          />
        </div>
      </div>
    </div>
  )
}

// ─── BRIEF PANEL ──────────────────────────────────────────────────────────────

function BriefPanel({ taskId }: { taskId: number }) {
  const [activeTab, setActiveTab] = useState<'task' | 'data' | 'emails'>('task')

  const tabs = taskId === 1
    ? [{ key: 'task', label: 'Task' }, { key: 'data', label: 'Funnel Data' }]
    : taskId === 2
    ? [{ key: 'task', label: 'Task' }, { key: 'data', label: 'Email Metrics' }, { key: 'emails', label: 'Email Copy' }]
    : [{ key: 'task', label: 'Task' }, { key: 'data', label: 'Funnel Data' }, { key: 'emails', label: 'Email Metrics' }]

  return (
    <div>
      {/* Context note */}
      <div style={{ background: '#fdedf1', border: '1px solid #ee3968', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ee3968', marginBottom: 20, lineHeight: 1.5 }}>
        All data below is fictionalized for assessment purposes.
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            style={{ padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400, color: activeTab === tab.key ? '#02556c' : '#6b7280', borderBottom: activeTab === tab.key ? '2px solid #3bc1cc' : '2px solid transparent', fontFamily: 'inherit', marginBottom: -1 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'task' && <TaskInstructions taskId={taskId} />}
      {activeTab === 'data' && (taskId === 1 || taskId === 3) && <FunnelDataPanel />}
      {activeTab === 'data' && taskId === 2 && <EmailMetricsPanel />}
      {activeTab === 'emails' && taskId === 2 && <EmailCopyPanel />}
      {activeTab === 'emails' && taskId === 3 && <EmailMetricsPanel />}
    </div>
  )
}

function TaskInstructions({ taskId }: { taskId: number }) {
  if (taskId === 1) return (
    <div>
      <h3 style={sh3}>Task 1: Funnel Diagnosis</h3>
      <p style={sp}>Review the funnel data in the Data tab. Based on what you see:</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {['Identify the single highest-leverage activation gap in the funnel. Where would you focus first and why?',
          'Write a clear problem statement. What is happening, what might be causing it, and what data would you want to validate your hypothesis?',
          'Propose two or three specific interventions you would test. For each one, explain what you expect it to change and how you would measure whether it worked.',
        ].map((item, i) => <li key={i} style={{ ...sp, marginBottom: 12 }}>{item}</li>)}
      </ol>
    </div>
  )

  if (taskId === 2) return (
    <div>
      <h3 style={sh3}>Task 2: Email Sequence Analysis</h3>
      <p style={sp}>Review the metrics and copy for the three onboarding emails in the tabs above.</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {['Based on the data, which email has the biggest problem and what is it?',
          'Diagnose what is wrong with it. Use the copy and the metrics together to build your case.',
          'What would you change and why? Be specific. You do not need to rewrite the email -- explain what needs to be different and what outcome you would expect.',
        ].map((item, i) => <li key={i} style={{ ...sp, marginBottom: 12 }}>{item}</li>)}
      </ol>
    </div>
  )

  return (
    <div>
      <h3 style={sh3}>Task 3: AI-Powered Analysis</h3>
      <p style={sp}>We use AI tools heavily on this team. Use the funnel data and email metrics in the tabs above.</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {['Write the prompt you would use to brief an AI tool to analyze the activation funnel. Show the actual prompt -- include the context you gave, what you asked for, and any constraints.',
          'Paste the output the AI returned.',
          'Show your interpretation. What was useful? What did it miss or get wrong? What would you actually act on?',
          'What is your top recommendation for improving activation in the next 30 days? Back it with data from this brief and explain how you would measure success.',
        ].map((item, i) => <li key={i} style={{ ...sp, marginBottom: 12 }}>{item}</li>)}
      </ol>
    </div>
  )
}

function FunnelDataPanel() {
  return (
    <div>
      <SectionTitle>Activation Goals vs. Current Performance</SectionTitle>
      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead><tr>{['Metric','Goal','Actual'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.goals.map((r, i) => (
            <tr key={i}><td>{r.metric}</td><td>{r.goal}</td><td>{r.actual}</td></tr>
          ))}
        </tbody>
      </table>

      <SectionTitle>Full Funnel Snapshot (Current Quarter)</SectionTitle>
      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead><tr>{['Stage','Volume','Conv. from Prior','Conv. from Signup'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.stages.map((r, i) => (
            <tr key={i}><td>{r.stage}</td><td>{r.volume}</td><td>{r.convPrior}</td><td>{r.convSignup}</td></tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 24 }}>* Some hosts enter trial via a legacy flow that does not require a card. Known data artifact.</p>

      <SectionTitle>Website Traffic (Last 6 Months)</SectionTitle>
      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead><tr>{['Month','Sessions','Total Users','New Users'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.traffic.map((r, i) => (
            <tr key={i}><td>{r.month}</td><td>{r.sessions}</td><td>{r.users}</td><td>{r.newUsers}</td></tr>
          ))}
        </tbody>
      </table>

      <SectionTitle>Paid Acquisition (Current Quarter)</SectionTitle>
      <table className="data-table">
        <thead><tr>{['Channel','Spend','Clicks','Signups','Cost/Signup'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.paid.map((r, i) => (
            <tr key={i}><td>{r.channel}</td><td>{r.spend}</td><td>{r.clicks}</td><td>{r.signups}</td><td>{r.cps}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmailMetricsPanel() {
  return (
    <div>
      <SectionTitle>Email Performance Metrics (Last 90 Days)</SectionTitle>
      <table className="data-table">
        <thead><tr>{['Email','Timing','Sends','Open Rate','Click Rate','Unsub Rate'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {EMAIL_METRICS.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td><td>{r.timing}</td><td>{r.sends}</td>
              <td>{r.openRate}</td><td>{r.clickRate}</td><td>{r.unsubRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmailCopyPanel() {
  const [active, setActive] = useState(0)
  const email = EMAIL_COPY[active]
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {EMAIL_COPY.map((e, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ padding: '5px 12px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              background: active === i ? '#252f38' : 'white', color: active === i ? 'white' : '#6b7280', borderColor: active === i ? '#252f38' : '#e5e7eb' }}>
            Email {i + 1}
          </button>
        ))}
      </div>
      <div className="email-block">
        <div className="email-meta">
          <div>From: {email.from}</div>
          <div>Subject: {email.subject}</div>
        </div>
        {email.body}
      </div>
    </div>
  )
}

// ─── RESPONSE PANEL ───────────────────────────────────────────────────────────

interface ResponsePanelProps {
  taskId: number
  response: string
  aiPrompt: string
  aiOutput: string
  aiInterpretation: string
  aiRecommendation: string
  completed: boolean
  canComplete: boolean
  onResponseChange: (v: string) => void
  onT3Change: (field: string, v: string) => void
  onMarkComplete: () => void
}

function ResponsePanel({ taskId, response, aiPrompt, aiOutput, aiInterpretation, aiRecommendation, completed, canComplete, onResponseChange, onT3Change, onMarkComplete }: ResponsePanelProps) {
  const fieldStyle = {
    width: '100%', padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: 8,
    fontSize: 14, lineHeight: '1.7', fontFamily: 'DM Sans, sans-serif', color: '#252f38',
    background: completed ? '#f8f9fa' : 'white', outline: 'none',
  }

  if (taskId === 1 || taskId === 2) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>Your Response</label>
      <textarea
        value={response}
        onChange={e => onResponseChange(e.target.value)}
        disabled={completed}
        placeholder={taskId === 1
          ? 'Start with your problem statement. What is the highest-leverage gap and why? Then walk through your proposed interventions...'
          : 'Which email has the biggest problem? Walk through the metrics and the copy to build your case. What would you change and why?'}
        style={{ ...fieldStyle, flex: 1, minHeight: 480 }}
        onFocus={e => { if (!completed) e.target.style.borderColor = '#3bc1cc' }}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
      <CompleteBar completed={completed} canComplete={canComplete} onMarkComplete={onMarkComplete} />
    </div>
  )

  // Task 3
  const t3Fields = [
    { key: 'aiPrompt', label: 'Your AI Prompt', placeholder: 'Paste the exact prompt you used -- include the context, goal, constraints, and output format you specified.', value: aiPrompt },
    { key: 'aiOutput', label: 'AI Output', placeholder: 'Paste the full response you received from the AI tool.', value: aiOutput },
    { key: 'aiInterpretation', label: 'Your Interpretation', placeholder: 'What did the AI get right? What did it miss or get wrong? What would you actually act on, and what would you discard?', value: aiInterpretation },
    { key: 'aiRecommendation', label: 'Your Top Recommendation (30-Day)', placeholder: 'What is the one thing you would do in the next 30 days to improve activation? Back it with specific data from the brief. How would you measure success?', value: aiRecommendation },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {t3Fields.map(f => (
        <div key={f.key}>
          <label style={labelStyle}>{f.label}</label>
          <textarea
            value={f.value}
            onChange={e => onT3Change(f.key, e.target.value)}
            disabled={completed}
            placeholder={f.placeholder}
            style={{ ...fieldStyle, minHeight: 160 }}
            onFocus={e => { if (!completed) e.target.style.borderColor = '#3bc1cc' }}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      ))}
      <CompleteBar completed={completed} canComplete={canComplete} onMarkComplete={onMarkComplete} />
    </div>
  )
}

function CompleteBar({ completed, canComplete, onMarkComplete }: { completed: boolean; canComplete: boolean; onMarkComplete: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
      {completed
        ? <span style={{ fontSize: 13, color: '#3bc1cc', fontWeight: 600 }}>✓ Task marked complete. Return to dashboard to submit.</span>
        : <span style={{ fontSize: 13, color: '#9ca3af' }}>Your work saves automatically as you type.</span>
      }
      {!completed && (
        <button
          onClick={onMarkComplete}
          disabled={!canComplete}
          style={{ padding: '10px 24px', background: canComplete ? '#252f38' : '#e5e7eb', color: canComplete ? 'white' : '#9ca3af', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: canComplete ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}
        >
          Mark Complete
        </button>
      )}
    </div>
  )
}

// ─── SHARED STYLE HELPERS ─────────────────────────────────────────────────────

const sh3: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: '#252f38', margin: '0 0 12px', letterSpacing: '-0.01em' }
const sp: React.CSSProperties = { fontSize: 13, color: '#374151', lineHeight: 1.65, margin: '0 0 12px' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 style={{ fontSize: 12, fontWeight: 700, color: '#02556c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>{children}</h4>
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#e8f8fa', border: '1px solid #3bc1cc', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#252f38', lineHeight: 1.6, marginTop: 20 }}>
      <strong style={{ color: '#02556c' }}>What we are looking for: </strong>{children}
    </div>
  )
}
