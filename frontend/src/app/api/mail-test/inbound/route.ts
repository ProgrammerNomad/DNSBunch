import { randomUUID } from 'crypto';

import { NextRequest, NextResponse } from 'next/server';



import { logToolEvent } from '@/lib/analytics/tool-events';

import { acceptMailTestRaw } from '@/lib/mail-test/ingest';

import { getMailTesterDomain } from '@/lib/mail-test/config';



const MAX_RAW_BYTES = 2_500_000;

const TOKEN_RE = /^[a-f0-9]{24}$/;



function extractTokenFromRecipient(value: string): string | null {

  const trimmed = value.trim().toLowerCase();

  const domain = getMailTesterDomain();

  const at = trimmed.indexOf('@');

  if (at <= 0) {

    return null;

  }

  const local = trimmed.slice(0, at);

  const host = trimmed.slice(at + 1);

  if (host !== domain && !host.endsWith(`.${domain}`)) {

    return null;

  }

  return TOKEN_RE.test(local) ? local : null;

}



function verifyWebhookSecret(request: NextRequest): boolean {

  const secret = process.env.MAIL_TESTER_WEBHOOK_SECRET?.trim();

  if (!secret) {

    return false;

  }

  const header = request.headers.get('x-mail-test-secret') || request.headers.get('authorization');

  if (!header) {

    return false;

  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  return token === secret;

}



type InboundBody = {

  token?: string;

  to?: string;

  from?: string;

  raw?: string;

  received_at?: string;

  message_size?: number;

  email?: string;

};



export async function POST(request: NextRequest) {

  const requestId = request.headers.get('X-Request-Id') || randomUUID();

  const started = Date.now();



  if (!verifyWebhookSecret(request)) {

    return NextResponse.json(

      { error: 'Webhook not configured or unauthorized', code: 'WEBHOOK_UNAUTHORIZED' },

      { status: 401, headers: { 'X-Request-Id': requestId } },

    );

  }



  const contentType = request.headers.get('content-type') || '';

  let raw: Buffer | null = null;

  let token: string | null = null;



  if (contentType.includes('application/json')) {

    const body = (await request.json().catch(() => null)) as InboundBody | null;

    if (body?.token && TOKEN_RE.test(body.token)) {

      token = body.token;

    } else if (body?.to) {

      token = extractTokenFromRecipient(body.to);

    }

    if (body?.raw) {

      raw = Buffer.from(body.raw, 'base64');

    } else if (body?.email) {

      raw = Buffer.from(body.email, 'utf8');

    }

  } else {

    const form = await request.formData().catch(() => null);

    const to = form?.get('to');

    if (typeof to === 'string') {

      token = extractTokenFromRecipient(to);

    }

    const email = form?.get('email') ?? form?.get('raw');

    if (typeof email === 'string') {

      raw = Buffer.from(email, 'utf8');

    } else if (email instanceof File) {

      raw = Buffer.from(await email.arrayBuffer());

    }

  }



  if (!token || !raw) {

    return NextResponse.json({ error: 'Missing token or raw message' }, { status: 400, headers: { 'X-Request-Id': requestId } });

  }



  if (raw.length > MAX_RAW_BYTES) {

    return NextResponse.json({ error: 'Message too large' }, { status: 400, headers: { 'X-Request-Id': requestId } });

  }



  const { prisma } = await import('@/lib/prisma');

  const session = await prisma.mailTestSession.findUnique({ where: { token } });

  if (!session) {

    return NextResponse.json({ error: 'Unknown session token' }, { status: 404, headers: { 'X-Request-Id': requestId } });

  }



  const outcome = await acceptMailTestRaw(session.id, raw, requestId);

  if (outcome.ok && 'alreadyScored' in outcome && outcome.alreadyScored) {
    return NextResponse.json(
      { accepted: true, sessionId: session.id, status: 'scored' },
      { headers: { 'X-Request-Id': requestId } },
    );
  }

  if (!outcome.ok) {

    logToolEvent('tool_error', {

      toolId: 'mail_tester',

      success: false,

      durationMs: Date.now() - started,

      code: String(outcome.status),

      surface: 'inbound_webhook',

    });

    return NextResponse.json({ error: outcome.error }, { status: outcome.status, headers: { 'X-Request-Id': requestId } });

  }



  logToolEvent('tool_run', {

    toolId: 'mail_tester',

    success: true,

    durationMs: Date.now() - started,

    surface: 'inbound_webhook',

  });



  return NextResponse.json(

    { accepted: true, sessionId: session.id, status: 'received' },

    { status: 202, headers: { 'X-Request-Id': requestId } },

  );

}


