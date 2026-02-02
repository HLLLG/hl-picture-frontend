/**
 * 空间级别枚举
 */
export const SPACE_LEVEL_ENUM = {
  COMMON: 0,
  PROFESSIONAL: 1,
  FLAGSHIP: 2,
}

/**
 * 空间级别文案映射
 */
export const SPACE_LEVEL_MAP = {
  0: '普通空间',
  1: '专业空间',
  2: '旗舰空间',
}

/**
 * 空间级别下拉表单选项
 *
 *
 */
export const SPACE_LEVEL_OPTIONS = Object.entries(SPACE_LEVEL_MAP).map(([key, label]) => ({
  value: Number(key), // 将string key转换为number
  label: label,
}))

/**
 * 空间类型枚举
 */
export const SPACE_TYPE_ENUM = {
  PRIVATE: 0,
  TEAM: 1,
}

/**
 * 空间类型文案映射
 */
export const SPACE_TYPE_MAP = {
  0: '私人空间',
  1: '团队空间',
}

/**
 * 空间类型下拉表单选项
 */
export const SPACE_TYPE_OPTIONS = Object.entries(SPACE_TYPE_ENUM).map(([key, label]) => ({
  value: Number(key),
  label: label,
}))

/**
 * 空间角色枚举
 */
export const SPACE_ROLE_ENUM = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const

/**
 * 空间角色文案映射
 */
export const SPACE_ROLE_MAP = {
  viewer: '浏览者',
  editor: '编辑者',
  admin: '管理员',
}

/**
 * 空间角色下拉表单选项
 */
export const SPACE_ROLE_OPTIONS = Object.entries(SPACE_ROLE_MAP).map(([key, label]) => ({
  value: key,
  label: label,
}))

/**
 * 空间权限常量
 */
export const SPACE_PERMISSION_ENUM = {
  /**
   * 空间用户管理权限
   */
  SPACE_USER_MANAGE: 'spaceUser:manage',
  /**
   * 图片查看权限
   */
  PICTURE_VIEW: 'picture:view',
  /**
   * 图片上传权限
   */
  PICTURE_UPLOAD: 'picture:upload',
  /**
   * 图片编辑权限
   */
  PICTURE_EDIT: 'picture:edit',
  /**
   * 图片删除权限
   */
  PICTURE_DELETE: 'picture:delete',
}
