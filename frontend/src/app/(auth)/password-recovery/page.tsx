"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { requestPasswordRecovery } from "@/lib/api/auth";

export default function PasswordRecoveryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("邮箱为必填项");
      return;
    }

    if (!email.includes("@")) {
      setError("请输入有效的邮箱");
      return;
    }

    try {
      setIsLoading(true);
      await requestPasswordRecovery(email);
      setSubmitted(true);
      toast.success("恢复链接已发送到您的邮箱");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "发送恢复邮件失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">检查您的邮箱</h1>
            <p className="mt-2 text-sm text-slate-600">我们已发送密码重置链接到 {email}</p>
          </div>

          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-slate-600">
              请检查您的邮箱（包括垃圾邮件文件夹），找到重置密码的链接。
            </p>
            <p className="text-sm text-slate-600">链接将在 24 小时内失效。</p>

            <Button onClick={() => router.push("/login")} className="w-full">
              返回登录
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">密码恢复</h1>
          <p className="mt-2 text-sm text-slate-600">输入您的邮箱地址，我们将发送密码重置链接</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* 邮箱 */}
          <div>
            <Label htmlFor="email">邮箱地址 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="mt-1"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {/* 提交按钮 */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "发送中..." : "发送恢复链接"}
          </Button>
        </form>

        {/* 链接到登录页 */}
        <div className="text-center text-sm">
          <span className="text-slate-600">记起密码了？ </span>
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}
