"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCurrentUserInfo, updateCurrentUser } from "@/lib/api/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrentUser {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoadingUser(true);
        const response = await getCurrentUserInfo();
        setUser(response);
        setFormData({
          email: response.email,
          fullName: response.full_name || "",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "加载用户信息失败");
        router.push("/dashboard");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await updateCurrentUser({
        email: formData.email,
        full_name: formData.fullName || undefined,
      });
      toast.success("个人信息更新成功");
      setUser({
        ...user!,
        email: formData.email,
        full_name: formData.fullName,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新个人信息失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">个人资料</h1>
        <p className="mt-1 text-sm text-slate-600">修改您的个人信息</p>
      </div>

      <div className="max-w-2xl rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 邮箱 */}
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* 姓名 */}
          <div>
            <Label htmlFor="fullName">姓名</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="您的姓名"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* 角色信息 */}
          <div className="border-t pt-4">
            <p className="text-sm text-slate-600">
              角色：{user?.is_superuser ? "超级管理员" : "普通用户"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              状态：{user?.is_active ? "已激活" : "未激活"}
            </p>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存更改"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
