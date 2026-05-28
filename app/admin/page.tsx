'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === 'sd15AZs4Jw7Wm86b2') {
      sessionStorage.setItem('admin_auth', 'true')
      sessionStorage.setItem('admin_level', 'super')
      router.push('/admin/submissions')
    } else if (password === 'beyondreview') {
      sessionStorage.setItem('admin_auth', 'true')
      sessionStorage.setItem('admin_level', 'reviewer')
      router.push('/admin/submissions')
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#252f38' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: '48px 44px', maxWidth: 400, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, background: '#3bc1cc', borderRadius: 6 }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: '#252f38' }}>Beyond</span>
          <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 4 }}>/ Admin</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#252f38', margin: '0 0 6px' }}>Panel Access</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>Senior Growth Marketer Assessment</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 15, marginBottom: 16, outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#3bc1cc'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          {error && <p style={{ color: '#ee3968', fontSize: 13, margin: '0 0 14px' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: 13, background: '#252f38', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
