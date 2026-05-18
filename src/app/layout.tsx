// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kuesioner Penilaian Menu Makanan – RSIA Bunda Denpasar',
  description: 'Form penilaian menu makanan pasien RSIA Bunda Denpasar 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
