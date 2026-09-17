import { describe, expect, it } from "vitest";
import { isRoleKey, ROUTE_ACCESS, roles } from "@/lib/auth/roles";

describe("isRoleKey", () => {
  it("accepts known role keys", () => {
    expect(isRoleKey("thandi")).toBe(true);
    expect(isRoleKey("sipho")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isRoleKey("admin")).toBe(false);
    expect(isRoleKey(undefined)).toBe(false);
    expect(isRoleKey("")).toBe(false);
  });
});

describe("ROUTE_ACCESS", () => {
  it("only allows entity officers into entity-facing routes", () => {
    expect(ROUTE_ACCESS.thandi).toContain("/dashboard");
    expect(ROUTE_ACCESS.thandi).not.toContain("/portfolio");
  });

  it("only allows DSAC oversight into DSAC-facing routes", () => {
    expect(ROUTE_ACCESS.sipho).toContain("/portfolio");
    expect(ROUTE_ACCESS.sipho).not.toContain("/dashboard");
  });

  it("routes each role home to a path it is actually allowed to see", () => {
    for (const key of Object.keys(roles) as (keyof typeof roles)[]) {
      const def = roles[key];
      const allowed = ROUTE_ACCESS[key].some((prefix) => def.homePath.startsWith(prefix));
      expect(allowed).toBe(true);
    }
  });
});
