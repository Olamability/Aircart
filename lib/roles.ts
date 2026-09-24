import { auth } from "@clerk/nextjs/server";
import { rolePermissions } from "./permissions";
type Role = keyof typeof rolePermissions;
export const getUserRole = async (): Promise<Role | null> => {
  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    return null;
  }
  const role = sessionClaims.metadata?.role;
  if (typeof role === "string" && role in rolePermissions) {
    return role as Role;
  }
  return "customer";
};
