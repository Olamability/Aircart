// import { auth } from "@clerk/nextjs/server";
// import { permissions, rolePermissions } from "./permissions";
// type Permission = (typeof permissions)[keyof typeof permissions];
// type Role = keyof typeof rolePermissions;
// export const getCurrentUserRole = async (): Promise<Role | null> => {
//   const { sessionClaims } = await auth();
//   if (!sessionClaims) {
//     return null;
//   }
//   const role = sessionClaims.metadata?.role;
//   if (typeof role === "string" && role in rolePermissions) {
//     return role as Role;
//   }
//   return "customer";
// };
// export const hasPermission = async (
//   permission: Permission,
// ): Promise<boolean> => {
//   const role = await getCurrentUserRole();
//   if (!role) {
//     return false;
//   }
//   return (rolePermissions[role] as readonly string[]).includes(permission);
// };
// export const requirePermission = async (
//   permission: Permission,
// ): Promise<void> => {
//   const allowed = await hasPermission(permission);
//   if (!allowed) {
//     throw new Error("Unauthorized");
//   }
// };
