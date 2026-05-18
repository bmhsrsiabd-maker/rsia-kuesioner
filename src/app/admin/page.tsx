// src/app/admin/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const BULAN = [
  '','JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI',
  'JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'
]

type Survey = {
  id: string
  createdAt: string
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
  keluhanDi: string | null
  kritikSaran: string | null
}

type AdminData = {
  surveys: Survey[]
  total: number
  avgStats: {
    _avg: {
      nilaiTampilan: number | null
      nilaiKebersihan: number | null
      nilaiRasa: number | null
      nilaiWaktu: number | null
      nilaiVariasi: number | null
    }
  }
}

function isDeletable(tanggalPenilaian: string): boolean {
  const now = new Date()
  const d = new Date(tanggalPenilaian)
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

const ASPEK_KEYS = ['nilaiTampilan','nilaiKebersihan','nilaiRasa','nilaiWaktu','nilaiVariasi'] as const
const ASPEK_LABELS: Record<string, string> = {
  nilaiTampilan: 'Tampilan',
  nilaiKebersihan: 'Kebersihan',
  nilaiRasa: 'Rasa',
  nilaiWaktu: 'Waktu Saji',
  nilaiVariasi: 'Variasi',
}

function avg(n: number | null) {
  return n != null ? n.toFixed(2) : '-'
}

export default function AdminPage() {
  const [pwd, setPwd] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bulan, setBulan] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async (password: string, bulanFilter = '') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ pwd: password })
      if (bulanFilter) params.set('bulan', bulanFilter)
      const res = await fetch(`/api/admin?${params}`)
      if (res.status === 401) { setError('Password salah.'); setAuthed(false); return }
      if (!res.ok) throw new Error()
      const d = await res.json()
      setData(d)
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) return
    try {
      const res = await fetch(`/api/admin?pwd=${encodeURIComponent(pwd)}&id=${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) { alert(d.error ?? 'Gagal menghapus data.'); return }
      await fetchData(pwd, bulan)
    } catch {
      alert('Gagal menghapus data.')
    }
  }

  const handleLogin = async () => {
    await fetchData(pwd)
    setAuthed(true)
  }

  useEffect(() => {
    if (authed) fetchData(pwd, bulan)
  }, [bulan, authed, pwd, fetchData])

  const filtered = (data?.surveys ?? []).filter(s =>
    !search || s.namaPasien.toLowerCase().includes(search.toLowerCase()) ||
    s.ruangRawat.includes(search)
  )

  // Login screen
  if (!authed || error === 'Password salah.') {
    return (
      <div className="min-h-screen bg-rsia-dark flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl animate-fade-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-rsia-teal rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🔐
            </div>
            <h1 className="font-display text-2xl font-bold text-rsia-dark">Admin Dashboard</h1>
            <p className="text-rsia-gray text-sm mt-1">RSIA Bunda Denpasar · Instalasi Gizi</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm mb-4">
              {error}
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
              disabled={loading || !pwd}
              className="w-full bg-rsia-teal text-white py-3 rounded-xl font-semibold hover:bg-rsia-tealDark transition-colors disabled:opacity-50"
            >
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const overallAvg = data ? (
    ASPEK_KEYS.reduce((sum, k) => sum + (data.avgStats._avg[k] ?? 0), 0) / ASPEK_KEYS.length
  ).toFixed(2) : '-'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-rsia-teal text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-rsia-tealLight text-xs tracking-widest uppercase">Admin Dashboard</p>
          <h1 className="font-display text-xl font-bold">Rekap Kuesioner Menu Makanan</h1>
          <p className="text-white/60 text-xs">RSIA Bunda Denpasar 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rekap"
            className="flex items-center gap-1.5 text-sm bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-lg px-3 py-2 transition-colors font-medium"
          >
            📊 Rekap Grafik
          </Link>
          <select
            value={bulan}
            onChange={e => setBulan(e.target.value)}
            className="text-sm bg-white text-rsia-dark border border-white/30 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="">Semua Bulan</option>
            {BULAN.slice(1).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="text-center py-12 text-rsia-gray">
            <div className="w-8 h-8 border-2 border-rsia-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat data...
          </div>
        )}

        {data && !loading && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Responden" value={data.total.toString()} icon="👥" />
              <StatCard label="Rata-rata Keseluruhan" value={overallAvg} icon="⭐" suffix="/5.0" />
              <StatCard label="Bulan Filter" value={bulan || 'Semua'} icon="📅" />
              <StatCard label="Data Ditampilkan" value={filtered.length.toString()} icon="📋" />
            </div>

            {/* Avg per aspek */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-semibold text-rsia-dark mb-4">Rata-rata Per Aspek</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ASPEK_KEYS.map(k => {
                  const val = data.avgStats._avg[k]
                  const pct = val ? (val / 5) * 100 : 0
                  return (
                    <div key={k} className="text-center">
                      <p className="text-xs text-rsia-gray mb-1">{ASPEK_LABELS[k]}</p>
                      <div className="text-2xl font-bold font-display text-rsia-teal">{avg(val)}</div>
                      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rsia-teal rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama pasien atau nomor ruang..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-rsia-teal"
              />
              <span className="text-sm text-rsia-gray whitespace-nowrap">{filtered.length} data</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-rsia-tealLight border-b border-rsia-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-rsia-teal text-xs">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-rsia-teal text-xs">Tanggal</th>
                      <th className="text-left px-4 py-3 font-semibold text-rsia-teal text-xs">Nama Pasien</th>
                      <th className="text-left px-4 py-3 font-semibold text-rsia-teal text-xs">Jenis</th>
                      <th className="text-left px-4 py-3 font-semibold text-rsia-teal text-xs">Ruang</th>
                      <th className="text-center px-3 py-3 font-semibold text-rsia-teal text-xs">Tampilan</th>
                      <th className="text-center px-3 py-3 font-semibold text-rsia-teal text-xs">Kebersihan</th>
                      <th className="text-center px-3 py-3 font-semibold text-rsia-teal text-xs">Rasa</th>
                      <th className="text-center px-3 py-3 font-semibold text-rsia-teal text-xs">Waktu</th>
                      <th className="text-center px-3 py-3 font-semibold text-rsia-teal text-xs">Variasi</th>
                      <th className="text-left px-4 py-3 font-semibold text-rsia-teal text-xs">Keluhan/Saran</th>
                      <th className="text-center px-3 py-3 font-semibold text-rsia-teal text-xs">Hapus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {new Date(s.tanggalPenilaian).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-rsia-dark max-w-[160px] truncate">{s.namaPasien}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-rsia-tealLight text-rsia-teal rounded-full text-xs">
                            {s.usiaJenisPasien}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{s.ruangRawat}</td>
                        <td className="px-3 py-3 text-center"><NilaiCell v={s.nilaiTampilan} /></td>
                        <td className="px-3 py-3 text-center"><NilaiCell v={s.nilaiKebersihan} /></td>
                        <td className="px-3 py-3 text-center"><NilaiCell v={s.nilaiRasa} /></td>
                        <td className="px-3 py-3 text-center"><NilaiCell v={s.nilaiWaktu} /></td>
                        <td className="px-3 py-3 text-center"><NilaiCell v={s.nilaiVariasi} /></td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {s.keluhanDi && (
                            <span className="block text-xs font-medium text-orange-600 mb-0.5">
                              📍 {s.keluhanDi}
                            </span>
                          )}
                          {s.kritikSaran && (
                            <span className="text-xs text-gray-500 line-clamp-2">{s.kritikSaran}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {isDeletable(s.tanggalPenilaian) ? (
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
                              title="Hapus data"
                            >
                              🗑️
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs" title="Data bulan lalu tidak dapat dihapus">🔒</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-rsia-gray">
                    <p className="text-3xl mb-2">📭</p>
                    <p>Tidak ada data ditemukan.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon, suffix }: { label: string; value: string; icon: string; suffix?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-display font-bold text-rsia-dark">
        {value}
        {suffix && <span className="text-sm text-rsia-gray ml-1">{suffix}</span>}
      </div>
      <div className="text-xs text-rsia-gray mt-1">{label}</div>
    </div>
  )
}

function NilaiCell({ v }: { v: number }) {
  const color = v >= 4 ? 'text-green-600' : v === 3 ? 'text-yellow-600' : 'text-red-500'
  return <span className={`font-bold text-sm ${color}`}>{v}</span>
}
