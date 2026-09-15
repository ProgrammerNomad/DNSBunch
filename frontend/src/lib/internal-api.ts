import { createHmac } from 'crypto';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';
const DEFAULT_TIMEOUT_MS = parseInt(process.env.INTERNAL_API_TIMEOUT_MS || '30000', 10);

export { BACKEND_URL };

export function signInternalRequest(body: string): {
  timestamp: string;
  signature: string;
} {
  if (!INTERNAL_API_SECRET) {
    throw new Error('INTERNAL_API_SECRET is not configured');
  }
  const timestamp = String(Math.floor(Date.now() / 1000));
  const message = `${timestamp}.${body}`;
  const signature = createHmac('sha256', INTERNAL_API_SECRET).update(message).digest('hex');
  return { timestamp, signature };
}

export async function postInternalTool(
  toolId: string,
  body: unknown,
  requestId: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const bodyText = JSON.stringify(body);
  const { timestamp, signature } = signInternalRequest(bodyText);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${BACKEND_URL}/internal/v1/tools/${toolId}`, {
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
  } finally {
    clearTimeout(timer);
  }
}
