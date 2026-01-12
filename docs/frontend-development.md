# 前端开发指南

本文档详细说明如何在 AutoTemu 前端项目中进行开发，包括项目结构、组件开发、状态管理、API 集成和测试。

## 开发环境

### 启动开发服务器

```bash
cd frontend

# 安装依赖（首次）
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

### 代码检查和格式化

```bash
# ESLint 检查
pnpm lint

# 自动修复 ESLint 错误
pnpm lint:fix

# TypeScript 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 构建生产版本
pnpm build

# 本地预览生产构建
pnpm start
```

## 项目结构

```
frontend/src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证路由组（无导航栏）
│   │   ├── login/           # 登录页面
│   │   ├── signup/          # 注册页面
│   │   └── layout.tsx       # 认证布局
│   │
│   ├── (dashboard)/         # 仪表板路由组（含导航栏）
│   │   ├── dashboard/       # 主仪表板页面
│   │   ├── users/           # 用户管理
│   │   │   ├── page.tsx    # 用户列表
│   │   │   ├── [id]/       # 用户详情
│   │   │   └── create/     # 创建用户
│   │   ├── items/           # 物品管理
│   │   └── layout.tsx       # 仪表板布局（含导航）
│   │
│   ├── layout.tsx           # 全局根布局
│   ├── page.tsx             # 首页
│   └── api/                 # API Routes（可选）
│
├── components/              # React 组件库
│   ├── ui/                 # Shadcn/UI 基础组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── forms/              # 表单组件
│   │   ├── LoginForm.tsx
│   │   └── ProductForm.tsx
│   └── layout/             # 布局组件
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/                     # 工具函数和配置
│   ├── api/                # API 客户端
│   │   ├── client.ts       # OpenAPI 客户端实例
│   │   ├── generated/      # 自动生成的 TypeScript 类型
│   │   └── hooks.ts        # API 自定义 Hooks
│   ├── utils.ts            # 通用工具函数
│   └── hooks/              # 自定义 Hooks
│       └── useAuth.ts
│
├── types/                   # TypeScript 类型定义
│   └── index.ts
│
└── styles/                  # 全局样式
    └── globals.css
```

## 组件开发

### 创建新组件

**函数式组件（推荐）**

```tsx
// components/ProductCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-bold text-blue-600 mb-4">
          ${product.price.toFixed(2)}
        </p>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(product)}>
              编辑
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => onDelete(product)}
            >
              删除
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 使用 Shadcn/UI

添加新组件：
```bash
# 添加 Button 组件
npx shadcn-ui@latest add button

# 添加 Dialog 组件
npx shadcn-ui@latest add dialog

# 查看所有可用组件
npx shadcn-ui@latest --help
```

使用组件：
```tsx
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"

export function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开对话框</Button>
      </DialogTrigger>
      <DialogContent>
        <p>对话框内容</p>
      </DialogContent>
    </Dialog>
  )
}
```

## 状态管理

### 使用 TanStack Query

**查询数据**

```tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { getProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/ProductCard"

export default function ProductsPage() {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**修改数据（Mutation）**

```tsx
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProduct } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import type { ProductCreate } from "@/types"

export function CreateProductForm() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // 重新获取产品列表
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => {
      console.error("创建产品失败:", error)
    },
  })

  const handleSubmit = (data: ProductCreate) => {
    createMutation.mutate(data)
  }

  return (
    <Button
      onClick={() => handleSubmit({ name: "Test", price: 99 })}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? "创建中..." : "创建产品"}
    </Button>
  )
}
```

## API 集成

### 自动生成 API 客户端

首先确保后端正在运行，然后：

```bash
cd frontend

# 从后端生成 TypeScript 类型
pnpm generate-api
```

这会生成：
- `lib/api/generated/schema.ts` - TypeScript 类型定义
- `lib/api/generated/client.ts` - API 客户端

### 使用 OpenAPI Fetch

```typescript
// lib/api/client.ts
import createClient from "openapi-fetch"
import type { paths } from "./generated/schema"

const client = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
})

export default client
```

```typescript
// lib/api/products.ts
import client from "./client"

export async function getProducts() {
  const { data, error } = await client.GET("/api/v1/products/")
  if (error) throw error
  return data
}

export async function createProduct(product: {
  name: string
  price: number
}) {
  const { data, error } = await client.POST("/api/v1/products/", {
    body: product,
  })
  if (error) throw error
  return data
}
```

## 路由和导航

### App Router 基础

**嵌套路由**

```tsx
// app/products/[id]/page.tsx
export default function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  return <div>产品 ID: {params.id}</div>
}

