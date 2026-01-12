import type { LucideIcon } from "lucide-react";

/**
 * 权限配置
 */
export interface PermissionConfig {
  /** 是否需要超级管理员权限 */
  requireSuperuser?: boolean;
  /** 自定义权限检查函数（预留扩展） */
  customCheck?: (session: { user?: { is_superuser?: boolean; id?: string } }) => boolean;
}

/**
 * 菜单项配置
 */
export interface MenuItemConfig {
  /** 菜单项 ID（唯一标识） */
  id: string;
  /** 显示名称 */
  label: string;
  /** 图标组件 */
  icon: LucideIcon;
  /** 路由路径 */
  path: string;
  /** 权限配置 */
  permission?: PermissionConfig;
  /** 排序权重（数字越小越靠前，默认 100） */
  order?: number;
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 菜单分组配置
 */
export interface MenuGroupConfig {
  /** 分组 ID */
  id: string;
  /** 分组标题 */
  title: string;
  /** 排序权重 */
  order?: number;
  /** 分组内的菜单项 */
  items: MenuItemConfig[];
}

/**
 * 模块配置接口
 */
export interface ModuleConfig {
  /** 模块唯一标识 */
  id: string;
  /** 模块名称 */
  name: string;
  /** 模块描述 */
  description?: string;
  /** 模块版本 */
  version?: string;
  /** 模块所有者（团队成员标识） */
  owner?: string;
  /** 菜单配置 */
  menu: MenuItemConfig | MenuGroupConfig;
  /** 是否启用（默认 true） */
  enabled?: boolean;
}

/**
 * 判断是否为菜单分组
 */
export function isMenuGroup(menu: MenuItemConfig | MenuGroupConfig): menu is MenuGroupConfig {
  return "items" in menu;
}

/**
 * 检查用户是否有权限访问某个菜单项
 */
export function hasPermission(
  item: MenuItemConfig,
  session: { user?: { is_superuser?: boolean; id?: string } } | null
): boolean {
  if (!item.permission) return true;

  const { requireSuperuser, customCheck } = item.permission;

  if (requireSuperuser && !session?.user?.is_superuser) {
    return false;
  }

  if (customCheck && session) {
    return customCheck(session);
  }

  return true;
}
