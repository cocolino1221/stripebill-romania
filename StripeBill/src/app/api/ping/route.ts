import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    url: req.url 
  })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: 'pong POST',
    timestamp: new Date().toISOString(),
    url: req.url 
  })
}