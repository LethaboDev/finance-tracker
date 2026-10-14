import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, "localStorage", { value: localStorageMock });

import {
  saveToken, getToken, clearToken,
  saveFullName, getFullName,
  isAuthenticated, getEmail,
} from "@/lib/auth";

function makeJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

beforeEach(() => localStorage.clear());

describe("saveToken / getToken", () => {
  it("returns null when nothing is stored", () => {
    expect(getToken()).toBeNull();
  });

  it("returns the stored token after saveToken", () => {
    saveToken("my-token");
    expect(getToken()).toBe("my-token");
  });
});

describe("saveFullName / getFullName", () => {
  it("returns null when nothing is stored", () => {
    expect(getFullName()).toBeNull();
  });

  it("returns the stored name after saveFullName", () => {
    saveFullName("Test User");
    expect(getFullName()).toBe("Test User");
  });
});

describe("clearToken", () => {
  it("removes both token and fullName", () => {
    saveToken("tok");
    saveFullName("Test");
    clearToken();
    expect(getToken()).toBeNull();
    expect(getFullName()).toBeNull();
  });
});

describe("isAuthenticated", () => {
  it("returns false when no token is stored", () => {
    expect(isAuthenticated()).toBe(false);
  });

  it("returns false for a token with a past expiry", () => {
    const expired = makeJwt({ sub: "user@test.com", exp: Math.floor(Date.now() / 1000) - 60 });
    saveToken(expired);
    expect(isAuthenticated()).toBe(false);
  });

  it("returns true for a token with a future expiry", () => {
    const valid = makeJwt({ sub: "user@test.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    saveToken(valid);
    expect(isAuthenticated()).toBe(true);
  });

  it("returns false for a malformed token", () => {
    saveToken("not.a.jwt");
    expect(isAuthenticated()).toBe(false);
  });
});

describe("getEmail", () => {
  it("returns null when no token is stored", () => {
    expect(getEmail()).toBeNull();
  });

  it("extracts the email (sub) from a valid token", () => {
    const token = makeJwt({ sub: "user@example.com", exp: Math.floor(Date.now() / 1000) + 3600 });
    saveToken(token);
    expect(getEmail()).toBe("user@example.com");
  });

  it("returns null for a malformed token", () => {
    saveToken("garbage");
    expect(getEmail()).toBeNull();
  });
});
