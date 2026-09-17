export type RoleKey = "thandi" | "sipho" | "exec";

export interface RoleDefinition {
  role: RoleKey;
  displayName: string;
  title: string;
  entityName?: string;
  canAccessEntity: boolean;
  canAccessPortfolio: boolean;
  homePath: string;
}

export const roles: Record<RoleKey, RoleDefinition> = {
  thandi: {
    role: "thandi",
    displayName: "Thandi",
    title: "Entity Officer",
    entityName: "Arts & Culture Trust",
    canAccessEntity: true,
    canAccessPortfolio: false,
    homePath: "/dashboard",
  },
  sipho: {
    role: "sipho",
    displayName: "Sipho",
    title: "DSAC M&E / Compliance",
    canAccessEntity: false,
    canAccessPortfolio: true,
    homePath: "/portfolio",
  },
  exec: {
    role: "exec",
    displayName: "DG",
    title: "DSAC Executive",
    canAccessEntity: false,
    canAccessPortfolio: true,
    homePath: "/portfolio",
  },
};

export function isRoleKey(value: string | undefined): value is RoleKey {
  return value === "thandi" || value === "sipho" || value === "exec";
}

export const ROUTE_ACCESS: Record<RoleKey, string[]> = {
  thandi: ["/dashboard", "/submit", "/documents"],
  sipho: ["/portfolio", "/alerts", "/entities"],
  exec: ["/portfolio", "/alerts", "/entities"], // The Exec shares the DSAC portfolio view
};