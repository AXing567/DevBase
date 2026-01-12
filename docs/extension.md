# 浏览器扩展开发指南

本文档详细说明如何开发 AutoTemu 浏览器扩展。该扩展基于 Plasmo 框架，支持 Chrome、Firefox 和 Edge。

## Plasmo 框架介绍

Plasmo 是一个现代化的浏览器扩展开发框架，提供：

- 🔥 **热重载** - 修改代码自动刷新
- 📦 **一键多浏览器打包** - 同时构建 Chrome、Firefox、Edge 版本
- ⚛️ **React 支持** - 使用 React 和 TypeScript 开发
- 🎨 **Tailwind CSS 集成** - 开箱即用的样式方案
- 🔧 **自动权限生成** - 从代码自动生成 manifest.json

## 开发环境搭建

### 启动开发服务器

```bash
cd extension

# 安装依赖
pnpm install

# 启动开发模式（热重载）
pnpm dev
```

### 加载扩展到浏览器

#### Chrome / Edge

1. 打开浏览器扩展管理页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. 启用"开发者模式"（右上角）

3. 点击"加载已解压的扩展程序"

4. 选择 `extension/build/chrome-mv3-dev` 目录

5. 扩展会加载到浏览器中

#### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`

2. 点击"临时载入附加组件"

3. 选择 `extension/build/firefox-mv3-dev/manifest.json`

4. 扩展会加载到浏览器中

**重要**：修改代码后，扩展会自动热更新，但某些更改可能需要手动刷新

## 扩展结构

```
extension/src/
├── popup/              # 扩展弹窗UI
│   └── index.tsx       # 弹窗主入口
│
├── pages/              # 扩展独立页面
│   ├── options.tsx     # 设置页面
│   └── newtab.tsx      # 新标签页（可选）
│
├── components/         # 共享 React 组件
│   └── *.tsx
│
├── background/         # 后台脚本
│   └── index.ts        # Service Worker（Manifest V3）
│
├── content/            # 内容脚本
│   └── index.ts        # 在页面中注入代码
│
├── utils/              # 工具函数
│   └── *.ts
│
└── manifest.json       # 权限声明（自动生成）
```

### 文件用途

