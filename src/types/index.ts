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

/* ===== Function System ===== */

export interface FormulaFunction {
  name: string
  label: string
  argsCount: number | 'any'
  description?: string
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

export const BUILT_IN_VARIABLES: VariableItem[] = [
  { id: 'depth', name: 'depth', label: '井深', type: 'number', unit: 'm' },
  { id: 'casing_pressure', name: 'casing_pressure', label: '套压', type: 'number', unit: 'MPa' },
  { id: 'oil_pressure', name: 'oil_pressure', label: '油压', type: 'number', unit: 'MPa' },
  { id: 'temperature', name: 'temperature', label: '温度', type: 'number', unit: '°C' },
  { id: 'flow_rate', name: 'flow_rate', label: '流量', type: 'number', unit: 'm³/h' },
]

export const BUILT_IN_FUNCTIONS: FormulaFunction[] = [
  { name: 'SUM', label: 'SUM', argsCount: 'any', description: '求和' },
  { name: 'AVG', label: 'AVG', argsCount: 'any', description: '平均值' },
  { name: 'MAX', label: 'MAX', argsCount: 'any', description: '最大值' },
  { name: 'MIN', label: 'MIN', argsCount: 'any', description: '最小值' },
  { name: 'ABS', label: 'ABS', argsCount: 1, description: '绝对值' },
  { name: 'ROUND', label: 'ROUND', argsCount: 2, description: '四舍五入' },
  { name: 'IF', label: 'IF', argsCount: 3, description: '条件判断' },
]

export const OPERATORS: string[] = [
  '+', '-', '*', '/', '%',
  '>', '<', '>=', '<=', '==', '&&', '||',
  ',',
]

export const BRACKETS: string[] = ['(', ')']
