// Brackets API removed. Return 410 Gone so clients know feature deprecated.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Brackets feature has been removed.' },
    { status: 410 }
  );
}
