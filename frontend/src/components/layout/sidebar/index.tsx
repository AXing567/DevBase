"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getEnabledModules } from "@/lib/modules/registry";
import { isMenuGroup, hasPermission, type MenuItemConfig } from "@/lib/modules/types";
import { SidebarItem } from "./sidebar-item";
import { SidebarGroup } from "./sidebar-group";
import { SidebarHeader } from "./sidebar-header";
import { SidebarFooter } from "./sidebar-footer";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
}

export function Sidebar({
  className,
  collapsed = false,
  onCollapsedChange,
  onNavigate,
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const menuItems = React.useMemo(() => {
    const modules = getEnabledModules();
    const items: Array<{
      type: "item" | "group";
      data: MenuItemConfig | { id: string; title: string; items: MenuItemConfig[] };
      order: number;
    }> = [];

    modules.forEach((module) => {
      if (isMenuGroup(module.menu)) {
        const filteredItems = module.menu.items.filter(
          (item) => !item.hidden && hasPermission(item, session)
        );

        if (filteredItems.length > 0) {
          items.push({
            type: "group",
            data: {
              id: module.menu.id,
              title: module.menu.title,
              items: filteredItems,
            },
            order: module.menu.order ?? 100,
          });
        }
      } else {
        if (!module.menu.hidden && hasPermission(module.menu, session)) {
          items.push({
            type: "item",
            data: module.menu,
            order: module.menu.order ?? 100,
          });
        }
      }
    });

    return items.sort((a, b) => a.order - b.order);
  }, [session]);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <SidebarHeader collapsed={collapsed} onCollapsedChange={onCollapsedChange} />

      <nav className="flex-1 overflow-y-auto px-3 py-4" onClick={onNavigate}>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.type === "group") {
              const groupData = item.data as {
                id: string;
                title: string;
                items: MenuItemConfig[];
              };
              return (
                <SidebarGroup
                  key={groupData.id}
                  title={groupData.title}
                  items={groupData.items}
                  currentPath={pathname}
                  collapsed={collapsed}
                />
              );
            } else {
              const menuItem = item.data as MenuItemConfig;
              return (
                <SidebarItem
                  key={menuItem.id}
                  item={menuItem}
                  active={pathname === menuItem.path || pathname.startsWith(menuItem.path + "/")}
                  collapsed={collapsed}
                />
              );
            }
          })}
        </ul>
      </nav>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
