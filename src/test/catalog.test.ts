import { describe, expect, it } from "vitest";

import { quote } from "@/lib/catalog";

describe("likes pricing", () => {
  it("200 likes cost ৳4", () => {
    expect(quote("freefire-likes", { kind: "package", packageId: "likes-200" }).amount).toBe(4);
  });
  it("custom 1600 likes cost ৳32 (৳4 per 200)", () => {
    expect(quote("freefire-likes", { kind: "custom", quantity: 1600 }).amount).toBe(32);
  });
  it("custom 50,000 likes cost ৳1000", () => {
    expect(quote("freefire-likes", { kind: "custom", quantity: 50000 }).amount).toBe(1000);
  });
  it("custom orders below 1600 likes are refused", () => {
    expect(() => quote("freefire-likes", { kind: "custom", quantity: 1400 })).toThrow();
  });
  it("custom orders must be a multiple of 200", () => {
    expect(() => quote("freefire-likes", { kind: "custom", quantity: 1700 })).toThrow();
  });
  it("custom orders above 50,000 likes are refused", () => {
    expect(() => quote("freefire-likes", { kind: "custom", quantity: 50200 })).toThrow();
  });
  it("unknown packages are refused", () => {
    expect(() => quote("freefire-likes", { kind: "package", packageId: "free" })).toThrow();
  });
});
