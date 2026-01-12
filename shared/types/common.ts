/**
 * 通用类型定义
 *
 * 定义了项目中常用的通用类型，用于前后端共享
 */

/**
 * UUID 类型别名
 */
export type UUID = string;

/**
 * ISO 8601 日期时间字符串
 */
export type ISODateTime = string;

/**
 * 可空类型
 */
export type Nullable<T> = T | null;

/**
 * 可选类型 (显式)
 */
export type Optional<T> = T | undefined;

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 排除 null 和 undefined
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * 基础实体接口
 * 所有数据库实体都应包含这些字段
 */
export interface BaseEntity {
  /** 唯一标识符 */
  id: UUID;
  /** 创建时间 */
  created_at: ISODateTime;
  /** 更新时间 */
  updated_at: ISODateTime;
}

/**
 * 软删除实体接口
 */
export interface SoftDeletableEntity extends BaseEntity {
  /** 删除时间 (null 表示未删除) */
  deleted_at: Nullable<ISODateTime>;
  /** 是否已删除 */
  is_deleted: boolean;
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  /** 普通用户 */
  USER = "user",
  /** 管理员 */
  ADMIN = "admin",
  /** 超级管理员 */
  SUPER_ADMIN = "super_admin",
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  /** 活跃 */
  ACTIVE = "active",
  /** 禁用 */
  DISABLED = "disabled",
  /** 待验证 */
  PENDING = "pending",
}

/**
 * 排序方向
 */
export type SortOrder = "asc" | "desc";

/**
 * 排序配置
 */
export interface SortConfig {
  field: string;
  order: SortOrder;
}

/**
 * 过滤操作符
 */
export enum FilterOperator {
  EQUALS = "eq",
  NOT_EQUALS = "ne",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUALS = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUALS = "lte",
  CONTAINS = "contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IN = "in",
  NOT_IN = "not_in",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

/**
 * 过滤条件
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * 查询参数
 */
export interface QueryParams {
  /** 分页 */
  page?: number;
  page_size?: number;
  /** 排序 */
  sort_by?: string;
  sort_order?: SortOrder;
  /** 过滤 */
  filters?: FilterCondition[];
  /** 搜索关键词 */
  search?: string;
}

/**
 * 键值对
 */
export interface KeyValue<K = string, V = unknown> {
  key: K;
  value: V;
}

/**
 * 标签
 */
export interface Tag {
  name: string;
  color?: string;
}

/**
 * 文件信息
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 文件大小 (字节) */
  size: number;
  /** MIME 类型 */
  mime_type: string;
  /** 文件 URL */
  url: string;
  /** 上传时间 */
  uploaded_at: ISODateTime;
}

/**
 * 地理位置
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * 时间范围
 */
export interface DateRange {
  start: ISODateTime;
  end: ISODateTime;
}

/**
 * 数值范围
 */
export interface NumberRange {
  min: number;
  max: number;
}

/**
 * 操作结果
 */
export interface OperationResult {
  success: boolean;
  message?: string;
  affected_count?: number;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  total: number;
  success_count: number;
  failed_count: number;
  failed_items?: Array<{
    id: UUID;
    error: string;
  }>;
}

/**
 * 选项项 (用于下拉菜单等)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

/**
 * 树形结构节点
 */
export interface TreeNode<T = unknown> {
  id: UUID;
  label: string;
  data?: T;
  children?: TreeNode<T>[];
  parent_id?: UUID;
  is_leaf?: boolean;
}
