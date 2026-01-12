import { apiClient, getAuthToken } from "./client";
import { extractErrorMessage } from "./utils";

interface CreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

/**
 * 获取用户列表
 */
export async function getUsers(skip: number = 0, limit: number = 10) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.GET("/api/v1/users/", {
    params: {
      query: { skip, limit },
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "获取用户列表失败"));
  }

  return data;
}

/**
 * 获取单个用户信息
 */
export async function getUser(userId: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.GET("/api/v1/users/{user_id}", {
    params: {
      path: { user_id: userId },
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "获取用户信息失败"));
  }

  return data;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUserInfo() {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.GET("/api/v1/users/me", {
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "获取当前用户信息失败"));
  }

  return data;
}

/**
 * 创建用户（仅管理员）
 */
export async function createUser(
  email: string,
  password: string,
  fullName?: string,
  isActive?: boolean,
  isSuperuser?: boolean
) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const body: CreateUserRequest = {
    email,
    password,
    full_name: fullName,
    is_active: isActive ?? true,
    is_superuser: isSuperuser ?? false,
  };

  const { data, error } = await apiClient.POST("/api/v1/users/", {
    body,
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "创建用户失败"));
  }

  return data;
}

/**
 * 更新当前用户信息
 */
export async function updateCurrentUser(updates: {
  email?: string;
  full_name?: string;
  password?: string;
}) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.PATCH("/api/v1/users/me", {
    body: updates,
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "更新用户信息失败"));
  }

  return data;
}

/**
 * 更新指定用户信息（仅管理员）
 */
export async function updateUser(userId: string, updates: UpdateUserRequest) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = updates;

  const { data, error } = await apiClient.PATCH("/api/v1/users/{user_id}", {
    params: {
      path: { user_id: userId },
    },
    body,
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "更新用户信息失败"));
  }

  return data;
}

/**
 * 删除当前用户账户
 */
export async function deleteCurrentUser() {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.DELETE("/api/v1/users/me", {
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "删除账户失败"));
  }

  return data;
}

/**
 * 删除指定用户（仅管理员）
 */
export async function deleteUser(userId: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.DELETE("/api/v1/users/{user_id}", {
    params: {
      path: { user_id: userId },
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "删除用户失败"));
  }

  return data;
}

/**
 * 修改当前用户密码
 */
export async function changePassword(updates: { current_password: string; new_password: string }) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.PATCH("/api/v1/users/me/password", {
    body: updates,
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "修改密码失败"));
  }

  return data;
}
