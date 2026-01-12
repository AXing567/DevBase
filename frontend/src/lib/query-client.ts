import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟内数据不过期
      gcTime: 10 * 60 * 1000, // 10 分钟后回收缓存
      retry: 1, // 失败重试 1 次
      refetchOnWindowFocus: false, // 窗口获焦点时不自动重新获取
      refetchOnMount: false, // 挂载时不自动重新获取
    },
    mutations: {
      retry: 0, // mutation 不自动重试
    },
  },
});
