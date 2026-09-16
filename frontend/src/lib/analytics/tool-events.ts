import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export type ToolEventName = 'tool_run' | 'tool_error';

export type ToolEventPayload = {
  event: ToolEventName;
  tool_id: string;
  success: boolean;
  duration_ms: number;
  code?: string;
  surface?: string;
  day: string;
  user_id_hash?: string;
};

function hashUserId(userId: string): string {
  return crypto.createHash('sha256').update(userId).digest('hex').slice(0, 16);
}

function dayBucket(): string {
  return new Date().toISOString().slice(0, 10);
}

function appendDevLog(payload: ToolEventPayload): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  try {
    const dir = path.join(process.cwd(), '.data');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'events.log'), `${JSON.stringify(payload)}\n`, 'utf8');
  } catch {
    // Best-effort dev logging only
  }
}

export function logToolEvent(
  event: ToolEventName,
  params: {
    toolId: string;
    success: boolean;
    durationMs: number;
    code?: string;
    surface?: string;
    userId?: string;
  },
): void {
  const payload: ToolEventPayload = {
    event,
    tool_id: params.toolId,
    success: params.success,
    duration_ms: params.durationMs,
    code: params.code,
    surface: params.surface,
    day: dayBucket(),
    ...(params.userId ? { user_id_hash: hashUserId(params.userId) } : {}),
  };
  console.info('[tool-event]', JSON.stringify(payload));
  appendDevLog(payload);
}
