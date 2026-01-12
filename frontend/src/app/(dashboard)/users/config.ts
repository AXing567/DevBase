import { Users } from "lucide-react";
import type { ModuleConfig } from "@/lib/modules/types";

export const usersModule: ModuleConfig = {
  id: "users",
  name: "用户管理",
  description: "管理系统用户和权限",
  owner: "admin-team",
  enabled: true,
  menu: {
    id: "menu-users",
    label: "用户管理",
    icon: Users,
    path: "/users",
    order: 90,
    permission: {
      requireSuperuser: true,
    },
  },
};
