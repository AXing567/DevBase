"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getItem, updateItem } from "@/lib/api/items";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface Item {
  id: string;
  title: string;
  description?: string | null;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const loadItem = async () => {
      try {
        setIsLoadingItem(true);
        const response = await getItem(itemId);
        setItem(response);
        setFormData({
          title: response.title,
          description: response.description || "",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "加载项目信息失败");
        router.push("/items");
      } finally {
        setIsLoadingItem(false);
      }
    };

    loadItem();
  }, [itemId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("项目名称为必填项");
      return;
    }

    try {
      setIsLoading(true);
      await updateItem(itemId, {
        title: formData.title,
        description: formData.description || undefined,
      });
      toast.success("项目信息更新成功");
      router.push("/items");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新项目失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingItem) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">编辑项目</h1>
        <p className="mt-1 text-sm text-slate-600">{item?.title}</p>
      </div>

      <div className="max-w-2xl rounded-lg bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 项目名称 */}
          <div>
            <Label htmlFor="title">项目名称 *</Label>
            <Input
              id="title"
              type="text"
              placeholder="输入项目名称"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          {/* 描述 */}
          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="输入项目描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="mt-1"
            />
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存更改"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/items")}
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
