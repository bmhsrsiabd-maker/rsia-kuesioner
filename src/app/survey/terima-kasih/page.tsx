// src/app/survey/terima-kasih/page.tsx
import Link from 'next/link'

export default function TerimakasihPage() {
  return (
    <div className="min-h-screen bg-rsia-cream flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-up">
        {/* Illustration */}
        <div className="w-24 h-24 bg-rsia-teal rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-5xl">✓</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-rsia-dark mb-3">
          Terima Kasih!
        </h1>
        <p className="text-rsia-gray leading-relaxed mb-2">
          Penilaian Anda telah berhasil disimpan.
        </p>
        <p className="text-rsia-gray text-sm leading-relaxed mb-8">
          Masukan Anda sangat berarti bagi kami untuk terus meningkatkan
          kualitas layanan gizi di RSIA Bunda Denpasar.
        </p>

        <div className="bg-white rounded-2xl border border-rsia-border p-5 mb-8 text-left space-y-2">
          <p className="text-sm font-semibold text-rsia-teal mb-3">Tentang Kami</p>
          <p className="text-sm text-rsia-gray leading-relaxed">
            🏥 <strong>RSIA Bunda Denpasar</strong> berkomitmen memberikan pelayanan
            kesehatan terbaik termasuk layanan gizi yang memenuhi standar nutrisi
            dan selera pasien.
          </p>
        </div>

        <Link
          href="/survey"
          className="btn-primary inline-block w-full"
        >
          Isi Kuesioner Lagi
        </Link>

        <Link
          href="/admin"
          className="mt-3 inline-block w-full py-3 px-6 rounded-[0.875rem] text-sm font-medium text-rsia-gray hover:text-rsia-teal transition-colors"
        >
          🔐 Admin Dashboard
        </Link>
      </div>
    </div>
  )
}
