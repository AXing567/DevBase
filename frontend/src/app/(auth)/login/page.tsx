"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("[Login Page] Attempting login with email:", email);
      const result = await signIn("credentials", {
        username: email,
        password,
        redirect: false,
      });

      console.log("[Login Page] SignIn result:", result);

      if (result?.error) {
        console.error("[Login Page] SignIn error:", result.error);
        toast.error(result.error || "登录失败");
      } else if (result?.ok) {
        toast.success("登录成功");
        router.push("/dashboard");
      } else {
        toast.error("登录失败，请重试");
      }
    } catch (error) {
      console.error("[Login Page] Exception:", error);
      toast.error("登录失败，请检查邮箱和密码");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">AutoTemu</h1>
            <p className="mt-2 text-slate-600">管理后台</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 个字符"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              没有账户？
              <Link href="/signup" className="ml-1 text-blue-600 hover:text-blue-700">
                注册
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center text-sm">
            <Link href="/password-recovery" className="text-blue-600 hover:text-blue-700">
              忘记密码？
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
