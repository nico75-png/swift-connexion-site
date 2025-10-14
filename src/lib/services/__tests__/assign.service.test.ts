import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  assignDriver,
  isDriverAvailable,
  processScheduledAssignments,
  scheduleDriverAssignment,
} from "@/lib/services/assign.service";
import {
  getOrders,
  resetMockStores,
  saveScheduledAssignments,
  getScheduledAssignments,
  ScheduledAssignment,
} from "@/lib/stores/driversOrders.store";

const storage = new Map<string, string>();

beforeAll(() => {
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
        clear: () => {
          storage.clear();
        },
      },
    },
    writable: true,
  });
});

beforeEach(() => {
  storage.clear();
  resetMockStores();
});

describe("assign.service", () => {
  it("assigne un chauffeur actif quelle que soit la zone de la commande", () => {
    const result = assignDriver("CMD-245", "DRV-101");

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.order?.driverId).toBe("DRV-101");
  });

  it("refuse l'affectation pour un chauffeur en pause", () => {
    const result = assignDriver("CMD-245", "DRV-103");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Chauffeur en pause — sélection impossible");
  });

  it("considère les planifications lors du calcul de disponibilité", () => {
    const scheduled: ScheduledAssignment = {
      id: "SCHED-1",
      orderId: "CMD-245",
      driverId: "DRV-101",
      start: "2025-01-15T16:00:00+01:00",
      end: "2025-01-15T17:30:00+01:00",
      executeAt: new Date(Date.now() + 60_000).toISOString(),
      createdAt: new Date().toISOString(),
      status: "PENDING",
    };

    saveScheduledAssignments([scheduled]);

    const available = isDriverAvailable(scheduled.driverId, scheduled.start, scheduled.end);
    expect(available).toBe(false);
  });

  it("exécute les planifications arrivées à échéance", () => {
    const futureDate = new Date(Date.now() + 60_000).toISOString();
    const scheduleResult = scheduleDriverAssignment("CMD-245", "DRV-101", futureDate);

    expect(scheduleResult.success).toBe(true);

    const pending = getScheduledAssignments()[0];
    const dueAssignment: ScheduledAssignment = {
      ...pending,
      executeAt: new Date(Date.now() - 5_000).toISOString(),
    };

    saveScheduledAssignments([dueAssignment]);

    processScheduledAssignments();

    const [updated] = getScheduledAssignments();
    expect(updated.status).toBe("COMPLETED");

    const order = getOrders().find((item) => item.id === "CMD-245");
    expect(order?.driverId).toBe("DRV-101");
  });
});
