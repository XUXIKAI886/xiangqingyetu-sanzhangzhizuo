import { NextResponse } from 'next/server'
import { getGenerateImageThreadAvailability } from '@/lib/generate-image-thread-config'

export async function GET() {
  return NextResponse.json(getGenerateImageThreadAvailability())
}