// URL: /products/123
```

**路由组（无 URL 影响）**

```
app/
├── (dashboard)/          # 路由组，不影响 URL
│   ├── layout.tsx       # 仪表板布局
│   └── page.tsx         # /
├── (auth)/              # 认证路由组
│   ├── login/page.tsx   # /login
│   └── signup/page.tsx  # /signup
```

### 客户端导航

```tsx
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ProductList() {
  const router = useRouter()

  return (
    <>
      <Button
        onClick={() => router.push("/products/123")}
      >
        查看详情
      </Button>

      <Button
        onClick={() => router.back()}
      >
        返回
      </Button>
    </>
  )
}
```

## 表单处理

### React Hook Form + Zod

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 定义表单验证规则
const productSchema = z.object({
  name: z.string().min(1, "产品名称不能为空"),
  description: z.string().optional(),
  price: z.number().positive("价格必须大于 0"),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const onSubmit = (data: ProductFormData) => {
    console.log("表单数据:", data)
    // 提交数据到 API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>产品名称</label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label>价格</label>
        <Input
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && (
          <p className="text-red-500 text-sm">{errors.price.message}</p>
        )}
      </div>

      <Button type="submit">提交</Button>
    </form>
  )
}
```

## 样式开发

### Tailwind CSS

**响应式设计**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// grid-cols-1: 手机（默认）
// md:grid-cols-2: 平板（768px 及以上）
// lg:grid-cols-3: 桌面（1024px 及以上）
```

**暗色模式**

```tsx
// 在 tailwind.config.ts 中启用
export const config = {
  darkMode: "class",
  // ...
}

// 使用
<div className="bg-white dark:bg-slate-900">
  <p className="text-black dark:text-white">内容</p>
</div>
```

## 测试

### 单元测试 (Vitest)

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from "@testing-library/react"
import { ProductCard } from "@/components/ProductCard"

describe("ProductCard", () => {
  it("显示产品信息", () => {
    const product = {
      id: 1,
      name: "测试产品",
      price: 99.99,
      description: "这是一个测试产品",
    }

    render(<ProductCard product={product} />)

    expect(screen.getByText("测试产品")).toBeInTheDocument()
    expect(screen.getByText("$99.99")).toBeInTheDocument()
  })

  it("点击编辑按钮时调用 onEdit", () => {
    const mockEdit = vi.fn()
    const product = { id: 1, name: "Test", price: 99.99 }

    render(<ProductCard product={product} onEdit={mockEdit} />)

    screen.getByText("编辑").click()
    expect(mockEdit).toHaveBeenCalledWith(product)
  })
})
```

### E2E 测试 (Playwright)

```typescript
// e2e/products.spec.ts
import { test, expect } from "@playwright/test"

test("用户可以创建产品", async ({ page }) => {
  // 登录
  await page.goto("http://localhost:3000/login")
  await page.fill('input[name="email"]', "user@example.com")
  await page.fill('input[name="password"]', "password")
  await page.click('button[type="submit"]')

  // 等待重定向到仪表板
  await page.waitForURL("/dashboard")

  // 创建产品
  await page.click('button:has-text("新建产品")')
  await page.fill('input[name="name"]', "新产品")
  await page.fill('input[name="price"]', "99.99")
  await page.click('button[type="submit"]')

  // 验证产品出现在列表中
  await expect(
    page.locator('text=新产品')
  ).toBeVisible()
})
```

### 运行测试

```bash
# 单元测试
pnpm test

# 单个文件
pnpm test ProductCard

# 监视模式
pnpm test --watch

# E2E 测试
pnpm test:e2e

# 显示 UI
pnpm test:e2e --ui
```

## 常见问题

### 类型错误 "Property 'xxx' does not exist"

**解决**：重新生成 API 类型
```bash
pnpm generate-api
```

### 样式未应用

**解决**：
1. 检查 Tailwind CSS 配置
2. 确保 `globals.css` 导入了 Tailwind 指令
3. 清除 `.next` 缓存并重启开发服务器

### API 请求失败

**解决**：
1. 检查 `NEXT_PUBLIC_API_URL` 环境变量
2. 确保后端服务正在运行
3. 检查浏览器控制台 CORS 错误

---

**相关文档**：
- [API 开发指南](./api-development.md)
- [架构设计](./architecture.md)
