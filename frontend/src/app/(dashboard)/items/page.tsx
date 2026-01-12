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
import { getItems, deleteItem } from "@/lib/api/items";
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

interface Item {
  id: string;
  title: string;
  description?: string | null;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export default function ItemsPage() {
  const session = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (session?.status === "authenticated") {
      loadItems();
    }
  }, [session?.status, page]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const response = await getItems(page * pageSize, pageSize);
      setItems(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载项目列表失败");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string, itemTitle: string) => {
    try {
      await deleteItem(itemId);
      toast.success(`已删除项目 ${itemTitle}`);
      loadItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "删除项目失败");
    }
  };

  if (session?.status === "loading") {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">项目管理</h1>
        <Button onClick={() => router.push("/items/create")}>新增项目</Button>
      </div>

      <div className="rounded-lg bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>项目名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
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
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                  暂无项目数据
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="max-w-md truncate text-slate-600">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString("zh-CN") : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString("zh-CN") : "-"}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/items/${item.id}`)}
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
                        <AlertDialogTitle>确认删除项目</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除项目 "{item.title}" 吗？此操作无法撤销。
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id, item.title)}>
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
          共 {items.length} 条记录 | 第 {page + 1} 页
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
            disabled={items.length < pageSize}
            onClick={() => setPage(page + 1)}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
