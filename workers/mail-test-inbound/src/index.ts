/**
 * Thin Cloudflare Email Worker - mail.dnsbunch.com catch-all only.
 * Secrets: INBOUND_URL, MAIL_TESTER_WEBHOOK_SECRET
 */

const TOKEN_RE = /^[a-f0-9]{24}$/;
const MAX_BYTES = 2_500_000;

export interface Env {
  INBOUND_URL: string;
  MAIL_TESTER_WEBHOOK_SECRET: string;
  MAIL_TESTER_DOMAIN: string;
}

function extractToken(recipient: string, domain: string): string | null {
  const lower = recipient.trim().toLowerCase();
  const at = lower.indexOf('@');
  if (at <= 0) return null;
  const local = lower.slice(0, at);
  const host = lower.slice(at + 1);
  if (host !== domain && !host.endsWith(`.${domain}`)) return null;
  return TOKEN_RE.test(local) ? local : null;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const domain = env.MAIL_TESTER_DOMAIN || 'mail.dnsbunch.com';
    const to = message.to;
    const token = extractToken(to, domain);
    if (!token) {
      message.setReject('Invalid recipient');
      return;
    }

    const rawStream = message.raw;
    const rawBuffer = await new Response(rawStream).arrayBuffer();
    if (rawBuffer.byteLength > MAX_BYTES) {
      message.setReject('Message too large');
      return;
    }

    const rawBase64 = btoa(String.fromCharCode(...new Uint8Array(rawBuffer)));

    const payload = {
      token,
      to,
      from: message.from,
      raw: rawBase64,
      received_at: new Date().toISOString(),
      message_size: rawBuffer.byteLength,
    };

    const res = await fetch(env.INBOUND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mail-Test-Secret': env.MAIL_TESTER_WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      message.setReject('Upstream rejected message');
    }
  },
};
