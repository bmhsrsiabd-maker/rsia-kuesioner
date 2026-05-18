// src/app/api/survey/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      bulanPenilaian,
      usiaJenisPasien,
      namaPasien,
      tanggalPenilaian,
      ruangRawat,
      nilaiTampilan,
      nilaiKebersihan,
      nilaiRasa,
      nilaiWaktu,
      nilaiVariasi,
      keluhanDi,
      kritikSaran,
    } = body

    // Validation
    if (!bulanPenilaian || !usiaJenisPasien || !namaPasien || !tanggalPenilaian || !ruangRawat) {
      return NextResponse.json({ error: 'Field identitas wajib diisi.' }, { status: 400 })
    }
    if ([nilaiTampilan, nilaiKebersihan, nilaiRasa, nilaiWaktu, nilaiVariasi].some(
      (v) => typeof v !== 'number' || v < 1 || v > 5
    )) {
      return NextResponse.json({ error: 'Semua nilai harus antara 1–5.' }, { status: 400 })
    }

    const survey = await prisma.survey.create({
      data: {
        bulanPenilaian: bulanPenilaian.toString().toUpperCase(),
        usiaJenisPasien,
        namaPasien: namaPasien.toUpperCase(),
        tanggalPenilaian: new Date(tanggalPenilaian),
        ruangRawat,
        nilaiTampilan: Number(nilaiTampilan),
        nilaiKebersihan: Number(nilaiKebersihan),
        nilaiRasa: Number(nilaiRasa),
        nilaiWaktu: Number(nilaiWaktu),
        nilaiVariasi: Number(nilaiVariasi),
        keluhanDi: keluhanDi || null,
        kritikSaran: kritikSaran || null,
      },
    })

    return NextResponse.json({ success: true, id: survey.id }, { status: 201 })
  } catch (err) {
    console.error('Survey POST error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
