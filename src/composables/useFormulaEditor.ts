import {
  type ComputedRef,
  type InjectionKey,
  type Ref,
  computed,
  inject,
  provide,
  ref,
} from 'vue'
import type {
  FormulaFunction,
  FormulaToken,
  OutputConfig,
  VariableItem,
} from '../types'
import { DEFAULT_OUTPUT_CONFIG } from '../types'
import { generateId } from '../utils/token-utils'
import { tokensToExpression, validateTokens } from '../utils/formula-parser'

/**
 * The shared context injected by FormulaDesigner into all child components.
 */
export interface FormulaEditorContext {
  tokens: Ref<FormulaToken[]>
  cursorPos: Ref<number>
  variables: Ref<VariableItem[]>
  outputConfig: Ref<OutputConfig>
  hoveredTokenId: Ref<string | null>

  expression: ComputedRef<string>
  validation: ComputedRef<{ valid: boolean; error?: string }>

  insertToken: (token: FormulaToken, pos?: number) => void
  removeToken: (pos?: number) => void
  moveToken: (from: number, to: number) => void
  clearAll: () => void
  insertVariable: (variable: VariableItem) => void
  insertFunction: (func: FormulaFunction) => void
  insertOperator: (op: string) => void
  insertBracket: (bracket: '(' | ')') => void
  setCursorPos: (pos: number) => void
  moveCursorLeft: () => void
  moveCursorRight: () => void
  importFormula: (data: { tokens: FormulaToken[]; outputConfig?: OutputConfig }) => void
  getSaveData: () => { tokens: FormulaToken[]; expression: string; outputConfig: OutputConfig }

  // For bracket matching
  matchingBrackets: ComputedRef<{ left: number; right: number } | null>
}

const KEY: InjectionKey<FormulaEditorContext> = Symbol('formula-editor')

/**
 * Create and provide the formula editor context (called once by FormulaDesigner).
 */
export function provideFormulaEditor(): FormulaEditorContext {
  const context = createContext()
  provide(KEY, context)
  return context
}

/**
 * Inject the formula editor context (called by child components).
 */
export function injectFormulaEditor(): FormulaEditorContext {
  const context = inject(KEY)
  if (!context) {
    throw new Error(
      'injectFormulaEditor() must be used within a FormulaDesigner component.',
    )
  }
  return context
}

function createContext(): FormulaEditorContext {
  const tokens = ref<FormulaToken[]>([])
  const cursorPos = ref(0)
  const hoveredTokenId = ref<string | null>(null)

  const variables = ref<VariableItem[]>([])
  const outputConfig = ref<OutputConfig>({ ...DEFAULT_OUTPUT_CONFIG })

  // Derived state
  const expression = computed(() => tokensToExpression(tokens.value))

  const validation = computed(() => validateTokens(tokens.value))

  // Bracket matching
  const matchingBrackets = computed(() => {
    const toks = tokens.value
    if (cursorPos.value <= 0 || cursorPos.value > toks.length) return null

    // Check token just before cursor (left side) or just after (right side)
    const checkIndex = cursorPos.value - 1
    const token = toks[checkIndex]
    if (!token || token.type !== 'bracket') return null

    // Search for matching bracket
    if (token.value === '(') {
      let depth = 1
      for (let i = checkIndex + 1; i < toks.length; i++) {
        const t = toks[i]
        if (t.type === 'bracket') {
          if (t.value === '(') depth++
          else if (t.value === ')') {
            depth--
            if (depth === 0) return { left: checkIndex, right: i }
          }
        }
      }
    } else if (token.value === ')') {
      let depth = 1
      for (let i = checkIndex - 1; i >= 0; i--) {
        const t = toks[i]
        if (t.type === 'bracket') {
          if (t.value === ')') depth++
          else if (t.value === '(') {
            depth--
            if (depth === 0) return { left: i, right: checkIndex }
          }
        }
      }
    }

    return null
  })

  // --- Mutations ---

  function insertToken(token: FormulaToken, pos?: number) {
    const p = pos ?? cursorPos.value
    tokens.value.splice(p, 0, token)
    cursorPos.value = p + 1
  }

  function removeToken(pos?: number) {
    const p = pos ?? cursorPos.value - 1
    if (p < 0 || p >= tokens.value.length) return
    tokens.value.splice(p, 1)
    if (cursorPos.value > p) {
      cursorPos.value = Math.max(0, cursorPos.value - 1)
    }
  }

  function moveToken(from: number, to: number) {
    if (from < 0 || from >= tokens.value.length) return
    if (to < 0 || to > tokens.value.length) return
    if (from === to) return

    const token = tokens.value.splice(from, 1)[0]
    // Adjust destination after removal
    const dest = from < to ? to - 1 : to
    tokens.value.splice(dest, 0, token)
    cursorPos.value = dest + 1
  }

  function clearAll() {
    tokens.value.splice(0)
    cursorPos.value = 0
  }

  function insertVariable(variable: VariableItem) {
    insertToken({
      id: generateId(),
      type: 'variable',
      variableId: variable.id,
      name: variable.name,
      label: variable.label,
    })
  }

  function insertFunction(func: FormulaFunction) {
    const functionToken: FormulaToken = {
      id: generateId(),
      type: 'function',
      functionName: func.name,
      label: func.label,
    }
    const openBracket: FormulaToken = {
      id: generateId(),
      type: 'bracket',
      value: '(',
    }
    const closeBracket: FormulaToken = {
      id: generateId(),
      type: 'bracket',
      value: ')',
    }

    const pos = cursorPos.value
    tokens.value.splice(pos, 0, functionToken, openBracket, closeBracket)
    // Place cursor between ( and )
    cursorPos.value = pos + 2
  }

  function insertOperator(op: string) {
    // If the operator is a single character that could start a multi-char operator,
    // just insert it directly
    insertToken({
      id: generateId(),
      type: 'operator',
      value: op,
    })
  }

  function insertBracket(bracket: '(' | ')') {
    insertToken({
      id: generateId(),
      type: 'bracket',
      value: bracket,
    })
  }

  function setCursorPos(pos: number) {
    cursorPos.value = Math.max(0, Math.min(pos, tokens.value.length))
  }

  function moveCursorLeft() {
    setCursorPos(cursorPos.value - 1)
  }

  function moveCursorRight() {
    setCursorPos(cursorPos.value + 1)
  }

  function importFormula(data: { tokens: FormulaToken[]; outputConfig?: OutputConfig }) {
    tokens.value.splice(0, tokens.value.length, ...data.tokens)
    cursorPos.value = tokens.value.length
    if (data.outputConfig) {
      outputConfig.value = { ...DEFAULT_OUTPUT_CONFIG, ...data.outputConfig }
    }
  }

  function getSaveData() {
    return {
      tokens: [...tokens.value],
      expression: expression.value,
      outputConfig: { ...outputConfig.value },
    }
  }

  return {
    tokens,
    cursorPos,
    variables,
    outputConfig,
    hoveredTokenId,

    expression,
    validation,

    matchingBrackets,

    insertToken,
    removeToken,
    moveToken,
    clearAll,
    insertVariable,
    insertFunction,
    insertOperator,
    insertBracket,
    setCursorPos,
    moveCursorLeft,
    moveCursorRight,
    importFormula,
    getSaveData,
  }
}
