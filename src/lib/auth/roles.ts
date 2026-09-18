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

// Credentials kept here for testing the credentials login form
export const TEST_CREDENTIALS = {
  thandi: { email: "thandi@example.com", password: "Password123!" },
  bianca: { email: "bianca@example.com", password: "Password123!" }, // Kept for testing pending APP
  sipho: { email: "sipho@example.com", password: "Password123!" },
  exec: { email: "exec@example.com", password: "Password123!" },
};

export const roles: Record<RoleKey, RoleDefinition> = {
  thandi: {
    role: "thandi",
    displayName: "Entity Officer",
    title: "Entity Officer",
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

/** Maps the backend's role claim to a generic frontend RoleKey. */
export function roleKeyFromBackendRole(backendRole: string): RoleKey | null {
  switch (backendRole) {
    case "entity_officer":
      return "thandi"; // "thandi" represents the generic entity UI layout
    case "dsac_me":
      return "sipho";
    case "dsac_exec":
      return "exec";
    default:
      return null;
  }
}

export const ROUTE_ACCESS: Record<RoleKey, string[]> = {
  thandi: ["/dashboard", "/documents"],
  sipho: ["/portfolio", "/alerts", "/entities", "/kpi-builder"],
  exec: ["/portfolio", "/alerts", "/entities"], 
};