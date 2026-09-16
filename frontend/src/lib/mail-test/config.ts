export function getMailTesterDomain(): string {
  return (process.env.MAIL_TESTER_DOMAIN || 'test.local').trim().toLowerCase();
}

export function getMailTesterSessionTtlMinutes(): number {
  const raw = parseInt(process.env.MAIL_TESTER_SESSION_TTL_MINUTES || '60', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 60;
}

export function getMailTesterMaxSessionsPerIpHour(): number {
  const raw = parseInt(process.env.MAIL_TESTER_MAX_SESSIONS_PER_IP_HOUR || '5', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
}

export function isMailTesterDevIngestEnabled(): boolean {
  return process.env.MAIL_TESTER_DEV_INGEST === 'true';
}

export function isMailTesterDevIngestPublic(): boolean {
  return process.env.NEXT_PUBLIC_MAIL_TESTER_DEV_INGEST === 'true';
}

export function formatMailTestAddress(token: string): string {
  return `${token}@${getMailTesterDomain()}`;
}
