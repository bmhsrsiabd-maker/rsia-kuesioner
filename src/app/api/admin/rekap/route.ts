import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BULAN_INDEX: Record<string, number> = {
  JANUARI: 0, FEBRUARI: 1, MARET: 2, APRIL: 3, MEI: 4, JUNI: 5,
  JULI: 6, AGUSTUS: 7, SEPTEMBER: 8, OKTOBER: 9, NOVEMBER: 10, DESEMBER: 11,
}

const ASPEK_KEYS = [
  'nilaiTampilan', 'nilaiKebersihan', 'nilaiRasa', 'nilaiWaktu', 'nilaiVariasi',
] as const

const NILAI_LABELS: Record<number, string> = {
  1: 'Sangat Kurang', 2: 'Kurang', 3: 'Cukup', 4: 'Baik', 5: 'Sangat Baik',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pwd = searchParams.get('pwd')
  const mode = searchParams.get('mode') ?? 'bulan'
  const bulan = searchParams.get('bulan') ?? ''
  const tahun = parseInt(searchParams.get('tahun') ?? String(new Date().getFullYear()))

  if (pwd !== (process.env.ADMIN_PASSWORD ?? 'rsia2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let where: Record<string, unknown> = {}

  if (mode === 'bulan' && bulan && BULAN_INDEX[bulan] !== undefined) {
    const m = BULAN_INDEX[bulan]
    where = {
      bulanPenilaian: bulan,
      tanggalPenilaian: {
        gte: new Date(tahun, m, 1),
        lt: new Date(tahun, m + 1, 1),
      },
    }
  } else {
    where = {
      tanggalPenilaian: {
        gte: new Date(tahun, 0, 1),
        lt: new Date(tahun + 1, 0, 1),
      },
    }
  }

  const surveys = await prisma.survey.findMany({
    where,
    select: {
      nilaiTampilan: true,
      nilaiKebersihan: true,
      nilaiRasa: true,
      nilaiWaktu: true,
      nilaiVariasi: true,
    },
  })

  const total = surveys.length

  const rekap = Object.fromEntries(
    ASPEK_KEYS.map(key => {
      const counts = [1, 2, 3, 4, 5].map(v => surveys.filter(s => s[key] === v).length)
      const sum = surveys.reduce((a, s) => a + s[key], 0)
      return [
        key,
        {
          avg: total > 0 ? +(sum / total).toFixed(2) : 0,
          data: [1, 2, 3, 4, 5].map((nilai, i) => ({
            nilai,
            label: NILAI_LABELS[nilai],
            jumlah: counts[i],
            persen: total > 0 ? +((counts[i] / total) * 100).toFixed(1) : 0,
          })),
        },
      ]
    })
  )

  return NextResponse.json({ total, rekap, mode, bulan, tahun })
}
