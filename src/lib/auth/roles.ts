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

// Demo login credentials for the 3 seeded backend users. The login page has
// one button per role instead of a credential form (see login/page.tsx) —
// these are what each button sends to POST /api/auth/login.
export const DEMO_CREDENTIALS: Record<RoleKey, { email: string; password: string }> = {
  thandi: { email: "thandi@example.com", password: "Password123!" },
  sipho: { email: "sipho@example.com", password: "Password123!" },
  exec: { email: "exec@example.com", password: "Password123!" },
};

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

/** Maps the backend's role claim (entity_officer/dsac_me/dsac_exec) to a RoleKey. */
export function roleKeyFromBackendRole(backendRole: string): RoleKey | null {
  switch (backendRole) {
    case "entity_officer":
      return "thandi";
    case "dsac_me":
      return "sipho";
    case "dsac_exec":
      return "exec";
    default:
      return null;
  }
}

export const ROUTE_ACCESS: Record<RoleKey, string[]> = {
  thandi: ["/dashboard", "/submit", "/documents"],
  sipho: ["/portfolio", "/alerts", "/entities"],
  exec: ["/portfolio", "/alerts", "/entities"], // The Exec shares the DSAC portfolio view
};
