"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "./session";
import { isRoleKey, roles } from "./roles";

export async function loginAs(role: string) {
  if (!isRoleKey(role)) {
    throw new Error(`Unknown role: ${role}`);
  }
  await createSession(role);
  redirect(roles[role].homePath);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
