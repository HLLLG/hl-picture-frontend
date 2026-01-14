// 图片尺寸枚举
export const IMG_SIZE_ENUM = {
  EXTRA_SMALL: 0,
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
  EXTRA_LARGE: 4,
}

// 图片尺寸文案映射
export const IMG_SIZE_MAP = {
  0: '特小',
  1: '小',
  2: '中',
  3: '大',
  4: '特大',
}

// 下拉选项
export const IMG_SIZE_OPTIONS = Object.entries(IMG_SIZE_MAP).map(([key, label]) => ({
  value: Number(key),
  label,
}))
