import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { logToolEvent } from '@/lib/analytics/tool-events';
import {
  formatMailTestAddress,
  getMailTesterMaxSessionsPerIpHour,
  getMailTesterSessionTtlMinutes,
} from '@/lib/mail-test/config';
import { hashClientIp } from '@/lib/mail-test/client-ip';
import { serializeMailTestSession } from '@/lib/mail-test/session-json';
import { generateMailTestToken } from '@/lib/mail-test/tokens';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || randomUUID();
  const started = Date.now();
  const clientIpHash = hashClientIp(request);
  const maxPerHour = getMailTesterMaxSessionsPerIpHour();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentCount = await prisma.mailTestSession.count({
    where: {
      clientIpHash,
      createdAt: { gte: hourAgo },
    },
  });

  if (recentCount >= maxPerHour) {
    logToolEvent('tool_error', {
      toolId: 'mail_tester',
      success: false,
      durationMs: Date.now() - started,
      code: 'RATE_LIMIT',
      surface: 'session_create',
    });
    return NextResponse.json(
      { error: 'Too many mail test sessions. Try again later.', code: 'RATE_LIMIT' },
      { status: 429, headers: { 'X-Request-Id': requestId } },
    );
  }

  const session = await auth();
  const ttlMinutes = getMailTesterSessionTtlMinutes();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  let token = generateMailTestToken();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const row = await prisma.mailTestSession.create({
        data: {
          token,
          userId: session?.user?.id ?? null,
          expiresAt,
          clientIpHash,
        },
      });

      logToolEvent('tool_run', {
        toolId: 'mail_tester',
        success: true,
        durationMs: Date.now() - started,
        surface: 'session_create',
        userId: session?.user?.id,
      });

      return NextResponse.json(serializeMailTestSession(row), {
        status: 201,
        headers: { 'X-Request-Id': requestId },
      });
    } catch {
      token = generateMailTestToken();
    }
  }

  logToolEvent('tool_error', {
    toolId: 'mail_tester',
    success: false,
    durationMs: Date.now() - started,
    code: 'CREATE_FAILED',
    surface: 'session_create',
    userId: session?.user?.id,
  });

  return NextResponse.json(
    { error: 'Could not create session', code: 'CREATE_FAILED' },
    { status: 500, headers: { 'X-Request-Id': requestId } },
  );
}

export async function GET() {
  return NextResponse.json({
    domain: formatMailTestAddress('{token}').replace('{token}', '<token>'),
  });
}
