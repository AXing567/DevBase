"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  collapsed?: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const userInitial = session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U";

  return (
    <div className="relative border-t border-slate-200 p-4" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-100",
          collapsed && "justify-center"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {userInitial.toUpperCase()}
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-900">
                {session.user.name || "用户"}
              </p>
              <p className="truncate text-xs text-slate-500">{session.user.email}</p>
            </div>
            <ChevronUp
              className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute bottom-full mb-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg",
            collapsed ? "left-full ml-2" : "left-4 right-4 w-auto"
          )}
        >
          <Link
            href="/settings/profile"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4" />
            <span>个人资料</span>
          </Link>

          <div className="my-1 h-px bg-slate-200" />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>退出登录</span>
          </button>
        </div>
      )}
    </div>
  );
}
