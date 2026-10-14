import { describe, it, expect } from "vitest";
import { safeDate, fmtDate } from "@/lib/date";

describe("safeDate", () => {
  it("parses a YYYY-MM-DD string as local midnight", () => {
    const d = safeDate("2024-05-15");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(4); // 0-indexed
    expect(d.getDate()).toBe(15);
  });

  it("parses a [year, month, day] array (Java LocalDate format)", () => {
    const d = safeDate([2024, 5, 15]);
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(15);
  });

  it("handles month boundary correctly — month 1 = January", () => {
    const d = safeDate([2024, 1, 1]);
    expect(d.getMonth()).toBe(0);
  });

  it("handles month boundary correctly — month 12 = December", () => {
    const d = safeDate([2024, 12, 31]);
    expect(d.getMonth()).toBe(11);
    expect(d.getDate()).toBe(31);
  });

  it("returns an invalid Date for unparseable input", () => {
    const d = safeDate("not-a-date");
    expect(isNaN(d.getTime())).toBe(true);
  });

  it("produces the same result for string and array representations of the same date", () => {
    const fromString = safeDate("2025-03-20");
    const fromArray = safeDate([2025, 3, 20]);
    expect(fromString.getTime()).toBe(fromArray.getTime());
  });
});

describe("fmtDate", () => {
  it("formats a YYYY-MM-DD string in en-ZA locale", () => {
    const result = fmtDate("2024-05-01");
    expect(result).toContain("2024");
    expect(result).toContain("01");
  });

  it("formats a Java array date", () => {
    const result = fmtDate([2024, 5, 1]);
    expect(result).toContain("2024");
  });

  it("returns the raw string when input is unparseable", () => {
    expect(fmtDate("garbage")).toBe("garbage");
  });

  it("returns the raw string for undefined input", () => {
    expect(fmtDate(undefined)).toBe("undefined");
  });
});
