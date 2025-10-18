interface AdminActionLogEntry {
  action: "email_sent" | "call_initiated" | "account_disabled";
  adminId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const recordAdminAction = async (entry: AdminActionLogEntry) => {
  if (!entry.adminId) {
    throw new Error("Admin identifier is required to record an action");
  }

  const payload = {
    ...entry,
    metadata: entry.metadata ?? {},
  };

  console.info(
    `[audit] ${payload.timestamp} | admin:${payload.adminId} | action:${payload.action}`,
    payload.metadata,
  );

  return payload;
};
