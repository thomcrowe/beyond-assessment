'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calcTotal, scoreLabel, RUBRIC } from '@/lib/types'
import type { Candidate, Score } from '@/lib/types'

interface Row extends Candidate {
  score?: Score
  tasksComplete?: number
}

export default function AdminSubmissions() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [panelScores, setPanelScores] = useState<Score[] | null>(null)
  const [panelCandidate, setPanelCandidate] = useState<Row | null>(null)
  const [isSuper, setIsSuper] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) { router.push('/admin'); return }
    setIsSuper(sessionStorage.getItem('admin_level') === 'super')
    loadData()
  }, [])

  async function loadData() {
    const [{ data: candidates }, { data: submissions }, { data: scores }] = await Promise.all([
      supabase.from('candidates').select('*').order('created_at', { ascending: false }),
      supabase.from('submissions').select('candidate_id,task_number,completed'),
      supabase.from('scores').select('*'),
    ])

    const enriched: Row[] = (candidates || []).map(c => ({
      ...c,
      score: scores?.find(s => s.candidate_id === c.id),
      tasksComplete: (submissions || []).filter(s => s.candidate_id === c.id && s.completed).length,
    }))

    setRows(enriched)
    setLoading(false)
  }

  async function openPanelScores(row: Row) {
    setPanelCandidate(row)
    const { data } = await supabase.from('scores').select('*').eq('candidate_id', row.id).order('scored_at', { ascending: true })
    setPanelScores(data || [])
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Status', 'Tasks Complete', 'Submitted At', 'Total Score', 'Signal', 'Reviewer', 'DQ: No Data', 'DQ: Missed Email 2', 'DQ: No AI Interp']
    const csvRows = rows.map(r => {
      const total = r.score ? calcTotal(r.score) : ''
      const signal = r.score ? scoreLabel(calcTotal(r.score)).label : ''
      return [
        r.name, r.email, r.status, r.tasksComplete,
        r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '',
        total, signal, r.score?.reviewer_name || '',
        r.score?.dq_no_data ? 'YES' : '',
        r.score?.dq_missed_email2 ? 'YES' : '',
        r.score?.dq_no_ai_interpretation ? 'YES' : '',
      ]
    })
    const csv = [headers, ...csvRows].map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'beyond-assessment-submissions.csv'; a.click()
  }

  if (loading) return <AdminLoading />

  const submitted = rows.filter(r => r.status === 'submitted')
  const inProgress = rows.filter(r => r.status === 'in_progress')

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {panelScores !== null && panelCandidate && (
        <PanelScoresModal
          candidate={panelCandidate}
          scores={panelScores}
          onClose={() => { setPanelScores(null); setPanelCandidate(null) }}
        />
      )}
      <header style={{ background: '#252f38', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/beyond-logo.svg" alt="Beyond" style={{ height: 24, filter: 'brightness(0) invert(1)' }} />
          <span style={{ color: '#6b7280', fontSize: 13, marginLeft: 4 }}>/ Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {isSuper && (
            <button onClick={exportCSV} style={{ padding: '8px 18px', background: '#3bc1cc', color: '#252f38', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Export CSV
            </button>
          )}
          <button onClick={() => { sessionStorage.removeItem('admin_auth'); router.push('/admin') }} style={{ padding: '8px 18px', background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Candidates', value: rows.length },
            { label: 'Submitted', value: submitted.length },
            { label: 'In Progress', value: inProgress.length },
            { label: 'Scored', value: rows.filter(r => r.score).length },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '16px 24px', flex: '1 1 140px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#252f38' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#252f38' }}>Submissions</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Candidate','Status','Tasks','Submitted', ...(isSuper ? ['Score','Signal','DQ Flags'] : []),''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>No submissions yet.</td></tr>
                )}
                {rows.map(row => {
                  const total = row.score ? calcTotal(row.score) : null
                  const signal = total !== null ? scoreLabel(total) : null
                  const dqCount = [row.score?.dq_no_data, row.score?.dq_missed_email2, row.score?.dq_no_ai_interpretation].filter(Boolean).length
                  return (
                    <tr key={row.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#252f38' }}>{row.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{row.email}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: row.status === 'submitted' ? '#e8f8fa' : '#fef3c7', color: row.status === 'submitted' ? '#02556c' : '#92400e' }}>
                          {row.status === 'submitted' ? 'Submitted' : 'In Progress'}
                        </span>
                      </td>
                      <td style={{ color: row.tasksComplete === 3 ? '#3bc1cc' : '#374151', fontWeight: row.tasksComplete === 3 ? 700 : 400 }}>
                        {row.tasksComplete}/3
                      </td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>
                        {row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : '--'}
                      </td>
                      {isSuper && <>
                        <td style={{ fontWeight: 700, fontSize: 16, color: total ? '#252f38' : '#d1d5db' }}>
                          {total !== null ? `${total}/65` : '--'}
                        </td>
                        <td style={{ fontSize: 12, color: signal?.color || '#d1d5db', fontWeight: 600, maxWidth: 160 }}>
                          {signal?.label || '--'}
                        </td>
                      </>}
                      {isSuper && (
                        <td>
                          {dqCount > 0 && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#ee3968', background: '#fdedf1', padding: '2px 8px', borderRadius: 12 }}>
                              {dqCount} DQ
                            </span>
                          )}
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => router.push(`/admin/${row.id}`)}
                            style={{ padding: '6px 14px', background: '#252f38', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Review
                          </button>
                          {isSuper && (
                            <button onClick={() => openPanelScores(row)}
                              style={{ padding: '6px 14px', background: '#3bc1cc', color: '#252f38', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Panel Scores
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminLoading() {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}><p style={{ color: '#9ca3af' }}>Loading...</p></div>
}

function PanelScoresModal({ candidate, scores, onClose }: { candidate: Row; scores: Score[]; onClose: () => void }) {
  const allDims = [...RUBRIC.task1, ...RUBRIC.task2, ...RUBRIC.task3]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(37,47,56,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 700, color: '#252f38' }}>Panel Scores — {candidate.name}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af' }}>{scores.length} reviewer{scores.length !== 1 ? 's' : ''} scored</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af', fontFamily: 'inherit' }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '24px 28px' }}>
          {scores.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>No scores submitted yet.</p>
          ) : (
            <>
              {/* Score summary row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {scores.map(s => {
                  const total = calcTotal(s)
                  const signal = s.dq_no_data || s.dq_missed_email2 || s.dq_no_ai_interpretation
                    ? { label: 'Disqualified — Do not advance', color: '#ee3968' }
                    : scoreLabel(total)
                  return (
                    <div key={s.id} style={{ background: '#f8f9fa', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '14px 20px', minWidth: 160 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>{s.reviewer_name}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#252f38' }}>{total}<span style={{ fontSize: 13, color: '#9ca3af' }}>/65</span></div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: signal.color, marginTop: 2 }}>{signal.label}</div>
                      {s.overall_notes && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8, lineHeight: 1.5, borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>{s.overall_notes}</div>}
                    </div>
                  )
                })}
              </div>

              {/* Dimension breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: 600, fontSize: 12 }}>Dimension</th>
                    {scores.map(s => (
                      <th key={s.id} style={{ textAlign: 'center', padding: '8px 12px', color: '#252f38', fontWeight: 700, fontSize: 12 }}>{s.reviewer_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allDims.map((dim, i) => {
                    const isNewTask = i === 4 || i === 8
                    return (
                      <tr key={dim.key} style={{ borderBottom: '1px solid #f3f4f6', background: isNewTask ? '#f8f9fa' : 'white' }}>
                        <td style={{ padding: '7px 12px', color: '#374151', fontWeight: isNewTask ? 700 : 400 }}>{dim.label}</td>
                        {scores.map(s => {
                          const val = s[dim.key as keyof Score] as number
                          return (
                            <td key={s.id} style={{ textAlign: 'center', padding: '7px 12px', fontWeight: 600, color: val >= 4 ? '#3bc1cc' : val === 3 ? '#02556c' : val <= 2 ? '#f59e0b' : '#9ca3af' }}>
                              {val ?? '—'}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                  {/* DQ flags */}
                  {[
                    { key: 'dq_no_data', label: 'DQ: Cannot back with data' },
                    { key: 'dq_missed_email2', label: 'DQ: Missed Email 2' },
                    { key: 'dq_no_ai_interpretation', label: 'DQ: No AI interpretation' },
                  ].map(dq => (
                    <tr key={dq.key} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff5f6' }}>
                      <td style={{ padding: '7px 12px', color: '#ee3968', fontWeight: 600, fontSize: 12 }}>{dq.label}</td>
                      {scores.map(s => (
                        <td key={s.id} style={{ textAlign: 'center', padding: '7px 12px', fontSize: 12, fontWeight: 700, color: s[dq.key as keyof Score] ? '#ee3968' : '#d1d5db' }}>
                          {s[dq.key as keyof Score] ? 'YES' : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
