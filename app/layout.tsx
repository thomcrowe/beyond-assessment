import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beyond | Senior Growth Marketer Assessment',
  description: 'Take-home assessment for the Senior Growth Marketer role at Beyond.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
