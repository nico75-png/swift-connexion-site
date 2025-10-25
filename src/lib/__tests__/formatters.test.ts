import { describe, expect, it } from "vitest";
import { formatCurrencyEUR, formatDateFR } from "../formatters";

describe("formatters", () => {
  it("formats currency in EUR with French locale", () => {
    expect(formatCurrencyEUR(1234.5)).toBe("1 234,50 €");
    expect(formatCurrencyEUR(null)).toBe("0,00 €");
  });

  it("formats dates in French", () => {
    const iso = "2024-03-18T12:30:00.000Z";
    expect(formatDateFR(iso)).toMatch(/18\s+mars\s+2024/);
    expect(formatDateFR(iso, { withTime: true })).toMatch(/18\s+mars\s+2024/);
    expect(formatDateFR(undefined)).toBe("");
  });
});
