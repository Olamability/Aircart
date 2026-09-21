import { PermissionGuard } from "@/lib/permissionGuard";
import { permissions } from "@/lib/permissions";
const AdminTestPage = async () => {
  return (
    <PermissionGuard permission={permissions.products_create}>
      {" "}
      <div className="p-10">
        {" "}
        <h1 className="text-2xl font-bold">Permission Access Confirmed</h1>{" "}
        <p className="mt-2"> You have permission to create products. </p>{" "}
      </div>{" "}
    </PermissionGuard>
  );
};
export default AdminTestPage;
