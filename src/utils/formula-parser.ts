import type { FormulaToken } from '../types'

/**
 * Convert token array to a display expression string.
 */
export function tokensToExpression(tokens: FormulaToken[]): string {
  const parts: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    switch (token.type) {
      case 'variable':
        parts.push(token.name)
        break
      case 'function':
        parts.push(token.functionName)
        break
      case 'operator':
        parts.push(` ${token.value} `)
        break
      case 'number':
        parts.push(String(token.value))
        break
      case 'bracket':
        parts.push(token.value)
        break
    }
  }

  return parts.join('').trim()
}

/**
 * Validate the token array for structural correctness.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateTokens(tokens: FormulaToken[]): { valid: boolean; error?: string } {
  if (tokens.length === 0) {
    return { valid: false, error: '公式为空' }
  }

  // Check bracket matching
  let bracketDepth = 0
  for (const token of tokens) {
    if (token.type === 'bracket') {
      if (token.value === '(') {
        bracketDepth++
      } else if (token.value === ')') {
        bracketDepth--
        if (bracketDepth < 0) {
          return { valid: false, error: '括号不匹配：多余的右括号' }
        }
      }
    }
  }

  if (bracketDepth !== 0) {
    return { valid: false, error: '括号不匹配：缺少右括号' }
  }

  // Check that functions have opening brackets after them
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'function') {
      const nextToken = tokens[i + 1]
      if (!nextToken || nextToken.type !== 'bracket' || nextToken.value !== '(') {
        return { valid: false, error: `函数 ${token.label} 后缺少左括号` }
      }
    }
  }

  // Check adjacent token validity
  const isOperandValue = (t: FormulaToken): boolean =>
    t.type === 'variable' || t.type === 'number'

  for (let i = 0; i < tokens.length - 1; i++) {
    const curr = tokens[i]
    const next = tokens[i + 1]

    // Two operands adjacent: e.g. [depth][pressure], 123[pressure], [depth]123
    if (isOperandValue(curr) && isOperandValue(next)) {
      return { valid: false, error: `"${tokenToLabel(curr)}" 和 "${tokenToLabel(next)}" 之间缺少运算符` }
    }

    // Operand followed by function — e.g. depthSUM(depth) or 123SUM(depth)
    if (isOperandValue(curr) && next.type === 'function') {
      return { valid: false, error: `"${tokenToLabel(curr)}" 和 "${tokenToLabel(next)}" 之间缺少运算符` }
    }

    // Function followed by operand — e.g. SUM()depth
    if (curr.type === 'function' && isOperandValue(next)) {
      return { valid: false, error: `"${tokenToLabel(curr)}" 和 "${tokenToLabel(next)}" 之间缺少运算符` }
    }

    // Function followed by function — e.g. SUM()SUM()
    if (curr.type === 'function' && next.type === 'function') {
      return { valid: false, error: `"${tokenToLabel(curr)}" 和 "${tokenToLabel(next)}" 之间缺少运算符` }
    }

    // ')' followed by operand, function, or '(' — e.g. depth)depth, depth)SUM(, depth)(depth
    if (curr.type === 'bracket' && curr.value === ')' &&
        (isOperandValue(next) || next.type === 'function' || (next.type === 'bracket' && next.value === '('))) {
      return { valid: false, error: `")" 和 "${tokenToLabel(next)}" 之间缺少运算符` }
    }

    // Two operators adjacent (comma allowed between values)
    if (curr.type === 'operator' && next.type === 'operator') {
      if (curr.value !== ',' && next.value !== ',') {
        return { valid: false, error: `连续的运算符 "${curr.value}" 和 "${next.value}"` }
      }
    }

    // operator/comma followed by ')'
    if (curr.type === 'operator' && next.type === 'bracket' && next.value === ')') {
      if (curr.value !== ',') {
        return { valid: false, error: `"${curr.value}" 后缺少操作数` }
      }
    }

    // '(' followed by operator (except '-')
    if (curr.type === 'bracket' && curr.value === '(' &&
        next.type === 'operator' && next.value !== '-') {
      return { valid: false, error: `"(" 后不能直接跟 "${next.value}"` }
    }

    // '(' followed by ')'
    if (curr.type === 'bracket' && curr.value === '(' &&
        next.type === 'bracket' && next.value === ')') {
      return { valid: false, error: '空括号不允许' }
    }

    // ')' followed by number — invalid
    if (curr.type === 'bracket' && curr.value === ')' && next.type === 'number') {
      return { valid: false, error: '")" 和数字之间缺少运算符' }
    }
  }

  // First token checks
  const first = tokens[0]
  if (first.type === 'operator') {
    if (first.value !== '-' && first.value !== ',') {
      return { valid: false, error: `公式不能以 "${first.value}" 开头` }
    }
  }
  if (first.type === 'bracket' && first.value === ')') {
    return { valid: false, error: '公式不能以 ")" 开头' }
  }

  // Last token checks
  const last = tokens[tokens.length - 1]
  if (last.type === 'operator' && last.value !== ',') {
    return { valid: false, error: `公式不能以 "${last.value}" 结尾` }
  }
  if (last.type === 'bracket' && last.value === '(') {
    return { valid: false, error: '公式不能以 "(" 结尾' }
  }

  return { valid: true }
}

function tokenToLabel(t: FormulaToken): string {
  switch (t.type) {
    case 'variable': return `[${t.label}]`
    case 'number': return String(t.value)
    case 'bracket': return t.value
    case 'function': return `${t.label}()`
    case 'operator': return t.value
  }
}
