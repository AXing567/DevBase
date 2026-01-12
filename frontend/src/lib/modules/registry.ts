import type { ModuleConfig } from "./types";

// ============================================
// 模块导入区域
// 每位团队成员在此添加自己模块的 import
// 请按模块 ID 字母顺序排列，减少冲突
// ============================================
import { dashboardModule } from "@/app/(dashboard)/dashboard/config";
import { itemsModule } from "@/app/(dashboard)/items/config";
import { settingsModule } from "@/app/(dashboard)/settings/config";
import { usersModule } from "@/app/(dashboard)/users/config";
// [NEW_MODULE_IMPORT] - 新模块在此行上方添加

// ============================================
// 模块注册列表
// 每位团队成员在此添加自己的模块
// 请按模块 ID 字母顺序排列，减少冲突
// ============================================
const modules: ModuleConfig[] = [
  dashboardModule,
  itemsModule,
  settingsModule,
  usersModule,
  // [NEW_MODULE_REGISTER] - 新模块在此行上方添加
];

/**
 * 获取所有启用的模块
 */
export function getEnabledModules(): ModuleConfig[] {
  return modules.filter((m) => m.enabled !== false);
}

/**
 * 根据 ID 获取模块配置
 */
export function getModuleById(id: string): ModuleConfig | undefined {
  return modules.find((m) => m.id === id);
}

/**
 * 获取所有模块（包括禁用的）
 */
export function getAllModules(): ModuleConfig[] {
  return [...modules];
}
