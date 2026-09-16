import { signInternalRequest, BACKEND_URL } from '@/lib/internal-api';

const DEFAULT_TIMEOUT_MS = parseInt(process.env.INTERNAL_API_TIMEOUT_MS || '60000', 10);

import type { MailTestReportV2 } from '@/lib/mail-test/report-types';

export type MailTestScoreResult = MailTestReportV2;

export async function postInternalMailTestScore(raw: Buffer, requestId: string): Promise<MailTestScoreResult> {
  const bodyText = JSON.stringify({ raw: raw.toString('base64') });
  const { timestamp, signature } = signInternalRequest(bodyText);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${BACKEND_URL}/internal/v1/mail-test/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Timestamp': timestamp,
        'X-Internal-Signature': signature,
        'X-Request-Id': requestId,
      },
      body: bodyText,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof data.error === 'string' ? data.error : 'Scoring failed';
      throw new Error(message);
    }
    return data as MailTestScoreResult;
  } finally {
    clearTimeout(timer);
  }
}
