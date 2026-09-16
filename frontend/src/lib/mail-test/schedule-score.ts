import { MailTestSessionStatus } from '@prisma/client';

import { postInternalMailTestScore } from '@/lib/mail-test/score-client';
import { prisma } from '@/lib/prisma';

export async function runMailTestScoringJob(sessionId: string, requestId: string): Promise<void> {
  const session = await prisma.mailTestSession.findUnique({ where: { id: sessionId } });
  if (!session || !session.rawMessageBase64) {
    return;
  }

  if (session.status !== MailTestSessionStatus.received && session.status !== MailTestSessionStatus.scoring) {
    return;
  }

  await prisma.mailTestSession.update({
    where: { id: sessionId },
    data: { status: MailTestSessionStatus.scoring },
  });

  try {
    const raw = Buffer.from(session.rawMessageBase64, 'base64');
    const result = await postInternalMailTestScore(raw, requestId);
    await prisma.mailTestSession.update({
      where: { id: sessionId },
      data: {
        status: MailTestSessionStatus.scored,
        score: result.score,
        resultJson: JSON.stringify(result),
        rawMessageBase64: null,
      },
    });
  } catch {
    await prisma.mailTestSession.update({
      where: { id: sessionId },
      data: { status: MailTestSessionStatus.failed },
    });
  }
}

/** Fire-and-forget scoring after inbound/dev ingest (do not await in webhook handler). */
export function scheduleMailTestScoring(sessionId: string, requestId: string): void {
  void runMailTestScoringJob(sessionId, requestId);
}
