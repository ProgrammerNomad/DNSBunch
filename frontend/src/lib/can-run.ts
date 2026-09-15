export type CanRunResult = {
  allowed: boolean;
  reason?: string;
};

/** Phase 0 stub - always allow; Phase 3 adds entitlements. */
export function canRun(user: unknown, toolId: string): CanRunResult {
  void user;
  void toolId;
  return { allowed: true };
}
