"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./sidebar/mobile-nav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const handleCollapsedChange = (value: boolean) => {
    setCollapsed(value);
    localStorage.setItem("sidebar-collapsed", String(value));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} />
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col">
        {/* 移动端顶部栏 */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:hidden">
          <MobileNav />
          <span className="font-bold text-slate-900">AutoTemu</span>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
