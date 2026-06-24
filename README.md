# Formula Builder

一个基于 Vue 3 + Element Plus 的低代码公式编辑器组件。

通过点击或拖拽变量、函数、运算符来构建公式，支持 Token 化编辑、拖拽排序、括号匹配、公式验证、JSON 导入/导出。

**GitHub**: https://github.com/Mobaitt/formula-builder

## 安装

```bash
npm install formula-builder element-plus vue
```

## 快速开始

```vue
<script setup lang="ts">
import FormulaDesigner from 'formula-builder'
import type { DeviceNode } from 'formula-builder'

// 可选：自定义变量设备树（不传则使用内置示例数据）
const devices: DeviceNode[] = [
  {
    id: 'boiler',
    label: '锅炉',
    children: [
      { id: 'temp', name: 'temp', label: '温度', type: 'number', unit: '°C' },
      { id: 'pressure', name: 'pressure', label: '压力', type: 'number', unit: 'MPa' },
    ],
  },
  {
    id: 'pump',
    label: '泵',
    children: [
      { id: 'flow', name: 'flow', label: '流量', type: 'number', unit: 'm³/h' },
      { id: 'speed', name: 'speed', label: '转速', type: 'number', unit: 'rpm' },
    ],
  },
]
</script>

<template>
  <div style="height: 100vh">
    <FormulaDesigner :devices="devices" />
  </div>
</template>
```

### 使用扁平变量列表

```vue
<script setup lang="ts">
import FormulaDesigner from 'formula-builder'
import type { VariableItem } from 'formula-builder'

const variables: VariableItem[] = [
  { id: 'temp', name: 'temp', label: '温度', type: 'number', unit: '°C' },
  { id: 'flow', name: 'flow', label: '流量', type: 'number', unit: 'm³/h' },
]
</script>

<template>
  <FormulaDesigner :variables="variables" />
</template>
```

## Props

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `devices` | `DeviceNode[]` | 内置示例 | 设备 → 变量树形结构 |
| `variables` | `VariableItem[]` | — | 扁平变量列表（当 `devices` 未设置时生效） |

不传 props 时使用内置的 4 组设备共 12 个变量 + 7 个函数。

## 功能特性

- **Token 编辑器** — hidden-input + 可视光标方案，每个变量/函数/运算符为独立 Token
- **变量系统** — 设备分组、树形展示、展开折叠、搜索（匹配中文/英文名）
- **函数面板** — 内置 7 个函数，每个带 `?` 帮助弹窗（签名/说明/示例）
- **运算符面板** — 算术/比较/逻辑/括号分组
- **键盘输入** — 数字键、小数点、运算符快捷键、Backspace/Delete
- **拖拽排序** — Token 间拖拽重排，从变量面板拖入变量
- **括号匹配** — 光标在括号处时高亮匹配对
- **公式验证** — 实时检查括号匹配、相邻合法性、首尾合法性
- **输出配置** — 小数位数、前缀、后缀、千分位分隔、空值显示
- **导入/导出** — JSON 格式保存和恢复
- **右键菜单** — 删除、左移、右移

## 内置数据

### 设备与变量

| 设备 | 变量 |
|------|------|
| 钻井设备 | 井深 / 钻速 / 钻压 |
| 压力监测 | 套压 / 油压 / 井口压力 |
| 温度监测 | 温度 / 入口温度 / 出口温度 |
| 流量监测 | 流量 / 累计流量 / 液位 |

### 内置函数

| 函数 | 签名 | 说明 |
|------|------|------|
| SUM | `SUM(n1, n2, ...)` | 求和 |
| AVG | `AVG(n1, n2, ...)` | 平均值 |
| MAX | `MAX(n1, n2, ...)` | 最大值 |
| MIN | `MIN(n1, n2, ...)` | 最小值 |
| ABS | `ABS(x)` | 绝对值 |
| ROUND | `ROUND(value, decimals)` | 四舍五入 |
| IF | `IF(condition, true_val, false_val)` | 条件判断 |

## 类型定义

```ts
interface VariableItem {
  id: string
  name: string     // 英文标识，用于表达式
  label: string    // 中文名，用于显示
  type: 'number' | 'string' | 'boolean'
  unit?: string
}

interface DeviceNode {
  id: string
  label: string
  children: VariableItem[]
}

interface FormulaFunction {
  name: string
  label: string
  argsCount: number | 'any'
  description?: string
}

interface OutputConfig {
  decimals: number
  prefix: string
  suffix: string
  useThousandsSeparator: boolean
  nullDisplay: string
}

type FormulaToken = VariableToken | FunctionToken | OperatorToken | NumberToken | BracketToken
```

## 开发

```bash
npm install
npm run dev     # 启动 demo
npm run build   # 构建库
```

## 技术栈

- **Vue 3** — Composition API + `<script setup>`
- **TypeScript** — 全量类型
- **Element Plus** — Tag / Scrollbar / Tooltip / Popover / Switch / InputNumber
- **Vite** — 构建工具（library mode）

## License

MIT
