"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUser, updateUser } from "@/lib/api/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    isActive: true,
    isSuperuser: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoadingUser(true);
        const response = await getUser(userId);
        const userData = response;
        setUser(userData);
        setFormData({
          email: userData.email,
          fullName: userData.full_name || "",
          isActive: userData.is_active,
          isSuperuser: userData.is_superuser,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "加载用户信息失败");
        router.push("/users");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await updateUser(userId, {
        email: formData.email,
        full_name: formData.fullName || undefined,
        is_active: formData.isActive,
        is_superuser: formData.isSuperuser,
      });
      toast.success("用户信息更新成功");
      router.push("/users");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新用户失败");
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
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">编辑用户</h1>
        <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
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
              placeholder="用户姓名"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* 激活状态 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked as boolean })
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer font-normal">
              激活用户
            </Label>
          </div>

          {/* 管理员权限 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSuperuser"
              checked={formData.isSuperuser}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isSuperuser: checked as boolean })
              }
            />
            <Label htmlFor="isSuperuser" className="cursor-pointer font-normal">
              超级管理员
            </Label>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存更改"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/users")}
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
