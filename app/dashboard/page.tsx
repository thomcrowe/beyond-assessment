'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Candidate, Submission } from '@/lib/types'

const TASKS = [
  {
    id: 1,
    title: 'Funnel Diagnosis',
    subtitle: 'Analyze the activation data and identify where to focus',
    time: '45 - 60 min',
    icon: '📊',
    description: 'Review the funnel data and paid acquisition metrics. Identify the highest-leverage conversion gap, build your problem statement, and propose interventions you would test.',
  },
  {
    id: 2,
    title: 'Email Sequence Analysis',
    subtitle: 'Diagnose what is broken and what you would do about it',
    time: '30 - 45 min',
    icon: '✉️',
    description: 'Review the performance metrics and copy for all four onboarding emails. Identify the biggest problem, diagnose what is wrong, and tell us what you would change and why.',
  },
  {
    id: 3,
    title: 'AI-Powered Analysis',
    subtitle: 'Use AI as a thinking partner and show your work',
    time: '45 - 60 min',
    icon: '⚡',
    description: 'Write a prompt to brief an AI tool on the activation funnel. Show the output, evaluate it critically, and deliver your top recommendation backed by data from the brief.',
  },
]

export default function Dashboard() {
  const router = useRouter()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem('candidate_id')
    if (!id) { router.push('/'); return }
    loadData(id)
  }, [])

  async function loadData(id: string) {
    const [{ data: cand }, { data: subs }] = await Promise.all([
      supabase.from('candidates').select('*').eq('id', id).single(),
      supabase.from('submissions').select('*').eq('candidate_id', id),
    ])
    if (!cand) { router.push('/'); return }
    if (cand.status === 'submitted') { router.push('/submit'); return }
    setCandidate(cand)
    setSubmissions(subs || [])
    setLoading(false)
  }

  function getTaskStatus(taskId: number) {
    const sub = submissions.find(s => s.task_number === taskId)
    if (!sub) return 'not_started'
    if (sub.completed) return 'complete'
    return 'in_progress'
  }

  function allComplete() {
    return [1, 2, 3].every(id => getTaskStatus(id) === 'complete')
  }

  async function handleSubmit() {
    if (!candidate || !allComplete()) return
    setSubmitting(true)
    await supabase
      .from('candidates')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', candidate.id)
    router.push('/submit')
  }

  if (loading) return <LoadingScreen />

  const statusColors = { not_started: '#9ca3af', in_progress: '#f59e0b', complete: '#3bc1cc' }
  const statusLabels = { not_started: 'Not Started', in_progress: 'In Progress', complete: 'Complete' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f8fa 100%)' }}>

      {/* Header */}
      <header style={{ background: '#252f38', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#3bc1cc', borderRadius: 6 }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Beyond</span>
        </div>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>
          {candidate?.name} &bull; {candidate?.email}
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>

        {/* Intro */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#252f38', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Your Assessment
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Complete all three tasks in any order. Your work saves automatically as you type. Submit when all three are marked complete.
          </p>
        </div>

        {/* Task Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {TASKS.map(task => {
            const status = getTaskStatus(task.id)
            const statusColor = statusColors[status as keyof typeof statusColors]
            return (
              <div
                key={task.id}
                className="task-card"
                onClick={() => router.push(`/task/${task.id}`)}
                style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 20, borderLeft: `4px solid ${status === 'complete' ? '#3bc1cc' : status === 'in_progress' ? '#f59e0b' : '#e5e7eb'}` }}
              >
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{task.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#252f38' }}>
                      Task {task.id}: {task.title}
                    </h2>
                    <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, background: `${statusColor}18`, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: '#374151', fontWeight: 500 }}>{task.subtitle}</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.55 }}>{task.description}</p>
                  <p style={{ margin: '10px 0 0', fontSize: 12, color: '#6b7280' }}>⏱ Estimated time: {task.time}</p>
                </div>
                <div style={{ color: '#d1d5db', fontSize: 20, flexShrink: 0 }}>›</div>
              </div>
            )
          })}
        </div>

        {/* Submit */}
        <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '28px', textAlign: 'center' }}>
          {allComplete() ? (
            <>
              <p style={{ margin: '0 0 16px', fontSize: 15, color: '#374151', fontWeight: 500 }}>
                All three tasks are complete. When you submit, your assessment will be locked for review.
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '14px 48px', background: '#252f38', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>
              Complete all three tasks to unlock submission. {[1, 2, 3].filter(id => getTaskStatus(id) === 'complete').length} of 3 complete.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, background: '#3bc1cc', borderRadius: 8, margin: '0 auto 16px', animation: 'pulse-save 1.2s ease-in-out infinite' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading your assessment...</p>
      </div>
    </div>
  )
}
