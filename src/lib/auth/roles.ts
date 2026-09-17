export const roles = {
  thandi: {
    role: "Thandi",
    entityName: "Arts & Culture Entity",
    canAccessEntity: true,
    canAccessPortfolio: false,
  },
  sipho: {
    role: "Sipho",
    entityName: "DSAC Executive",
    canAccessEntity: false,
    canAccessPortfolio: true,
  },
} as const;
