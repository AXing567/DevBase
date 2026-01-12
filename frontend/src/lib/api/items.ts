import { apiClient, getAuthToken } from "./client";
import { extractErrorMessage } from "./utils";

/**
 * 获取项目列表
 */
export async function getItems(skip: number = 0, limit: number = 10) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.GET("/api/v1/items/", {
    params: {
      query: { skip, limit },
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "获取项目列表失败"));
  }

  return data;
}

/**
 * 获取单个项目信息
 */
export async function getItem(itemId: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.GET("/api/v1/items/{id}", {
    params: {
      path: { id: itemId },
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "获取项目信息失败"));
  }

  return data;
}

/**
 * 创建项目
 */
export async function createItem(title: string, description?: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.POST("/api/v1/items/", {
    body: {
      title,
      description,
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "创建项目失败"));
  }

  return data;
}

/**
 * 更新项目
 */
export async function updateItem(
  itemId: string,
  updates: {
    title?: string;
    description?: string;
  }
) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.PUT("/api/v1/items/{id}", {
    params: {
      path: { id: itemId },
    },
    body: updates,
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "更新项目失败"));
  }

  return data;
}

/**
 * 删除项目
 */
export async function deleteItem(itemId: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.DELETE("/api/v1/items/{id}", {
    params: {
      path: { id: itemId },
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "删除项目失败"));
  }

  return data;
}
