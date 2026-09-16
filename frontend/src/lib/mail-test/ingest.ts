import { MailTestSessionStatus } from '@prisma/client';

import { scheduleMailTestScoring } from '@/lib/mail-test/schedule-score';
import { prisma } from '@/lib/prisma';

const SCORABLE = new Set<MailTestSessionStatus>([
  MailTestSessionStatus.pending,
]);

export async function acceptMailTestRaw(sessionId: string, raw: Buffer, requestId: string) {
  const session = await prisma.mailTestSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    return { ok: false as const, status: 404, error: 'Session not found' };
  }

  const now = new Date();
  if (session.expiresAt < now) {
    if (session.status === MailTestSessionStatus.pending || session.status === MailTestSessionStatus.received) {
      await prisma.mailTestSession.update({
        where: { id: sessionId },
        data: { status: MailTestSessionStatus.expired },
      });
    }
    return { ok: false as const, status: 410, error: 'Session expired' };
  }

  if (session.status === MailTestSessionStatus.scored) {
    return { ok: true as const, async: true as const, alreadyScored: true as const };
  }

  if (!SCORABLE.has(session.status)) {
    return { ok: false as const, status: 409, error: 'Session already processing or failed' };
  }

  await prisma.mailTestSession.update({
    where: { id: sessionId },
    data: {
      status: MailTestSessionStatus.received,
      rawMessageBase64: raw.toString('base64'),
      receivedAt: now,
    },
  });

  scheduleMailTestScoring(sessionId, requestId);

  return { ok: true as const, async: true as const };
}

/** Dev ingest: wait for scoring to finish (smaller files, local UX). */
export async function ingestMailTestRawAndWait(sessionId: string, raw: Buffer, requestId: string) {
  const accepted = await acceptMailTestRaw(sessionId, raw, requestId);
  if (!accepted.ok) {
    return accepted;
  }
  if ('alreadyScored' in accepted && accepted.alreadyScored) {
    return { ok: true as const, result: null };
  }

  const { runMailTestScoringJob } = await import('@/lib/mail-test/schedule-score');
  await runMailTestScoringJob(sessionId, requestId);

  const row = await prisma.mailTestSession.findUnique({ where: { id: sessionId } });
  if (row?.status === MailTestSessionStatus.scored) {
    return { ok: true as const, result: JSON.parse(row.resultJson) };
  }
  return { ok: false as const, status: 502, error: 'Scoring failed' };
}
