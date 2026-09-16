import { randomBytes } from 'crypto';

/** Local-part token for session-bound RCPT (URL-safe, lowercase). */
export function generateMailTestToken(): string {
  return randomBytes(12).toString('hex');
}
