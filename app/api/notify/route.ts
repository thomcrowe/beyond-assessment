import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { candidateName, candidateEmail } = await req.json()

  await resend.emails.send({
    from: 'Beyond Assessment <onboarding@resend.dev>',
    to: 'thom.crowe@beyondpricing.com',
    subject: `Assessment submitted — ${candidateName}`,
    html: `
      <p><strong>${candidateName}</strong> (${candidateEmail}) has submitted their Beyond assessment.</p>
      <p><a href="https://beyond-assessment.vercel.app/admin">View submissions →</a></p>
    `,
  })

  return NextResponse.json({ ok: true })
}
