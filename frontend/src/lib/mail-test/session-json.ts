import { MailTestSession, MailTestSessionStatus } from '@prisma/client';

import { formatMailTestAddress, isMailTesterDevIngestEnabled } from '@/lib/mail-test/config';

export type MailTestSessionJson = {
  sessionId: string;
  token: string;
  address: string;
  status: MailTestSessionStatus;
  expiresAt: string;
  score: number | null;
  result: unknown | null;
  devIngestEnabled: boolean;
};

export function serializeMailTestSession(session: MailTestSession): MailTestSessionJson {
  let result: unknown | null = null;
  if (session.status === MailTestSessionStatus.scored && session.resultJson) {
    try {
      result = JSON.parse(session.resultJson);
    } catch {
      result = null;
    }
  }

  return {
    sessionId: session.id,
    token: session.token,
    address: formatMailTestAddress(session.token),
    status: session.status,
    expiresAt: session.expiresAt.toISOString(),
    score: session.score,
    result,
    devIngestEnabled: isMailTesterDevIngestEnabled(),
  };
}
