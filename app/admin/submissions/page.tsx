'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calcTotal, scoreLabel } from '@/lib/types'
import type { Candidate, Score } from '@/lib/types'

interface Row extends Candidate {
  score?: Score
  tasksComplete?: number
}

export default function AdminSubmissions() {
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) { router.push('/admin'); return }
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
      <header style={{ background: '#252f38', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#3bc1cc', borderRadius: 6 }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Beyond</span>
          <span style={{ color: '#6b7280', fontSize: 13, marginLeft: 4 }}>/ Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={exportCSV} style={{ padding: '8px 18px', background: '#3bc1cc', color: '#252f38', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Export CSV
          </button>
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
                  {['Candidate','Status','Tasks','Submitted','Score','Signal','DQ Flags',''].map(h => <th key={h}>{h}</th>)}
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
                      <td style={{ fontWeight: 700, fontSize: 16, color: total ? '#252f38' : '#d1d5db' }}>
                        {total !== null ? `${total}/65` : '--'}
                      </td>
                      <td style={{ fontSize: 12, color: signal?.color || '#d1d5db', fontWeight: 600, maxWidth: 160 }}>
                        {signal?.label || '--'}
                      </td>
                      <td>
                        {dqCount > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#ee3968', background: '#fdedf1', padding: '2px 8px', borderRadius: 12 }}>
                            {dqCount} DQ
                          </span>
                        )}
                      </td>
                      <td>
                        <button onClick={() => router.push(`/admin/${row.id}`)}
                          style={{ padding: '6px 14px', background: '#252f38', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Review
                        </button>
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
