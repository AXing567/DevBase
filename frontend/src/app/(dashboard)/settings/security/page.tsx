"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "当前密码为必填项";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "新密码为必填项";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "密码至少 8 个字符";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "确认密码为必填项";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "新密码不能与当前密码相同";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      toast.success("密码修改成功");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "修改密码失败，请检查当前密码是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">账户安全</h1>
        <p className="mt-1 text-sm text-slate-600">修改您的密码以保护账户安全</p>
      </div>

      <div className="max-w-2xl rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 当前密码 */}
          <div>
            <Label htmlFor="currentPassword">当前密码 *</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="输入您的当前密码"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="mt-1"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          {/* 新密码 */}
          <div>
            <Label htmlFor="newPassword">新密码 *</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="输入新密码（至少 8 个字符）"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="mt-1"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* 确认密码 */}
          <div>
            <Label htmlFor="confirmPassword">确认密码 *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-1"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "修改中..." : "修改密码"}
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
