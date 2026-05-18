'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'

const BULAN = [
  'JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI',
  'JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER',
]
const USIA_JENIS = ['Bayi','Anak','Dewasa','Lansia','Pendamping pasien']

const ASPEK = [
  { key: 'nilaiTampilan',  label: 'Tampilan Makanan',   icon: '🍽️' },
  { key: 'nilaiKebersihan',label: 'Kebersihan Penyajian',icon: '✨' },
  { key: 'nilaiRasa',      label: 'Rasa Makanan',        icon: '😋' },
  { key: 'nilaiWaktu',     label: 'Waktu Penyajian',     icon: '⏰' },
  { key: 'nilaiVariasi',   label: 'Variasi Menu',        icon: '🥗' },
]

// Warna per rating: merah → hijau
const COLORS = ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E']

type DataPoint = { nilai: number; label: string; jumlah: number; persen: number }
type AspekData = { avg: number; data: DataPoint[] }
type RekapResult = { total: number; rekap: Record<string, AspekData>; mode: string; bulan: string; tahun: number }

// ── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: DataPoint }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800">{d.label}</p>
      <p className="text-gray-600">{d.jumlah} responden</p>
      <p className="font-medium" style={{ color: COLORS[d.nilai - 1] }}>{d.persen}%</p>
    </div>
  )
}

