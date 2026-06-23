import FormulaDesigner from '../components/FormulaDesigner.vue'

export default FormulaDesigner
export type { FormulaEditorContext, FormulaEditorOptions } from '../composables/useFormulaEditor'
export { injectFormulaEditor, provideFormulaEditor } from '../composables/useFormulaEditor'
export type {
  BaseToken,
  BracketToken,
  DeviceNode,
  FormulaFunction,
  FormulaSaveData,
  FormulaToken,
  FunctionToken,
  NumberToken,
  OperatorToken,
  OutputConfig,
  TokenType,
  VariableItem,
  VariableToken,
} from '../types'
export { BUILT_IN_DEVICES, BUILT_IN_FUNCTIONS, BUILT_IN_VARIABLES, DEFAULT_OUTPUT_CONFIG } from '../types'
export { tokensToExpression, validateTokens } from '../utils/formula-parser'
export { formatOutput } from '../utils/format'
