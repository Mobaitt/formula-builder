import type { FormulaToken, NumberToken } from '../types'

let counter = 0

export function generateId(): string {
  return `tok_${++counter}_${Date.now().toString(36)}`
}

export function resetIdCounter(): void {
  counter = 0
}

/** Display text for a token in the editor */
export function tokenDisplayText(token: FormulaToken): string {
  switch (token.type) {
    case 'variable':
      return `[${token.label}]`
    case 'function':
      return `${token.label}(`
    case 'operator':
      return ` ${token.value} `
    case 'number':
      return String(token.value)
    case 'bracket':
      return token.value
  }
}

/** Check if two tokens are adjacent numbers that should be merged */
export function isAdjacentNumberToken(prev: FormulaToken, curr: FormulaToken): prev is NumberToken {
  return prev.type === 'number' && curr.type === 'number'
}

/** Append a digit to an existing number token */
export function appendDigitToNumber(token: NumberToken, char: string): void {
  const currentStr = String(token.value)
  const isDecimal = currentStr.includes('.')
  if (isDecimal && char === '.') return // already has decimal
  if (char === '.') {
    token.value = parseFloat(currentStr + '.')
  } else {
    token.value = parseFloat(currentStr + char)
  }
}

/** Remove the last digit/char from a number token. Returns true if token is now empty */
export function removeLastDigit(token: NumberToken): boolean {
  const str = String(token.value)
  if (str.length <= 1 || (str.length === 2 && str.startsWith('-'))) {
    return true // token should be removed
  }
  token.value = parseFloat(str.slice(0, -1))
  return false
}

/** Check if a character is a valid digit */
export function isDigit(char: string): boolean {
  return /^[0-9]$/.test(char)
}

/** Check if a character is a valid operator input */
export function isOperatorChar(char: string): boolean {
  return ['+', '-', '*', '/', '%', '>', '<', '=', '!', '&', '|'].includes(char)
}

/** Map single char to operator token value if applicable */
export function charToOperator(char: string): string | null {
  const map: Record<string, string> = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '%': '%',
  }
  return map[char] ?? null
}
