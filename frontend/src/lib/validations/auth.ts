import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(8, { message: "密码至少 8 个字符" }),
});

export const signupSchema = z
  .object({
    email: z.string().email({ message: "请输入有效的邮箱地址" }),
    password: z
      .string()
      .min(8, { message: "密码至少 8 个字符" })
      .max(128, { message: "密码最多 128 个字符" }),
    confirmPassword: z.string(),
    full_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const passwordRecoverySchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    new_password: z
      .string()
      .min(8, { message: "密码至少 8 个字符" })
      .max(128, { message: "密码最多 128 个字符" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordRecoveryInput = z.infer<typeof passwordRecoverySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
