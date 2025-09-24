/* src/app/api/dsar/delete-request/route.ts */
import { NextRequest } from 'next/server'

export async function GET(): Promise<Response> {
  return Response.json({ pending: false })
}

export async function POST(req: NextRequest): Promise<Response> {
  return Response.json({ requested: true }, { status: 201 })
}

export async function DELETE(): Promise<Response> {
  return Response.json({ cancelled: true })
}