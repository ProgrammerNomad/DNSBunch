import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { logToolEvent } from '@/lib/analytics/tool-events';
import { canRun } from '@/lib/can-run';
import { postInternalTool } from '@/lib/internal-api';
import { isAllowedToolId } from '@/lib/tool-allowlist';
import { validateDnsHealthBulkBody } from '@/lib/validate-dns-health-bulk';
import { isDomainToolId, validateToolDomainBody } from '@/lib/validate-tool-domain';

type RouteContext = { params: Promise<{ toolId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { toolId } = await context.params;
  const requestId = request.headers.get('X-Request-Id') || randomUUID();
  const started = Date.now();

  if (!isAllowedToolId(toolId)) {
    return NextResponse.json({ error: 'Unknown tool', code: 'UNKNOWN_TOOL' }, { status: 404 });
  }

  const gate = canRun(null, toolId);
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason || 'Not allowed', code: 'ENTITLEMENT_DENIED' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let proxyBody: unknown = body;
  let eventSurface: string | undefined;

  if (toolId === 'dns_health' && typeof body === 'object' && body !== null && (body as { surface?: string }).surface === 'bulk') {
    const validated = validateDnsHealthBulkBody(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error, code: validated.code },
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }
    proxyBody = validated.data;
    eventSurface = 'bulk';
  }

  if (isDomainToolId(toolId)) {
    const validated = validateToolDomainBody(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error, code: validated.code },
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }
    proxyBody = validated.data;
  }

  try {
    const upstream = await postInternalTool(toolId, proxyBody, requestId);
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      logToolEvent('tool_error', {
        toolId,
        success: false,
        durationMs: Date.now() - started,
        code: String(upstream.status),
        surface: eventSurface,
      });
      return NextResponse.json(data, {
        status: upstream.status,
        headers: { 'X-Request-Id': requestId },
      });
    }

    logToolEvent('tool_run', {
      toolId,
      success: true,
      durationMs: Date.now() - started,
      surface: eventSurface,
    });

    return NextResponse.json(data, {
      status: upstream.status,
      headers: { 'X-Request-Id': requestId },
    });
  } catch (error) {
    logToolEvent('tool_error', {
      toolId,
      success: false,
      durationMs: Date.now() - started,
      code: 'PROXY_ERROR',
      surface: eventSurface,
    });
    return NextResponse.json(
      {
        error: 'Failed to connect to tool service',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROXY_ERROR',
      },
      { status: 502, headers: { 'X-Request-Id': requestId } },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
