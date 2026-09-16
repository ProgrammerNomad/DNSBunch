import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { logToolEvent } from '@/lib/analytics/tool-events';
import { isMailTesterDevIngestEnabled } from '@/lib/mail-test/config';
import { ingestMailTestRawAndWait } from '@/lib/mail-test/ingest';
import { serializeMailTestSession } from '@/lib/mail-test/session-json';
import { prisma } from '@/lib/prisma';

const MAX_EML_BYTES = 2_500_000;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const requestId = request.headers.get('X-Request-Id') || randomUUID();
  const started = Date.now();
  const { id } = await context.params;

  if (!isMailTesterDevIngestEnabled()) {
    return NextResponse.json(
      { error: 'Dev ingest is disabled', code: 'DEV_INGEST_DISABLED' },
      { status: 403, headers: { 'X-Request-Id': requestId } },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400, headers: { 'X-Request-Id': requestId } });
  }

  if (file.size > MAX_EML_BYTES) {
    return NextResponse.json({ error: 'File too large (max 2.5 MB)' }, { status: 400, headers: { 'X-Request-Id': requestId } });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const outcome = await ingestMailTestRawAndWait(id, buffer, requestId);

  const session = await auth();

  if (!outcome.ok) {
    logToolEvent('tool_error', {
      toolId: 'mail_tester',
      success: false,
      durationMs: Date.now() - started,
      code: String(outcome.status),
      surface: 'dev_ingest',
      userId: session?.user?.id,
    });
    return NextResponse.json({ error: outcome.error }, { status: outcome.status, headers: { 'X-Request-Id': requestId } });
  }

  logToolEvent('tool_run', {
    toolId: 'mail_tester',
    success: true,
    durationMs: Date.now() - started,
    surface: 'dev_ingest',
    userId: session?.user?.id,
  });

  const row = await prisma.mailTestSession.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404, headers: { 'X-Request-Id': requestId } });
  }

  return NextResponse.json(serializeMailTestSession(row), { headers: { 'X-Request-Id': requestId } });
}
