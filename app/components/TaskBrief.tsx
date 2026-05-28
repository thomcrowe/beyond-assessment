'use client'
import { useState } from 'react'
import { FUNNEL_DATA, EMAIL_METRICS, EMAIL_COPY } from '@/lib/types'

// ─── TASK INSTRUCTIONS ────────────────────────────────────────────────────────

export function TaskInstructions({ taskId }: { taskId: number }) {
  if (taskId === 1) return (
    <div>
      <h3 style={sh3}>Task 1: Funnel Diagnosis</h3>
      <p style={sp}>Review the funnel data in the Data tab. Based on what you see:</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {[
          'Identify the single largest activation gap in the funnel. Where would you focus first and why?',
          'Tell us what is happening, what might be causing it, and what data would you want to validate your hypothesis?',
          'Propose one or two specific interventions you would test. For each one, explain what you expect it to change and how you would measure whether it worked.',
        ].map((item, i) => <li key={i} style={{ ...sp, marginBottom: 12 }}>{item}</li>)}
      </ol>
    </div>
  )

  if (taskId === 2) return (
    <div>
      <h3 style={sh3}>Task 2: Email Sequence Analysis</h3>
      <p style={sp}>Review the metrics and copy for the three onboarding emails in the tabs above.</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {[
          'Based on the data, which email has the biggest problem and what is it?',
          'Diagnose what is wrong with it. Use the copy and the metrics together to build your case.',
          'What would you change and why? Be specific. You do not need to rewrite the email - explain what needs to be different and what outcome you would expect.',
        ].map((item, i) => <li key={i} style={{ ...sp, marginBottom: 12 }}>{item}</li>)}
      </ol>
    </div>
  )

  return (
    <div>
      <h3 style={sh3}>Task 3: AI-Powered Analysis</h3>
      <p style={sp}>We use AI tools heavily on this team. Use the funnel data and email metrics in the tabs above.</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {[
          'Write the prompt you would use to brief an AI tool to analyze the activation funnel. Show the actual prompt -- include the context you gave, what you asked for, and any constraints.',
          'Paste the output the AI returned.',
          'Show your interpretation. What was useful? What did it miss or get wrong? What would you actually act on?',
          'What is your top recommendation for improving activation in the next 30 days? Back it with data from this brief. How would you measure success?',
        ].map((item, i) => <li key={i} style={{ ...sp, marginBottom: 12 }}>{item}</li>)}
      </ol>
    </div>
  )
}

// ─── DATA PANELS ──────────────────────────────────────────────────────────────

export function FunnelDataPanel() {
  return (
    <div>
      <SectionTitle>Activation Goals vs. Current Performance</SectionTitle>
      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead><tr>{['Metric', 'Goal', 'Actual'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.goals.map((r, i) => (
            <tr key={i}><td>{r.metric}</td><td>{r.goal}</td><td>{r.actual}</td></tr>
          ))}
        </tbody>
      </table>

      <SectionTitle>Full Funnel Snapshot (Current Quarter)</SectionTitle>
      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead><tr>{['Stage', 'Volume', 'Conv. from Prior', 'Conv. from Signup'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.stages.map((r, i) => (
            <tr key={i}><td>{r.stage}</td><td>{r.volume}</td><td>{r.convPrior}</td><td>{r.convSignup}</td></tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 24 }}>* Some hosts enter trial via a legacy flow that does not require a card. Known data artifact.</p>

      <SectionTitle>Website Traffic (Last 6 Months)</SectionTitle>
      <table className="data-table" style={{ marginBottom: 24 }}>
        <thead><tr>{['Month', 'Sessions', 'Total Users', 'New Users'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.traffic.map((r, i) => (
            <tr key={i}><td>{r.month}</td><td>{r.sessions}</td><td>{r.users}</td><td>{r.newUsers}</td></tr>
          ))}
        </tbody>
      </table>

      <SectionTitle>Paid Acquisition (Current Quarter)</SectionTitle>
      <table className="data-table">
        <thead><tr>{['Channel', 'Spend', 'Clicks', 'Signups', 'Cost/Signup'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {FUNNEL_DATA.paid.map((r, i) => (
            <tr key={i}><td>{r.channel}</td><td>{r.spend}</td><td>{r.clicks}</td><td>{r.signups}</td><td>{r.cps}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmailMetricsPanel() {
  return (
    <div>
      <SectionTitle>Email Performance Metrics (Last 90 Days)</SectionTitle>
      <table className="data-table">
        <thead><tr>{['Email', 'Timing', 'Sends', 'Open Rate', 'Click Rate', 'Unsub Rate'].map(h => <th key={h}>{h}</th>)}</tr></thead>
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

export function EmailCopyPanel() {
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

// ─── COMBINED BRIEF PANEL ─────────────────────────────────────────────────────

export function AdminBriefPanel({ taskId }: { taskId: number }) {
  const tabs = taskId === 1
    ? [{ key: 'brief', label: 'Brief' }, { key: 'data', label: 'Funnel Data' }]
    : taskId === 2
    ? [{ key: 'brief', label: 'Brief' }, { key: 'metrics', label: 'Email Metrics' }, { key: 'copy', label: 'Email Copy' }]
    : [{ key: 'brief', label: 'Brief' }, { key: 'data', label: 'Funnel Data' }, { key: 'metrics', label: 'Email Metrics' }]

  const [activeTab, setActiveTab] = useState('brief')

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === tab.key ? 700 : 400, color: activeTab === tab.key ? '#02556c' : '#6b7280', borderBottom: activeTab === tab.key ? '2px solid #3bc1cc' : '2px solid transparent', fontFamily: 'inherit', marginBottom: -1 }}>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'brief' && <TaskInstructions taskId={taskId} />}
      {activeTab === 'data' && <FunnelDataPanel />}
      {activeTab === 'metrics' && <EmailMetricsPanel />}
      {activeTab === 'copy' && <EmailCopyPanel />}
    </div>
  )
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────

const sh3: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#252f38', margin: '0 0 12px', letterSpacing: '-0.01em' }
const sp: React.CSSProperties = { fontSize: 13, color: '#374151', lineHeight: 1.65, margin: '0 0 12px' }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 style={{ fontSize: 12, fontWeight: 700, color: '#02556c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>{children}</h4>
}
