import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

export function hashClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = (forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown').slice(0, 64);
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}
