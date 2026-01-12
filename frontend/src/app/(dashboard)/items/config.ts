import { Package } from "lucide-react";
import type { ModuleConfig } from "@/lib/modules/types";

export const itemsModule: ModuleConfig = {
  id: "items",
  name: "项目管理",
  description: "管理和维护项目数据",
  owner: "product-team",
  enabled: true,
  menu: {
    id: "menu-items",
    label: "项目管理",
    icon: Package,
    path: "/items",
    order: 10,
  },
};
