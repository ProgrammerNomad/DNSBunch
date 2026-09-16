/** Keep in sync with Python `tools.bootstrap.register_all_tools` (Phase 0). */
export const ALLOWED_TOOL_IDS = ['dns_health', 'dmarc_checker', 'spf_checker', 'dkim_checker'] as const;

export type AllowedToolId = (typeof ALLOWED_TOOL_IDS)[number];

export function isAllowedToolId(toolId: string): toolId is AllowedToolId {
  return (ALLOWED_TOOL_IDS as readonly string[]).includes(toolId);
}
