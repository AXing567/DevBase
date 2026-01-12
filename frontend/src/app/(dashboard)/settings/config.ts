import { User, Shield, AlertTriangle } from "lucide-react";
import type { ModuleConfig } from "@/lib/modules/types";

export const settingsModule: ModuleConfig = {
  id: "settings",
  name: "系统设置",
  description: "个人设置和账户管理",
  owner: "core-team",
  enabled: true,
  menu: {
    id: "group-settings",
    title: "设置",
    order: 100,
    items: [
      {
        id: "menu-settings-profile",
        label: "个人资料",
        icon: User,
        path: "/settings/profile",
        order: 1,
      },
      {
        id: "menu-settings-security",
        label: "安全设置",
        icon: Shield,
        path: "/settings/security",
        order: 2,
      },
      {
        id: "menu-settings-danger",
        label: "危险操作",
        icon: AlertTriangle,
        path: "/settings/danger",
        order: 3,
      },
    ],
  },
};