// ── Satu card pie chart per aspek ───────────────────────────────────────────
function AspekCard({ aspek, aspekData, total }: {
  aspek: typeof ASPEK[number]
  aspekData: AspekData
  total: number
}) {
  const hasData = aspekData.data.some(d => d.jumlah > 0)
  const pieData = aspekData.data.filter(d => d.jumlah > 0)

  const avgColor =
    aspekData.avg >= 4.5 ? '#22C55E'
    : aspekData.avg >= 3.5 ? '#84CC16'
    : aspekData.avg >= 2.5 ? '#EAB308'
    : aspekData.avg >= 1.5 ? '#F97316'
    : '#EF4444'

  return (
    <div className="bg-white rounded-2xl border border-rsia-border shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-rsia-border">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{aspek.icon}</span>
          <div>
            <p className="font-semibold text-rsia-dark text-sm leading-tight">{aspek.label}</p>
            <p className="text-xs text-rsia-gray">{total} responden</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-bold leading-none" style={{ color: avgColor }}>
            {aspekData.avg}
          </p>
          <p className="text-xs text-rsia-gray mt-0.5">rata-rata</p>
        </div>
      </div>

      {/* Donut chart */}
      <div className="relative h-52 flex-shrink-0">
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  dataKey="jumlah"
                  nameKey="label"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.nilai} fill={COLORS[entry.nilai - 1]} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-display font-bold" style={{ color: avgColor }}>
                {aspekData.avg}
              </span>
              <span className="text-xs text-rsia-gray">/ 5.0</span>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-rsia-gray text-sm">
            <div className="text-center">
              <p className="text-3xl mb-2">📭</p>
              <p>Tidak ada data</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend tabel */}
      <div className="px-5 pb-5 flex-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-rsia-border text-rsia-gray">
              <th className="text-left pb-2 font-medium">Rating</th>
              <th className="text-right pb-2 font-medium">Jumlah</th>
              <th className="text-right pb-2 font-medium">Persen</th>
            </tr>
          </thead>
          <tbody>
            {aspekData.data.map(d => (
              <tr key={d.nilai} className="border-b border-gray-50 last:border-0">
                <td className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[d.nilai - 1] }}
                    />
                    <span className="text-rsia-dark">{d.label}</span>
                  </div>
                </td>
                <td className="py-1.5 text-right font-semibold text-rsia-dark">{d.jumlah}</td>
                <td className="py-1.5 text-right">
                  <span
                    className="font-semibold"
                    style={{ color: d.jumlah > 0 ? COLORS[d.nilai - 1] : '#D1D5DB' }}
                  >
                    {d.persen}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function RekapPage() {
  const now = new Date()
  const TAHUN_LIST = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  const [pwd, setPwd] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [mode, setMode] = useState<'bulan' | 'tahun'>('bulan')
  const [bulan, setBulan] = useState(BULAN[now.getMonth()])
  const [tahun, setTahun] = useState(now.getFullYear())
  const [usia, setUsia]   = useState('')

  const [data, setData] = useState<RekapResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function callApi(password: string, m: 'bulan' | 'tahun', b: string, t: number, u: string) {
    const params = new URLSearchParams({ pwd: password, mode: m, tahun: String(t) })
    if (m === 'bulan') params.set('bulan', b)
    if (u) params.set('usiaJenisPasien', u)
    return fetch(`/api/admin/rekap?${params}`)
  }

  const handleLogin = async () => {
    setLoginLoading(true)
    setLoginErr('')
    try {
      const res = await callApi(pwd, mode, bulan, tahun, usia)
      if (res.status === 401) { setLoginErr('Password salah.'); return }
      if (!res.ok) throw new Error()
      setData(await res.json())
      setAuthed(true)
    } catch {
      setLoginErr('Terjadi kesalahan, coba lagi.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLoad = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await callApi(pwd, mode, bulan, tahun, usia)
      if (res.status === 401) { setAuthed(false); return }
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Gagal memuat data rekap.')
    } finally {
      setLoading(false)
    }
  }

  // ── Login screen ────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-rsia-dark flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl animate-fade-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-rsia-teal rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              📊
            </div>
            <h1 className="font-display text-2xl font-bold text-rsia-dark">Rekap Grafik</h1>
            <p className="text-rsia-gray text-sm mt-1">RSIA Bunda Denpasar · Instalasi Gizi</p>
          </div>
          {loginErr && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm mb-4">
              {loginErr}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Masukkan password..."
              className="w-full px-4 py-3 border border-rsia-border rounded-xl text-sm outline-none focus:border-rsia-teal"
            />
            <button
              onClick={handleLogin}
              disabled={loginLoading || !pwd}
              className="w-full bg-rsia-teal text-white py-3 rounded-xl font-semibold hover:bg-rsia-tealDark transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Memuat...' : 'Masuk'}
            </button>
          </div>
          <div className="mt-5 text-center">
            <Link href="/admin" className="text-rsia-teal text-sm hover:underline">
              ← Kembali ke Admin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Label periode ───────────────────────────────────────────────────────
  const periodeLabel = mode === 'bulan' ? `${bulan} ${tahun}` : `Tahun ${tahun}`
  const overallAvg = data && data.total > 0
    ? (Object.values(data.rekap).reduce((s, a) => s + a.avg, 0) / 5).toFixed(2)
    : '-'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-rsia-teal text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-rsia-tealLight text-xs tracking-widest uppercase">Rekap Grafik</p>
            <h1 className="font-display text-xl font-bold">Distribusi Penilaian Menu Makanan</h1>
            <p className="text-white/60 text-xs">RSIA Bunda Denpasar</p>
          </div>
          <Link
            href="/admin"
            className="text-white/80 hover:text-white text-sm border border-white/30 hover:border-white/70 rounded-lg px-3 py-2 transition-colors"
          >
            ← Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-rsia-dark mb-4">Filter Periode</p>
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode toggle */}
            <div className="flex rounded-xl border border-rsia-border overflow-hidden">
              {(['bulan', 'tahun'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-rsia-teal text-white'
                      : 'bg-white text-rsia-gray hover:bg-rsia-tealLight hover:text-rsia-teal'
                  }`}
                >
                  Per {m === 'bulan' ? 'Bulan' : 'Tahun'}
                </button>
              ))}
            </div>

            {mode === 'bulan' && (
              <select
                value={bulan}
                onChange={e => setBulan(e.target.value)}
                className="px-3 py-2 border border-rsia-border rounded-xl text-sm text-rsia-dark bg-white outline-none focus:border-rsia-teal"
              >
                {BULAN.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}

            <select
              value={tahun}
              onChange={e => setTahun(Number(e.target.value))}
              className="px-3 py-2 border border-rsia-border rounded-xl text-sm text-rsia-dark bg-white outline-none focus:border-rsia-teal"
            >
              {TAHUN_LIST.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <select
              value={usia}
              onChange={e => setUsia(e.target.value)}
              className="px-3 py-2 border border-rsia-border rounded-xl text-sm text-rsia-dark bg-white outline-none focus:border-rsia-teal"
            >
              <option value="">Semua Pasien</option>
              {USIA_JENIS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>

            <button
              onClick={handleLoad}
              disabled={loading}
              className="bg-rsia-teal text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rsia-tealDark transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memuat...</>
                : '🔍 Tampilkan'
              }
            </button>
          </div>
        </div>

        {/* Summary stats */}
        {data && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-2xl mb-1">👥</p>
              <p className="text-3xl font-display font-bold text-rsia-dark">{data.total}</p>
              <p className="text-xs text-rsia-gray mt-1">Total Responden</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-2xl mb-1">📅</p>
              <p className="text-xl font-display font-bold text-rsia-dark">{periodeLabel}</p>
              <p className="text-xs text-rsia-gray mt-1">Periode</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-2xl mb-1">⭐</p>
              <p className="text-3xl font-display font-bold text-rsia-gold">{overallAvg}</p>
              <p className="text-xs text-rsia-gray mt-1">Rata-rata Keseluruhan</p>
            </div>
          </div>
        )}

        {/* Keterangan warna */}
        {data && data.total > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
            <p className="text-xs font-semibold text-rsia-gray mb-3 uppercase tracking-wide">Keterangan Warna</p>
            <div className="flex flex-wrap gap-4">
              {['Sangat Kurang','Kurang','Cukup','Baik','Sangat Baik'].map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-rsia-dark">{i + 1} – {label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-rsia-gray">
            <div className="w-8 h-8 border-2 border-rsia-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data rekap...
          </div>
        )}

        {/* Empty */}
        {data && data.total === 0 && !loading && (
          <div className="text-center py-16 text-rsia-gray">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Tidak ada data untuk periode ini.</p>
            <p className="text-sm mt-1">Coba pilih bulan atau tahun yang berbeda.</p>
          </div>
        )}

        {/* Grid pie charts — hanya render setelah mounted (hindari SSR mismatch recharts) */}
        {data && data.total > 0 && !loading && mounted && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {ASPEK.map(aspek => (
              <AspekCard
                key={aspek.key}
                aspek={aspek}
                aspekData={data.rekap[aspek.key]}
                total={data.total}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
