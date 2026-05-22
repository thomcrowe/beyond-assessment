'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function isValidEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    setError('')

    try {
      // Upsert candidate -- if they're returning, pick up where they left off
      const { data: existing } = await supabase
        .from('candidates')
        .select('id, status')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (existing) {
        if (existing.status === 'submitted') {
          setError('This email has already submitted a completed assessment.')
          setLoading(false)
          return
        }
        localStorage.setItem('candidate_id', existing.id)
        router.push('/dashboard')
        return
      }

      const { data, error: insertError } = await supabase
        .from('candidates')
        .insert({ name: name.trim(), email: email.toLowerCase().trim(), status: 'in_progress' })
        .select('id')
        .single()

      if (insertError || !data) throw insertError

      localStorage.setItem('candidate_id', data.id)
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f8fa 100%)' }}>

      {/* Logo mark */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, background: '#3bc1cc', borderRadius: 8 }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: '#252f38', letterSpacing: '-0.02em' }}>Beyond</span>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Host Growth & Marketing</p>
      </div>

      {/* Card */}
      <div style={{ background: 'white', borderRadius: 16, padding: '48px 48px', maxWidth: 480, width: '100%', boxShadow: '0 4px 32px rgba(37,47,56,0.08)', border: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#252f38', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Senior Growth Marketer
        </h1>
        <p style={{ fontSize: 15, color: '#02556c', fontWeight: 600, margin: '0 0 24px' }}>
          Take-Home Assessment
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, margin: '0 0 32px' }}>
          This assessment takes approximately one hour. You can save your progress and return at any time using this same email address.
        </p>

        <form onSubmit={handleStart}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#3bc1cc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 15, outline: 'none', transition: 'border-color 0.15s', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#3bc1cc'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{ background: '#fdedf1', border: '1px solid #ee3968', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ee3968', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            style={{ width: '100%', padding: '14px', background: loading ? '#9e9e9e' : '#252f38', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}
          >
            {loading ? 'Starting...' : 'Begin Assessment'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#9ca3af', textAlign: 'center', maxWidth: 400 }}>
        All data in this assessment is fictionalized for evaluation purposes and does not reflect actual Beyond performance data.
      </p>
    </div>
  )
}
