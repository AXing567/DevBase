"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getUsers, deleteUser } from "@/lib/api/users";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at?: string | null;
}

export default function UsersPage() {
  const session = useSession();
  const router = useRouter();
  const isSuperuser = session?.data?.user?.is_superuser ?? false;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    // 非管理员重定向
    if (session?.status === "authenticated" && !isSuperuser) {
      router.push("/dashboard");
    }
  }, [session?.status, isSuperuser, router]);

  useEffect(() => {
    if (session?.status === "authenticated") {
      loadUsers();
    }
  }, [session?.status, page]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers(page * pageSize, pageSize);
      setUsers(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载用户列表失败");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    try {
      await deleteUser(userId);
      toast.success(`已删除用户 ${userEmail}`);
      loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除用户失败");
    }
  };

  if (session?.status === "loading") {
    return <div className="p-6">加载中...</div>;
  }

  if (!isSuperuser) {
    return <div className="p-6">无权限访问</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">用户管理</h1>
        <Button onClick={() => router.push("/users/create")}>新增用户</Button>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>邮箱</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                  暂无用户数据
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || "-"}</TableCell>
                  <TableCell>
                    {user.is_superuser ? (
                      <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        管理员
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        普通用户
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        激活
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        禁用
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("zh-CN") : "-"}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>确认删除用户</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除用户 {user.email} 吗？此操作无法撤销。
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(user.id, user.email)}>
                            删除
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          共 {users.length} 条记录 | 第 {page + 1} 页
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage(Math.max(0, page - 1))}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            disabled={users.length < pageSize}
            onClick={() => setPage(page + 1)}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
