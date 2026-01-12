"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const session = useSession();
  const router = useRouter();

  const sessionData = session?.data;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">欢迎，{sessionData?.user?.name}！</h1>
        <p className="mt-2 text-slate-600">邮箱: {sessionData?.user?.email}</p>
        {sessionData?.user?.is_superuser && (
          <p className="mt-1 text-sm text-blue-600">• 超级管理员</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">快捷入口</h2>
          <div className="mt-4 space-y-2">
            {sessionData?.user?.is_superuser && (
              <Button variant="outline" onClick={() => router.push("/users")} className="w-full">
                用户管理
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/items")} className="w-full">
              项目管理
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/settings/profile")}
              className="w-full"
            >
              个人设置
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">账户操作</h2>
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              onClick={() => router.push("/settings/security")}
              className="w-full"
            >
              修改密码
            </Button>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full"
            >
              登出
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">系统信息</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>环境: {process.env.NODE_ENV}</p>
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
            <p>版本: 0.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
