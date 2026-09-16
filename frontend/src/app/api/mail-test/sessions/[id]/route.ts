import { randomUUID } from 'crypto';
import { MailTestSessionStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { serializeMailTestSession } from '@/lib/mail-test/session-json';
import { prisma } from '@/lib/prisma';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const requestId = randomUUID();
  const { id } = await context.params;

  const session = await prisma.mailTestSession.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404, headers: { 'X-Request-Id': requestId } });
  }

  const now = new Date();
  if (session.expiresAt < now && session.status === MailTestSessionStatus.pending) {
    const updated = await prisma.mailTestSession.update({
      where: { id },
      data: { status: MailTestSessionStatus.expired },
    });
    return NextResponse.json(serializeMailTestSession(updated), { headers: { 'X-Request-Id': requestId } });
  }

  return NextResponse.json(serializeMailTestSession(session), { headers: { 'X-Request-Id': requestId } });
}
