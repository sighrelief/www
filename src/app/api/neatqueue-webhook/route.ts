import crypto from 'node:crypto'
import { type NextRequest, NextResponse } from 'next/server'

const EXPECTED_QUERY_SECRET = process.env.WEBHOOK_QUERY_SECRET
const QUERY_PARAM_NAME = 'token'

/**
 * Verifies the secret from the query parameter.
 */
function verifyQuerySecret(req: NextRequest): boolean {
  if (!EXPECTED_QUERY_SECRET) {
    console.error(
      'Webhook query secret is not configured in environment variables.'
    )
    return false
  }

  const providedSecret = req.nextUrl.searchParams.get(QUERY_PARAM_NAME)

  if (!providedSecret) {
    console.warn(`Query parameter "${QUERY_PARAM_NAME}" missing.`)
    return false
  }

  const expectedBuffer = Buffer.from(EXPECTED_QUERY_SECRET, 'utf8')
  const providedBuffer = Buffer.from(providedSecret, 'utf8')

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    console.warn('Invalid query secret provided.')
    return false
  }

  console.log('Query secret verified successfully.')
  return true
}

/**
 * Handles POST requests to the /api/webhooks endpoint.
 * Verifies query secret, logs payload, and handles actions.
 */
export async function POST(req: NextRequest) {
  let payload: any

  try {
    const isVerified = verifyQuerySecret(req)
    if (!isVerified) {
      console.log('Webhook verification failed (query secret).')
      return NextResponse.json(
        { message: 'Unauthorized: Invalid or missing secret' },
        { status: 401 }
      )
    }

    payload = await req.json()

    console.log(
      '--- Verified Webhook Received (Query Auth) ---',
      new Date().toISOString(),
      '---\n',
      JSON.stringify(payload, null, 2),
      '\n--- End Webhook ---'
    )

    console.log(
      `Action: ${payload?.action || 'Unknown'}. Sending generic success response.`
    )
    return NextResponse.json(
      { message: 'Webhook received successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('!!! Error processing webhook:', error)
    try {
      // Attempt to read body on error
      const errorBody = await req.clone().text()
      console.error('Raw request body on error:', errorBody)
    } catch (bodyError) {
      console.error('Could not read raw request body on error:', bodyError)
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
    if (error.message.includes('Webhook query secret is not configured')) {
      return NextResponse.json(
        { message: 'Internal Server Error: Webhook secret not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Internal Server Error processing webhook' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { message: 'Method Not Allowed. Please use POST.' },
    { status: 405 }
  )
}
