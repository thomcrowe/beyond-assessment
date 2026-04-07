'use client'
export default function SubmitPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f8fa 100%)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '56px 48px', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 4px 32px rgba(37,47,56,0.08)', border: '1px solid #e5e7eb' }}>
        <div style={{ width: 64, height: 64, background: '#e8f8fa', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 28 }}>
          ✓
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#252f38', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Assessment Submitted
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, margin: '0 0 28px' }}>
          Thanks for taking the time. Your responses have been saved and our team will review them shortly.
        </p>
        <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px', fontSize: 13, color: '#374151', lineHeight: 1.6, textAlign: 'left' }}>
          <strong style={{ color: '#252f38' }}>What happens next:</strong><br />
          We review every submission with the full panel. If we move forward, we will be in touch to schedule a follow-up where you will walk us through your work and defend your choices.
        </div>
      </div>
    </div>
  )
}
