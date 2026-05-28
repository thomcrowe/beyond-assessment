'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RUBRIC, calcTotal, scoreLabel } from '@/lib/types'
import type { Candidate, Submission, Score } from '@/lib/types'
import { AdminBriefPanel } from '@/app/components/TaskBrief'

export default function AdminReview() {
  const router = useRouter()
  const params = useParams()
  const candidateId = params.id as string

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [score, setScore] = useState<Partial<Score>>({})
  const [reviewerName, setReviewerName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeTask, setActiveTask] = useState(1)
  const [activePanel, setActivePanel] = useState<'response' | 'brief'>('response')

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) { router.push('/admin'); return }
    loadData()
  }, [candidateId])

  async function loadData() {
    const [{ data: cand }, { data: subs }] = await Promise.all([
      supabase.from('candidates').select('*').eq('id', candidateId).single(),
      supabase.from('submissions').select('*').eq('candidate_id', candidateId).order('task_number'),
    ])
    setCandidate(cand)
    setSubmissions(subs || [])
  }

  async function loadReviewerScore(name: string) {
    if (!name.trim()) return
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('reviewer_name', name.trim())
      .single()
    if (data) setScore(data)
    else setScore({})
  }

  function getSubmission(taskNum: number) {
    return submissions.find(s => s.task_number === taskNum)
  }

  function setDim(key: string, val: number) {
    setScore(prev => ({ ...prev, [key]: val }))
  }

  function setDQ(key: string, val: boolean) {
    setScore(prev => ({ ...prev, [key]: val }))
  }

  function getScoreErrors() {
    const errors: string[] = []
    if (!reviewerName.trim()) errors.push('Enter your name before saving.')
    const allDims = [
      ...RUBRIC.task1, ...RUBRIC.task2, ...RUBRIC.task3
    ].map(d => d.key)
    const unscored = allDims.filter(k => !score[k as keyof Score])
    if (unscored.length > 0) errors.push(`${unscored.length} dimension${unscored.length > 1 ? 's' : ''} not yet scored.`)
    return errors
  }

  async function saveScore() {
    const errors = getScoreErrors()
    if (errors.length > 0) { setSaveError(errors.join(' ')); return }
    setSaveError('')
    setSaving(true)
    const payload = {
      ...score,
      candidate_id: candidateId,
      reviewer_name: reviewerName,
      recommendation: signal.label,
      disqualified: dqFlags.length > 0,
      scored_at: new Date().toISOString(),
    }
    await supabase.from('scores').upsert(payload, { onConflict: 'candidate_id,reviewer_name' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const total = calcTotal(score)
  const dqFlags = [score.dq_no_data, score.dq_missed_email2, score.dq_no_ai_interpretation].filter(Boolean)
  const signal = dqFlags.length > 0
    ? { label: 'Disqualified — Do not advance', color: '#ee3968' }
    : scoreLabel(total)

  const taskRubrics = [null, RUBRIC.task1, RUBRIC.task2, RUBRIC.task3]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>

      {/* Save modal */}
      {saved && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(37,47,56,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '40px 48px', textAlign: 'center', boxShadow: '0 16px 48px rgba(37,47,56,0.2)', maxWidth: 380, width: '90%' }}>
            <div style={{ width: 56, height: 56, background: '#e8f8fa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24, color: '#3bc1cc' }}>✓</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#252f38' }}>Thanks for reviewing!</h2>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Your score has been saved successfully.</p>
            <button onClick={() => setSaved(false)} style={{ padding: '10px 32px', background: '#252f38', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Done
            </button>
          </div>
        </div>
      )}
      <header style={{ background: '#252f38', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <button onClick={() => router.push('/admin/submissions')} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
          ← All Submissions
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>{saved ? <span style={{ color: '#3bc1cc' }}>✓ Saved</span> : saving ? 'Saving...' : ''}</span>
          <button onClick={saveScore} disabled={saving}
            style={{ padding: '8px 20px', background: '#3bc1cc', color: '#252f38', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Save Score
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>

        {/* Left: Responses */}
        <div style={{ width: '55%', borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: 'white' }}>

          {/* Candidate header */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#252f38' }}>{candidate?.name}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{candidate?.email} &bull; Submitted {candidate?.submitted_at ? new Date(candidate.submitted_at).toLocaleString() : '--'}</p>
          </div>

          {/* Task tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 28px' }}>
            {[1, 2, 3].map(t => (
              <button key={t} onClick={() => setActiveTask(t)}
                style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activeTask === t ? 700 : 400, color: activeTask === t ? '#02556c' : '#6b7280', borderBottom: activeTask === t ? '2px solid #3bc1cc' : '2px solid transparent', fontFamily: 'inherit', marginBottom: -1 }}>
                Task {t}
              </button>
            ))}
          </div>

          {/* Response / Brief toggle */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 28px', borderBottom: '1px solid #e5e7eb', background: '#f8f9fa' }}>
            {(['response', 'brief'] as const).map(panel => (
              <button key={panel} onClick={() => setActivePanel(panel)}
                style={{ padding: '5px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  background: activePanel === panel ? '#252f38' : 'white',
                  color: activePanel === panel ? 'white' : '#6b7280',
                  borderColor: activePanel === panel ? '#252f38' : '#e5e7eb' }}>
                {panel === 'response' ? 'Response' : 'Brief & Data'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: '28px' }}>
            {activePanel === 'brief' && (
              <AdminBriefPanel taskId={activeTask} />
            )}
            {activePanel === 'response' && activeTask <= 2 && (
              <div>
                <label style={adminLabel}>Response</label>
                <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '16px 20px', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#252f38', minHeight: 200 }}>
                  {getSubmission(activeTask)?.response_text || <span style={{ color: '#9ca3af' }}>No response submitted.</span>}
                </div>
              </div>
            )}
            {activePanel === 'response' && activeTask === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { label: 'AI Prompt', key: 'ai_prompt' },
                  { label: 'AI Output', key: 'ai_output' },
                  { label: 'Interpretation', key: 'ai_interpretation' },
                  { label: 'Top Recommendation', key: 'ai_recommendation' },
                ].map(f => {
                  const sub = getSubmission(3)
                  const val = sub?.[f.key as keyof Submission] as string
                  return (
                    <div key={f.key}>
                      <label style={adminLabel}>{f.label}</label>
                      <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 18px', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#252f38', minHeight: 80 }}>
                        {val || <span style={{ color: '#9ca3af' }}>Not provided.</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Scoring */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#f8f9fa' }}>

          {/* Score summary */}
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Score</span>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#252f38' }}>{total}<span style={{ fontSize: 16, color: '#9ca3af' }}>/65</span></span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: signal.color }}>{signal.label}</div>
            {dqFlags.length > 0 && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#fdedf1', borderRadius: 8, fontSize: 12, color: '#ee3968', fontWeight: 600 }}>
                {dqFlags.length} disqualifying signal{dqFlags.length > 1 ? 's' : ''} flagged
              </div>
            )}
          </div>

          {/* Reviewer email */}
          <div style={{ marginBottom: 24 }}>
            <label style={adminLabel}>Your Name (Reviewer)</label>
            <input type="text" value={reviewerName} onChange={e => setReviewerName(e.target.value)}
              placeholder="e.g. Sarah"
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#3bc1cc'}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; loadReviewerScore(e.target.value) }}
            />
          </div>

          {/* Task rubrics */}
          {[1, 2, 3].map(taskNum => {
            const rubric = taskRubrics[taskNum]!
            return (
              <div key={taskNum} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#252f38' }}>Task {taskNum}</h3>
                {rubric.map(dim => (
                  <div key={dim.key} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{dim.label}</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {[1, 2, 3, 4, 5].map(val => {
                        const current = score[dim.key as keyof Score] as number
                        const isActive = current === val
                        return (
                          <button key={val} onClick={() => setDim(dim.key, val)}
                            className={`score-btn ${isActive ? (val === 5 ? 'active-4' : 'active') : ''}`}>
                            {val}
                          </button>
                        )
                      })}
                    </div>
                    {score[dim.key as keyof Score] && (
                      <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
                        {dim.descriptors[score[dim.key as keyof Score] as 1 | 2 | 3 | 4]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}

          {/* DQ Flags */}
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#252f38' }}>Disqualifying Signals</h3>
            {[
              { key: 'dq_no_data', label: 'Cannot back recommendations with data' },
              { key: 'dq_missed_email2', label: 'Did not identify Email 2 as the problem' },
              { key: 'dq_no_ai_interpretation', label: 'Submitted AI output without meaningful interpretation' },
            ].map(dq => (
              <label key={dq.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="checkbox"
                  checked={!!score[dq.key as keyof Score]}
                  onChange={e => setDQ(dq.key, e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#ee3968' }}
                />
                <span style={{ fontSize: 13, color: '#374151' }}>{dq.label}</span>
              </label>
            ))}
          </div>

          {/* Overall Notes */}
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
            <label style={adminLabel}>Overall Notes</label>
            <textarea
              value={(score.overall_notes as string) || ''}
              onChange={e => setScore(prev => ({ ...prev, overall_notes: e.target.value }))}
              placeholder="Panel notes, interview talking points, standout observations..."
              rows={5}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#3bc1cc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {saveError && (
            <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fdedf1', border: '1px solid #ee3968', borderRadius: 8, fontSize: 13, color: '#ee3968' }}>
              {saveError}
            </div>
          )}
          <button onClick={saveScore} disabled={saving}
            style={{ width: '100%', padding: 14, background: '#252f38', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {saving ? 'Saving...' : 'Save Score'}
          </button>
        </div>
      </div>
    </div>
  )
}

const adminLabel: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }
