import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 15

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pwd    = searchParams.get('pwd')
  const bulan  = searchParams.get('bulan') ?? ''
  const tahun  = parseInt(searchParams.get('tahun') ?? String(new Date().getFullYear()))
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search') ?? ''

  if (pwd !== (process.env.ADMIN_PASSWORD ?? 'rsia2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const where = {
    // Default: Year-to-Date filter
    tanggalPenilaian: {
      gte: new Date(tahun, 0, 1),
      lt:  new Date(tahun + 1, 0, 1),
    },
    ...(bulan  ? { bulanPenilaian: bulan } : {}),
    ...(search ? {
      OR: [
        { namaPasien: { contains: search, mode: 'insensitive' as const } },
        { ruangRawat:  { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [surveys, total, avgStats] = await Promise.all([
    prisma.survey.findMany({
      where,
      orderBy: { tanggalPenilaian: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.survey.count({ where }),
    prisma.survey.aggregate({
      where,
      _avg: {
        nilaiTampilan:  true,
        nilaiKebersihan: true,
        nilaiRasa:      true,
        nilaiWaktu:     true,
        nilaiVariasi:   true,
      },
    }),
  ])

  return NextResponse.json({
    surveys,
    total,
    totalPages:  Math.ceil(total / PAGE_SIZE),
    currentPage: page,
    avgStats,
  })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pwd = searchParams.get('pwd')
  const id  = searchParams.get('id')

  if (pwd !== (process.env.ADMIN_PASSWORD ?? 'rsia2026')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!id) {
    return NextResponse.json({ error: 'ID diperlukan.' }, { status: 400 })
  }

  const survey = await prisma.survey.findUnique({ where: { id } })
  if (!survey) {
    return NextResponse.json({ error: 'Data tidak ditemukan.' }, { status: 404 })
  }

  const now = new Date()
  const d   = new Date(survey.tanggalPenilaian)
  if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) {
    return NextResponse.json({ error: 'Data bulan lalu tidak dapat dihapus.' }, { status: 403 })
  }

  await prisma.survey.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
