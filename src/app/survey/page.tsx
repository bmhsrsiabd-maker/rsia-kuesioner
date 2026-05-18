// src/app/survey/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

const USIA_JENIS = ['Bayi','Anak','Dewasa','Lansia','Pendamping pasien']

const RUANG_RAWAT = [
  '201','202','203','204','205','206','207','208',
  '301','302','303','304','305','306','307','308',
  '208 C','Lainnya'
]

const KELUHAN_WAKTU = [
  'Makan pagi','Makan siang','Makan malam','Snack pagi','Snack sore'
]

const ASPEK = [
  {
    key: 'nilaiTampilan',
    label: 'Tampilan Makanan',
    sublabel: 'What do you think about the appearance of the food served?',
    icon: '🍽️',
  },
  {
    key: 'nilaiKebersihan',
    label: 'Kebersihan Penyajian',
    sublabel: 'What do you think about cleanliness in serving food?',
    icon: '✨',
  },
  {
    key: 'nilaiRasa',
    label: 'Rasa Makanan',
    sublabel: 'What do you think about the taste of the food served?',
    icon: '😋',
  },
  {
    key: 'nilaiWaktu',
    label: 'Waktu Penyajian',
    sublabel: 'What do you think about the serving time?',
    icon: '⏰',
  },
  {
    key: 'nilaiVariasi',
    label: 'Variasi Menu',
    sublabel: 'What do you think about the variety of food?',
    icon: '🥗',
  },
]

const LABEL_NILAI: Record<number, string> = {
  1: 'Sangat Kurang',
  2: 'Kurang',
  3: 'Cukup',
  4: 'Baik',
  5: 'Sangat Baik',
}

