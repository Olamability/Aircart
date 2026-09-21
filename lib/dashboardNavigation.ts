import { hasPermission } from "./guards";
import { permissions } from "./permissions";
type Permission = (typeof permissions)[keyof typeof permissions];
interface NavigationItem {
  title: string;
  href: string;
  permission?: Permission;
}
export const getVisibleNavigation = async (navigation: NavigationItem[]) => {
  const visibleNavigation = [];
  for (const item of navigation) {
    if (!item.permission) {
      visibleNavigation.push(item);
      continue;
    }
    const allowed = await hasPermission(item.permission);
    if (allowed) {
      visibleNavigation.push(item);
    }
  }
  return visibleNavigation;
};
