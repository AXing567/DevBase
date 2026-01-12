import createClient from "openapi-fetch";
import type { paths, components } from "./generated/schema";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = createClient<paths>({
  baseUrl,
});

// 请求拦截器：注入 Authorization Token
apiClient.use({
  async onRequest({ request }) {
    // 客户端才能获取 session，服务端组件无法使用
    // 在需要 token 的地方通过传入 headers 参数
    return request;
  },
});

// 错误处理拦截器
apiClient.use({
  async onResponse({ response }) {
    // 处理各种错误状态码
    if (!response.ok) {
      const contentType = response.headers.get("content-type");

      // 提取错误信息
      let errorMessage = "请求失败";

      try {
        if (contentType?.includes("application/json")) {
          const errorResponse = await response.clone().json();
          errorMessage = errorResponse.detail || errorResponse.message || errorMessage;
        }
      } catch {
        // 无法解析为 JSON，使用状态码和默认错误信息
        errorMessage = getErrorMessage(response.status);
      }

      // 401: 未授权，token 过期或无效
      if (response.status === 401) {
        // 在业务层通过检查返回值来处理
        console.warn("Token 过期或无效");
      }

      // 403: 禁止访问
      if (response.status === 403) {
        console.warn("权限不足");
      }

      // 422: 验证错误
      if (response.status === 422) {
        console.warn("请求数据验证失败");
      }

      // 500: 服务器错误
      if (response.status >= 500) {
        console.error("服务器错误:", errorMessage);
      }
    }

    return response;
  },
});

/**
 * 根据 HTTP 状态码获取错误信息
 */
function getErrorMessage(status: number): string {
  const errorMap: Record<number, string> = {
    400: "请求参数错误",
    401: "未授权，请登录",
    403: "禁止访问",
    404: "资源不存在",
    422: "数据验证失败",
    429: "请求过于频繁",
    500: "服务器内部错误",
    502: "网关错误",
    503: "服务暂不可用",
  };
  return errorMap[status] || "请求失败";
}

export type ApiPaths = paths;
export type ApiComponents = components;

// 获取 Bearer Token（用于 API 请求）
export async function getAuthToken(): Promise<string | null> {
  // 动态导入 getSession（避免在服务端组件中报错）
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return session?.accessToken ? `Bearer ${session.accessToken}` : null;
}
