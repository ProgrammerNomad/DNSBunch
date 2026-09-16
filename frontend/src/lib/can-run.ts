export type CanRunUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
};

export type CanRunResult = {
  allowed: boolean;
  reason?: string;
};

/** Phase 0 stub - always allow free tools; Phase 3 adds entitlements by toolId. */
export function canRun(user: CanRunUser | null | undefined, toolId: string): CanRunResult {
  void user;
  void toolId;
  return { allowed: true };
}
