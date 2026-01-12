"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import type { MenuItemConfig } from "@/lib/modules/types";

interface SidebarItemProps {
  item: MenuItemConfig;
  active?: boolean;
  collapsed?: boolean;
}

export function SidebarItem({ item, active, collapsed }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.path as Route}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-slate-100 hover:text-slate-900",
          active ? "bg-primary/10 text-primary" : "text-slate-600",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            active ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
          )}
        />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    </li>
  );
}
