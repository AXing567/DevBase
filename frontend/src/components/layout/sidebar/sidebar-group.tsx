"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItemConfig } from "@/lib/modules/types";
import { SidebarItem } from "./sidebar-item";

interface SidebarGroupProps {
  title: string;
  items: MenuItemConfig[];
  currentPath: string;
  collapsed?: boolean;
  defaultOpen?: boolean;
}

export function SidebarGroup({
  title,
  items,
  currentPath,
  collapsed,
  defaultOpen = true,
}: SidebarGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    const hasActiveItem = items.some((item) => currentPath.startsWith(item.path));
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }, [currentPath, items]);

  if (collapsed) {
    const firstItem = items[0];
    if (!firstItem) return null;
    const Icon = firstItem.icon;

    return (
      <li className="group relative">
        <button
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title={title}
        >
          <Icon className="h-5 w-5" />
        </button>
        <div className="absolute left-full top-0 z-50 ml-2 hidden min-w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg group-hover:block">
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-slate-400">{title}</p>
          <ul className="space-y-1">
            {items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={currentPath === item.path}
                collapsed={false}
              />
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <ul className="mt-1 space-y-1">
          {items.map((item) => (
            <SidebarItem key={item.id} item={item} active={currentPath === item.path} />
          ))}
        </ul>
      )}
    </li>
  );
}
