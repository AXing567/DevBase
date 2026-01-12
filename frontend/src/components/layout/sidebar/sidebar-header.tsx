"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function SidebarHeader({ collapsed, onCollapsedChange }: SidebarHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-2 font-bold text-slate-900",
          collapsed && "justify-center"
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          A
        </div>
        {!collapsed && <span>AutoTemu</span>}
      </Link>

      {onCollapsedChange && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn("h-8 w-8", collapsed && "hidden lg:flex")}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
