import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL || null,
    NODE_ENV: process.env.NODE_ENV,
  });
}

