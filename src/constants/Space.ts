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
 */
export const SPACE_LEVEL_OPTIONS = Object.entries(SPACE_LEVEL_MAP).map(([key, label]) => ({
  value: Number(key), // 将string key转换为number
  label: label,
}))
