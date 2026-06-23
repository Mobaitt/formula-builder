/* ===== Token System ===== */

export type TokenType = 'variable' | 'function' | 'operator' | 'number' | 'bracket'

export interface BaseToken {
  id: string
  type: TokenType
}

export interface VariableToken extends BaseToken {
  type: 'variable'
  variableId: string
  name: string
  label: string
}

export interface FunctionToken extends BaseToken {
  type: 'function'
  functionName: string
  label: string
}

export interface OperatorToken extends BaseToken {
  type: 'operator'
  value: string
}

export interface NumberToken extends BaseToken {
  type: 'number'
  value: number
}

export interface BracketToken extends BaseToken {
  type: 'bracket'
  value: '(' | ')'
}

export type FormulaToken = VariableToken | FunctionToken | OperatorToken | NumberToken | BracketToken

/* ===== Variable System ===== */

export interface VariableItem {
  id: string
  name: string
  label: string
  type: 'number' | 'string' | 'boolean'
  unit?: string
}

export interface DeviceNode {
  id: string
  label: string
  children: VariableItem[]
}

/* ===== Function System ===== */

export interface FormulaFunction {
  name: string
  label: string
  argsCount: number | 'any'
  description?: string
}

export interface FunctionHelp {
  signature: string
  description: string
  example: string
}

/* ===== Output Config ===== */

export interface OutputConfig {
  decimals: number
  prefix: string
  suffix: string
  useThousandsSeparator: boolean
  nullDisplay: string
}

export const DEFAULT_OUTPUT_CONFIG: OutputConfig = {
  decimals: 2,
  prefix: '',
  suffix: '',
  useThousandsSeparator: true,
  nullDisplay: '--',
}

/* ===== Formula Save Format ===== */

export interface FormulaSaveData {
  tokens: FormulaToken[]
  expression: string
  outputConfig: OutputConfig
}

/* ===== Built-in Data ===== */

export const BUILT_IN_DEVICES: DeviceNode[] = [
  {
    id: 'drill',
    label: '钻井设备',
    children: [
      { id: 'depth', name: 'depth', label: '井深', type: 'number', unit: 'm' },
      { id: 'drill_speed', name: 'drill_speed', label: '钻速', type: 'number', unit: 'm/h' },
      { id: 'bit_load', name: 'bit_load', label: '钻压', type: 'number', unit: 'kN' },
    ],
  },
  {
    id: 'pressure',
    label: '压力监测',
    children: [
      { id: 'casing_pressure', name: 'casing_pressure', label: '套压', type: 'number', unit: 'MPa' },
      { id: 'oil_pressure', name: 'oil_pressure', label: '油压', type: 'number', unit: 'MPa' },
      { id: 'wellhead_pressure', name: 'wellhead_pressure', label: '井口压力', type: 'number', unit: 'MPa' },
    ],
  },
  {
    id: 'temperature',
    label: '温度监测',
    children: [
      { id: 'temperature', name: 'temperature', label: '温度', type: 'number', unit: '°C' },
      { id: 'inlet_temp', name: 'inlet_temp', label: '入口温度', type: 'number', unit: '°C' },
      { id: 'outlet_temp', name: 'outlet_temp', label: '出口温度', type: 'number', unit: '°C' },
    ],
  },
  {
    id: 'flow',
    label: '流量监测',
    children: [
      { id: 'flow_rate', name: 'flow_rate', label: '流量', type: 'number', unit: 'm³/h' },
      { id: 'cumulative_flow', name: 'cumulative_flow', label: '累计流量', type: 'number', unit: 'm³' },
      { id: 'fluid_level', name: 'fluid_level', label: '液位', type: 'number', unit: '%' },
    ],
  },
]

/** Flat list derived from devices, for the editor context */
export const BUILT_IN_VARIABLES: VariableItem[] = BUILT_IN_DEVICES.flatMap((d) => d.children)

export const BUILT_IN_FUNCTIONS: FormulaFunction[] = [
  { name: 'SUM', label: 'SUM', argsCount: 'any', description: '求和' },
  { name: 'AVG', label: 'AVG', argsCount: 'any', description: '平均值' },
  { name: 'MAX', label: 'MAX', argsCount: 'any', description: '最大值' },
  { name: 'MIN', label: 'MIN', argsCount: 'any', description: '最小值' },
  { name: 'ABS', label: 'ABS', argsCount: 1, description: '绝对值' },
  { name: 'ROUND', label: 'ROUND', argsCount: 2, description: '四舍五入' },
  { name: 'IF', label: 'IF', argsCount: 3, description: '条件判断' },
]

export const FUNCTIONS_HELP: Record<string, FunctionHelp> = {
  SUM: {
    signature: 'SUM(n1, n2, ...)',
    description: '对多个数值参数求和，返回它们的总和。参数数量不限。',
    example: 'SUM([流量], [累计流量])',
  },
  AVG: {
    signature: 'AVG(n1, n2, ...)',
    description: '计算多个数值参数的平均值，返回算术平均数。参数数量不限。',
    example: 'AVG([温度], [入口温度], [出口温度])',
  },
  MAX: {
    signature: 'MAX(n1, n2, ...)',
    description: '返回多个数值参数中的最大值。参数数量不限。',
    example: 'MAX([套压], [油压], [井口压力])',
  },
  MIN: {
    signature: 'MIN(n1, n2, ...)',
    description: '返回多个数值参数中的最小值。参数数量不限。',
    example: 'MIN([套压], [油压], [井口压力])',
  },
  ABS: {
    signature: 'ABS(x)',
    description: '返回数值 x 的绝对值。需要一个参数。',
    example: 'ABS([井深] - 1000)',
  },
  ROUND: {
    signature: 'ROUND(value, decimals)',
    description: '将数值四舍五入到指定小数位数。value 为待处理数值，decimals 为保留位数。',
    example: 'ROUND([温度], 2)',
  },
  IF: {
    signature: 'IF(condition, true_val, false_val)',
    description: '条件判断。condition 为真时返回 true_val，否则返回 false_val。',
    example: 'IF([套压] > 10, [套压] * 2, [套压])',
  },
}

export const OPERATORS: string[] = [
  '+', '-', '*', '/', '%',
  '>', '<', '>=', '<=', '==', '&&', '||',
  ',',
]

export const BRACKETS: string[] = ['(', ')']