| 文件 | 说明 | 运行环境 |
|------|------|--------|
| **popup/** | 扩展菜单弹窗 | 扩展进程 |
| **background/** | 后台脚本，处理消息、定时任务 | 后台进程 |
| **content/** | 在网页中注入，可访问页面 DOM | 网页上下文 |
| **pages/** | 完整页面（选项、新标签页） | 扩展进程 |

## 核心功能开发

### 1. 创建 Popup（弹窗UI）

```tsx
// src/popup/index.tsx
import { useState, useEffect } from "react"

function IndexPopup() {
  const [data, setData] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 从存储中加载数据
    chrome.storage.local.get(["savedData"], (result) => {
      if (result.savedData) {
        setData(result.savedData)
      }
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      // 保存到扩展存储
      await chrome.storage.local.set({ savedData: data })
      alert("保存成功!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 300, padding: 16 }}>
      <h2>AutoTemu 扩展</h2>
      <input
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="输入数据"
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          width: "100%",
          padding: 8,
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "保存中..." : "保存"}
      </button>
    </div>
  )
}

export default IndexPopup
```

**CSS 样式**

创建 `src/popup/index.css`：

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 2. 创建后台脚本

```typescript
// src/background/index.ts
import type { PlasmoMessaging } from "@plasmohq/messaging"

// 监听来自 Content Script 或 Popup 的消息
const messageHandler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { action, data } = req.body

  switch (action) {
    case "getData":
      // 获取存储的数据
      const stored = await chrome.storage.local.get(["myData"])
      res.send(stored.myData || null)
      break

    case "saveData":
      // 保存数据
      await chrome.storage.local.set({ myData: data })
      res.send({ success: true })
      break

    default:
      res.send({ error: "Unknown action" })
  }
}

export default messageHandler

// 监听扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  console.log("扩展图标被点击, 标签页:", tab.id)
})

// 定时任务（每小时执行一次）
chrome.alarms.create("sync-data", { periodInMinutes: 60 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sync-data") {
    console.log("执行定时同步")
    // 执行同步操作
  }
})
```

### 3. 创建 Content Script

```typescript
// src/content/index.ts
import type { PlasmoCSConfig } from "plasmo"

// 指定脚本运行的网站
export const config: PlasmoCSConfig = {
  matches: ["https://*.example.com/*"],
  run_at: "document_end",
}

// 在页面加载时获取数据
function extractPageData() {
  return {
    title: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  }
}

// 发送消息到后台脚本
const pageData = extractPageData()
chrome.runtime.sendMessage({
  action: "pageLoaded",
  data: pageData,
})

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const content = document.body.innerText.substring(0, 1000)
    sendResponse({ content })
  }
})
```

## 与后端通信

### API 调用

```typescript
// src/utils/api.ts
const API_BASE = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function getProducts(token: string) {
  const response = await fetch(`${API_BASE}/products/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("Failed to fetch products")
  return response.json()
}

export async function createProduct(
  product: { name: string; price: number },
  token: string
) {
  const response = await fetch(`${API_BASE}/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  })
  if (!response.ok) throw new Error("Failed to create product")
  return response.json()
}
```

### 在 Popup 中使用 API

```tsx
// src/popup/index.tsx
import { useEffect, useState } from "react"
import { getProducts } from "~utils/api"

function IndexPopup() {
  const [products, setProducts] = useState([])
  const [token, setToken] = useState("")

  useEffect(() => {
    // 从存储中获取 Token
    chrome.storage.local.get(["token"], (result) => {
      if (result.token) {
        setToken(result.token)
        loadProducts(result.token)
      }
    })
  }, [])

  const loadProducts = async (token: string) => {
    try {
      const data = await getProducts(token)
      setProducts(data)
    } catch (error) {
      console.error("加载产品失败:", error)
    }
  }

  return (
    <div>
      <h2>我的产品</h2>
      <ul>
        {products.map((product: any) => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  )
}

export default IndexPopup
```

## 打包和发布

### 构建生产版本

```bash
# 构建所有浏览器版本
pnpm build

# 仅构建 Chrome
pnpm build --target=chrome-mv3

# 仅构建 Firefox
pnpm build --target=firefox-mv3
```

构建产物在 `build/` 目录：
- `build/chrome-mv3-prod/` - Chrome/Edge 版本
- `build/firefox-mv3-prod/` - Firefox 版本

### 打包为 ZIP

```bash
# 打包 Chrome 版本
cd build/chrome-mv3-prod
zip -r ../../autotemu-chrome.zip .

# 打包 Firefox 版本
cd ../firefox-mv3-prod
zip -r ../../autotemu-firefox.zip .
```

### 发布到商店

#### Chrome Web Store

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击"新建应用"
3. 上传 `autotemu-chrome.zip`
4. 填写扩展信息（名称、描述、图标）
5. 设置权限和托管政策
6. 提交审核

#### Firefox Add-ons

1. 访问 [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. 登录或创建账户
3. 提交新附加组件
4. 上传 `autotemu-firefox.zip`
5. 填写附加组件信息
6. 提交审核

## 权限说明

编辑 `package.json` 的 `manifest` 部分：

```json
{
  "manifest": {
    "permissions": [
      "storage",           // 本地存储
      "activeTab",        // 访问当前标签页
      "tabs",             // 管理标签页
      "scripting",        // 注入脚本
      "webRequest",       // 拦截网络请求
      "alarms"            // 定时任务
    ],
    "host_permissions": [
      "https://*.example.com/*",   // 访问 example.com
      "<all_urls>"                  // 访问所有网站（需谨慎）
    ],
    "action": {
      "default_popup": "popup.html"
    }
  }
}
```

## 调试技巧

### Popup 调试

右键点击扩展图标 → 检查弹出内容

### Content Script 调试

在目标网页打开 DevTools → Console 标签页

### Background Script 调试

1. 打开扩展管理页面（`chrome://extensions/`）
2. 找到扩展，点击"Service Worker"链接
3. 打开开发者工具进行调试

### 日志记录

```typescript
// 会在 DevTools 中显示
console.log("扩展日志:", data)

// 发送错误到后台服务
chrome.runtime.sendMessage({
  action: "logError",
  error: error.message,
})
```

## 常见问题

### 扩展加载失败

**症状**：加载扩展时出现错误

**解决**：
1. 检查 `manifest.json` 格式是否正确
2. 查看扩展管理页面的错误信息
3. 清除缓存：删除 `build/` 目录，重新运行 `pnpm build`

### Content Script 不执行

**症状**：脚本没有在网页中运行

**解决**：
1. 检查 `config.matches` 是否匹配目标网站
2. 确保目标网站已刷新（扩展加载后）
3. 检查浏览器控制台是否有错误信息

### API 跨域问题

**症状**：Content Script 调用 API 出现 CORS 错误

**解决方案 1**：使用后台脚本作为代理
```typescript
// background/index.ts
const messageHandler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const apiResponse = await fetch(req.body.url, {
    headers: req.body.headers,
  })
  res.send(await apiResponse.json())
}
```

**解决方案 2**：在后端配置 CORS

## 最佳实践

1. **最小化权限** - 只申请必需的权限
2. **安全通信** - 不要在消息中传递敏感信息
3. **错误处理** - 用 try-catch 包装网络请求
4. **性能** - 避免在后台脚本中执行耗时操作
5. **测试** - 在多个浏览器中测试扩展

---

**相关文档**：
- [架构设计](./architecture.md)
- [API 开发指南](./api-development.md)