type FormData = {
  bulanPenilaian: string
  usiaJenisPasien: string
  namaPasien: string
  tanggalPenilaian: string
  ruangRawat: string
  nilaiTampilan: number
  nilaiKebersihan: number
  nilaiRasa: number
  nilaiWaktu: number
  nilaiVariasi: number
  keluhanDi: string
  kritikSaran: string
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn text-3xl md:text-4xl transition-transform hover:scale-110 ${
              (hovered || value) >= star ? 'text-rsia-gold' : 'text-rsia-border'
            }`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            aria-label={`Nilai ${star}`}
          >
            ★
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-sm font-medium text-rsia-gold animate-fade-in">
          {LABEL_NILAI[hovered || value]}
        </span>
      )}
    </div>
  )
}

export default function SurveyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: identitas, 2: penilaian, 3: saran

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = BULAN[new Date().getMonth()]

  const [form, setForm] = useState<FormData>({
    bulanPenilaian: currentMonth,
    usiaJenisPasien: '',
    namaPasien: '',
    tanggalPenilaian: today,
    ruangRawat: '',
    nilaiTampilan: 0,
    nilaiKebersihan: 0,
    nilaiRasa: 0,
    nilaiWaktu: 0,
    nilaiVariasi: 0,
    keluhanDi: '',
    kritikSaran: '',
  })

  const set = (key: keyof FormData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validateStep1 = () => {
    if (!form.bulanPenilaian || !form.usiaJenisPasien || !form.namaPasien || !form.tanggalPenilaian || !form.ruangRawat) {
      setError('Harap lengkapi semua field identitas.')
      return false
    }
    setError('')
    return true
  }

  const validateStep2 = () => {
    const ratings = [form.nilaiTampilan, form.nilaiKebersihan, form.nilaiRasa, form.nilaiWaktu, form.nilaiVariasi]
    if (ratings.some((r) => r === 0)) {
      setError('Harap berikan penilaian untuk semua aspek.')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Gagal menyimpan data')
      router.push('/survey/terima-kasih')
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rsia-cream">
      {/* Header */}
      <header className="bg-rsia-teal text-white">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
            🏥
          </div>
          <div>
            <p className="text-rsia-tealLight text-xs font-medium tracking-widest uppercase">
              RSIA Bunda Denpasar
            </p>
            <h1 className="font-display text-xl md:text-2xl font-bold leading-tight">
              Kuesioner Penilaian Menu Makanan
            </h1>
            <p className="text-white/70 text-xs mt-0.5">Patient Food Assessment · 2026</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="max-w-2xl mx-auto px-4 pb-5">
          <div className="flex items-center gap-0">
            {['Identitas', 'Penilaian', 'Saran'].map((label, i) => {
              const s = i + 1
              const isActive = step === s
              const isDone = step > s
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        isDone
                          ? 'bg-rsia-gold border-rsia-gold text-white'
                          : isActive
                          ? 'bg-white border-white text-rsia-teal'
                          : 'bg-transparent border-white/40 text-white/40'
                      }`}
                    >
                      {isDone ? '✓' : s}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isActive ? 'text-white font-medium' : 'text-white/50'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 mb-4 transition-all ${
                        step > s ? 'bg-rsia-gold' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1 – Identitas */}
        {step === 1 && (
          <div className="animate-fade-up space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-rsia-dark">Data Identitas</h2>
              <p className="text-rsia-gray text-sm mt-1">Mohon isi data pasien dengan lengkap.</p>
            </div>

            <Card>
              <Field label="Bulan Penilaian" required>
                <Select
                  value={form.bulanPenilaian}
                  onChange={(v) => set('bulanPenilaian', v)}
                  options={BULAN}
                  placeholder="Pilih bulan..."
                />
              </Field>

              <Field label="Usia dan Jenis Pasien" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {USIA_JENIS.map((uj) => (
                    <ChoiceChip
                      key={uj}
                      label={uj}
                      selected={form.usiaJenisPasien === uj}
                      onClick={() => set('usiaJenisPasien', uj)}
                    />
                  ))}
                </div>
              </Field>

              <Field label="Nama Pasien / Wali Pasien" required>
                <input
                  type="text"
                  value={form.namaPasien}
                  onChange={(e) => set('namaPasien', e.target.value.toUpperCase())}
                  placeholder="Masukkan nama lengkap..."
                  className="input-field"
                />
              </Field>

              <Field label="Tanggal Penilaian" required>
                <input
                  type="date"
                  value={form.tanggalPenilaian}
                  onChange={(e) => set('tanggalPenilaian', e.target.value)}
                  className="input-field"
                />
              </Field>

              <Field label="Ruang Rawat" required>
                <Select
                  value={form.ruangRawat}
                  onChange={(v) => set('ruangRawat', v)}
                  options={RUANG_RAWAT}
                  placeholder="Pilih ruang..."
                />
              </Field>
            </Card>

            <button
              onClick={() => { if (validateStep1()) setStep(2) }}
              className="btn-primary w-full"
            >
              Lanjutkan ke Penilaian →
            </button>
          </div>
        )}

        {/* STEP 2 – Penilaian */}
        {step === 2 && (
          <div className="animate-fade-up space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-rsia-dark">Penilaian Menu</h2>
              <p className="text-rsia-gray text-sm mt-1">
                Berikan penilaian 1–5 bintang untuk setiap aspek.
              </p>
            </div>

            <div className="space-y-4">
              {ASPEK.map((aspek, i) => (
                <div
                  key={aspek.key}
                  className="bg-white rounded-2xl p-5 border border-rsia-border shadow-sm animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{aspek.icon}</span>
                    <div>
                      <p className="font-semibold text-rsia-dark">{aspek.label}</p>
                      <p className="text-xs text-rsia-gray italic">{aspek.sublabel}</p>
                    </div>
                  </div>
                  <StarRating
                    value={form[aspek.key as keyof FormData] as number}
                    onChange={(v) => set(aspek.key as keyof FormData, v)}
                  />
                </div>
              ))}
            </div>

            {/* Average preview */}
            {[form.nilaiTampilan, form.nilaiKebersihan, form.nilaiRasa, form.nilaiWaktu, form.nilaiVariasi].every(v => v > 0) && (
              <div className="bg-rsia-goldLight border border-rsia-gold/30 rounded-2xl p-4 text-center animate-fade-in">
                <p className="text-sm text-rsia-gray">Rata-rata penilaian Anda</p>
                <p className="text-3xl font-display font-bold text-rsia-gold mt-1">
                  {((form.nilaiTampilan + form.nilaiKebersihan + form.nilaiRasa + form.nilaiWaktu + form.nilaiVariasi) / 5).toFixed(1)}
                  <span className="text-base ml-1">/ 5.0</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">
                ← Kembali
              </button>
              <button
                onClick={() => { if (validateStep2()) setStep(3) }}
                className="btn-primary flex-1"
              >
                Lanjutkan →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 – Saran */}
        {step === 3 && (
          <div className="animate-fade-up space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-rsia-dark">Kritik & Saran</h2>
              <p className="text-rsia-gray text-sm mt-1">
                Masukan Anda sangat berharga bagi peningkatan layanan kami.
              </p>
            </div>

            <Card>
              <Field label="Terdapat keluhan di...">
                <div className="flex flex-wrap gap-2">
                  {KELUHAN_WAKTU.map((k) => (
                    <ChoiceChip
                      key={k}
                      label={k}
                      selected={form.keluhanDi === k}
                      onClick={() => set('keluhanDi', form.keluhanDi === k ? '' : k)}
                    />
                  ))}
                </div>
              </Field>

              <Field label="Kritik dan Saran">
                <textarea
                  value={form.kritikSaran}
                  onChange={(e) => set('kritikSaran', e.target.value)}
                  placeholder="Tulis kritik, saran, atau masukan Anda di sini..."
                  rows={5}
                  className="input-field resize-none"
                />
                <p className="text-xs text-rsia-gray mt-1 text-right">
                  {form.kritikSaran.length} karakter
                </p>
              </Field>
            </Card>

            {/* Summary */}
            <div className="bg-rsia-tealLight border border-rsia-border rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-rsia-teal text-sm">Ringkasan Penilaian</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-rsia-gray">Pasien:</span>
                <span className="font-medium text-rsia-dark truncate">{form.namaPasien}</span>
                <span className="text-rsia-gray">Ruang:</span>
                <span className="font-medium text-rsia-dark">{form.ruangRawat}</span>
                {ASPEK.map((a) => (
                  <span key={a.key} className="text-rsia-gray">{a.label}:</span>
                ))}
                {ASPEK.map((a) => (
                  <span key={a.key} className="font-medium text-rsia-gold">
                    {'★'.repeat(form[a.key as keyof FormData] as number)}
                    {'☆'.repeat(5 - (form[a.key as keyof FormData] as number))}
                    {' '}({form[a.key as keyof FormData]}/5)
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">
                ← Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  'Kirim Penilaian ✓'
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-rsia-gray text-xs">
        © 2026 RSIA Bunda Denpasar · Instalasi Gizi
      </footer>

    </div>
  )
}

// Sub-components
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-rsia-border shadow-sm divide-y divide-rsia-border/60">
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="p-5 space-y-3">
      <label className="block text-sm font-semibold text-rsia-dark">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-field"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

function ChoiceChip({ label, selected, onClick }: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
        selected
          ? 'bg-rsia-teal text-white border-rsia-teal shadow-sm'
          : 'bg-rsia-cream text-rsia-gray border-rsia-border hover:border-rsia-teal hover:text-rsia-teal'
      }`}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  )
}
