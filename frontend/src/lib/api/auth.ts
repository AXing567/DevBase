import { apiClient, getAuthToken } from "./client";
import { extractErrorMessage } from "./utils";

/**
 * 用户登录
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await apiClient.POST("/api/v1/login/access-token", {
    body: {
      username: email,
      password,
      scope: "",
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "登录失败"));
  }

  return data;
}

/**
 * 获取当前用户信息（验证 token）
 */
export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.POST("/api/v1/login/test-token", {
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
 * 用户注册
 */
export async function registerUser(email: string, password: string, fullName?: string) {
  const { data, error } = await apiClient.POST("/api/v1/users/signup", {
    body: {
      email,
      password,
      full_name: fullName || undefined,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "注册失败"));
  }

  return data;
}

/**
 * 请求密码恢复（发送邮件）
 */
export async function requestPasswordRecovery(email: string) {
  const { data, error } = await apiClient.POST("/api/v1/password-recovery/{email}", {
    params: {
      path: { email },
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "请求密码恢复失败"));
  }

  return data;
}

/**
 * 重置密码
 */
export async function resetPassword(token: string, newPassword: string) {
  const { data, error } = await apiClient.POST("/api/v1/reset-password/", {
    body: {
      token,
      new_password: newPassword,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "重置密码失败"));
  }

  return data;
}

/**
 * 修改当前用户密码
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("未登录");
  }

  const { data, error } = await apiClient.PATCH("/api/v1/users/me/password", {
    body: {
      current_password: currentPassword,
      new_password: newPassword,
    },
    headers: {
      Authorization: token,
    },
  });

  if (error) {
    throw new Error(extractErrorMessage(error, "修改密码失败"));
  }

  return data;
}
