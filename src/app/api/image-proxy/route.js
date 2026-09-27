// src/app/api/image-proxy/route.js
import { NextResponse } from 'next/server'

const ALLOWED_HOSTS = ['cdn.sanity.io']

export const runtime = 'nodejs' 
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 })
  }

  let parsedUrl
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (parsedUrl.protocol !== 'https:' || !ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  try {
    const upstreamResponse = await fetch(parsedUrl.toString(), {
      next: { revalidate: 60 * 60 * 24 }, // 1 day cache
    })

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch upstream image' },
        { status: upstreamResponse.status }
      )
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await upstreamResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Fetch error' }, { status: 500 })
  }
}
