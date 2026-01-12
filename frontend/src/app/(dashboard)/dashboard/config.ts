import { LayoutDashboard } from "lucide-react";
import type { ModuleConfig } from "@/lib/modules/types";

export const dashboardModule: ModuleConfig = {
  id: "dashboard",
  name: "仪表板",
  description: "系统概览和快捷入口",
  owner: "core-team",
  enabled: true,
  menu: {
    id: "menu-dashboard",
    label: "仪表板",
    icon: LayoutDashboard,
    path: "/dashboard",
    order: 1,
  },
};
