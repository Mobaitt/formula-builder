<template>
  <div
    class="formula-editor"
    :class="{ 'is-empty': editorEmpty, 'is-focused': isFocused }"
    @click="handleEditorClick"
    @dragover.prevent="handleDragOver"
    @drop.prevent="handleDrop"
  >
    <!-- Header -->
    <div class="editor-toolbar">
      <span class="toolbar-title">公式表达式</span>
      <span class="toolbar-hint">点击空白处定位光标 · 拖拽排序 · 右键更多操作</span>
    </div>

    <!-- Scrollable token area -->
    <div ref="editorContentRef" class="editor-content" :class="{ 'is-empty-content': editorEmpty }">
      <template v-for="(token, idx) in context.tokens.value" :key="token.id">
        <!-- Gap indicator for drag-over -->
        <div v-if="dragOverPos === idx" class="drop-indicator" />

        <!-- Cursor before token -->
        <span v-if="context.cursorPos.value === idx" class="cursor-blink" />

        <!-- Token element -->
        <span
          class="token token-el"
          :class="[
            `token-${token.type}`,
            {
              'bracket-match': isBracketMatch(idx),
              'is-hovered': context.hoveredTokenId.value === token.id,
              'is-dragging': dragIndex === idx,
            },
          ]"
          :data-token-index="idx"
          draggable="true"
          @click.stop="handleTokenClick($event, idx)"
          @dblclick="handleTokenDblClick(token)"
          @dragstart="handleDragStart($event, idx)"
          @dragend="handleDragEnd"
          @mouseenter="context.hoveredTokenId.value = token.id"
          @mouseleave="context.hoveredTokenId.value = null"
        >
          <template v-if="token.type === 'variable'">
            <span class="token-bracket">[</span>{{ token.label }}<span class="token-bracket">]</span>
          </template>
          <template v-else-if="token.type === 'function'">
            {{ token.label }}<span class="fn-paren">(</span>
          </template>
          <template v-else-if="token.type === 'number'">
            {{ token.value }}
          </template>
          <template v-else-if="token.type === 'operator'">
            <span class="operator-text">{{ token.value }}</span>
          </template>
          <template v-else-if="token.type === 'bracket'">
            <span class="bracket-text">{{ token.value }}</span>
          </template>
        </span>
      </template>

      <!-- Drop indicator at end -->
      <div v-if="dragOverPos === context.tokens.value.length" class="drop-indicator" />

      <!-- Cursor at end (no tokens or at end) -->
      <span
        v-if="context.tokens.value.length === 0 || context.cursorPos.value === context.tokens.value.length"
        class="cursor-blink"
      />
    </div>

    <!-- Hidden input for keyboard capture -->
    <input
      ref="hiddenInputRef"
      class="hidden-input"
      @input="handleInput"
      @keydown="handleKeydown"
      @compositionstart="composing = true"
      @compositionend="handleCompositionEnd"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <!-- Right-click context menu zone -->
    <teleport to="body">
      <div
        v-if="showContextMenu"
        class="context-menu"
        :style="contextMenuStyle"
      >
        <div class="context-menu-item" @click="removeTokenAt(contextMenuIndex)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          删除
        </div>
        <div
          v-if="contextMenuIndex > 0"
          class="context-menu-item"
          @click="moveTokenLeft(contextMenuIndex)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          左移
        </div>
        <div
          v-if="contextMenuIndex < context.tokens.value.length - 1"
          class="context-menu-item"
          @click="moveTokenRight(contextMenuIndex)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          右移
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormulaToken, NumberToken } from '../types'
import { injectFormulaEditor } from '../composables/useFormulaEditor'
import {
  appendDigitToNumber,
  generateId,
  isDigit,
} from '../utils/token-utils'

const context = injectFormulaEditor()

// --- Refs ---
const editorContentRef = ref<HTMLDivElement | null>(null)
const hiddenInputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const composing = ref(false)

// Drag state
const dragIndex = ref<number | null>(null)
const dragOverPos = ref<number | null>(null)

// Context menu
const showContextMenu = ref(false)
const contextMenuIndex = ref(-1)
const contextMenuStyle = ref({})

// --- Computed ---
const editorEmpty = computed(() => context.tokens.value.length === 0)

// --- Bracket matching ---
function isBracketMatch(index: number): boolean {
  const match = context.matchingBrackets.value
  if (!match) return false
  return index === match.left || index === match.right
}

// --- Focus management ---
function focusInput() {
  nextTick(() => {
    hiddenInputRef.value?.focus()
  })
}

// Re-focus input after any cursor change
watch(
  () => context.cursorPos.value,
  () => {
    if (!composing.value) focusInput()
  },
)

onMounted(() => {
  focusInput()
})

// --- Click handlers ---
function handleEditorClick(e: MouseEvent) {
  // Ignore if clicking on a token
  const target = e.target as HTMLElement
  if (target.closest('.token-el')) return

  const container = editorContentRef.value
  if (!container) return

  const tokens = context.tokens.value
  if (tokens.length === 0) {
    context.setCursorPos(0)
    focusInput()
    return
  }

  const tokenEls = container.querySelectorAll<HTMLElement>('.token-el')
  const clickX = e.clientX
  const clickY = e.clientY

  // Check if click is in an empty line below all tokens (same row check)
  // Find the row bottom of the last token
  const lastTokenRect = tokenEls[tokenEls.length - 1].getBoundingClientRect()
  if (clickY > lastTokenRect.bottom) {
    context.setCursorPos(tokens.length)
    focusInput()
    return
  }

  // Find the closest gap between tokens
  let bestPos = 0
  let minDist = Infinity

  for (let pos = 0; pos <= tokens.length; pos++) {
    let gapX: number

    if (pos === 0) {
      const firstRect = tokenEls[0].getBoundingClientRect()
      gapX = firstRect.left
    } else if (pos === tokens.length) {
      const lastRect = tokenEls[tokens.length - 1].getBoundingClientRect()
      gapX = lastRect.right
    } else {
      const prevRect = tokenEls[pos - 1].getBoundingClientRect()
      gapX = prevRect.right + 4 // small offset for gap
    }

    const dist = Math.abs(clickX - gapX)
    if (dist < minDist) {
      minDist = dist
      bestPos = pos
    }
  }

  context.setCursorPos(bestPos)
  focusInput()
}

function handleTokenClick(e: MouseEvent, _index: number) {
  // Don't handle right-click here
  if (e.button === 2) return

  // Find the nearest edge of the token
  const tokenEl = e.currentTarget as HTMLElement
  const rect = tokenEl.getBoundingClientRect()
  const midX = rect.left + rect.width / 2
  const index = parseInt(tokenEl.dataset.tokenIndex ?? '0')

  if (e.clientX < midX) {
    context.setCursorPos(index)
  } else {
    context.setCursorPos(index + 1)
  }
  focusInput()
}

function handleTokenDblClick(token: FormulaToken) {
  if (token.type === 'variable') {
    ElMessage.info(`变量: ${token.label}\nID: ${token.variableId}`)
  } else if (token.type === 'function') {
    ElMessage.info(`函数: ${token.label}`)
  }
}

// --- Context menu ---
function removeTokenAt(index: number) {
  context.removeToken(index)
  showContextMenu.value = false
}

function moveTokenLeft(index: number) {
  context.moveToken(index, index - 1)
  showContextMenu.value = false
}

function moveTokenRight(index: number) {
  context.moveToken(index, index + 1)
  showContextMenu.value = false
}

// Close context menu on click elsewhere
function handleDocumentClick() {
  showContextMenu.value = false
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleDocumentClick)
}

// --- Right-click ---
onMounted(() => {
  const editor = editorContentRef.value
  if (editor) {
    editor.addEventListener('contextmenu', (e: MouseEvent) => {
      const tokenEl = (e.target as HTMLElement).closest('.token-el') as HTMLElement | null
      if (tokenEl) {
        e.preventDefault()
        const index = parseInt(tokenEl.dataset.tokenIndex ?? '0')
        contextMenuIndex.value = index
        contextMenuStyle.value = {
          left: `${e.clientX}px`,
          top: `${e.clientY}px`,
        }
        showContextMenu.value = true
      }
    })
  }
})

// --- Keyboard Input Handling ---
function handleInput(e: Event) {
  if (composing.value) return

  const input = e.target as HTMLInputElement
  const value = input.value

  // Process each new character
  for (const char of value) {
    if (isDigit(char)) {
      handleDigitInput(char)
    } else if (char === '.') {
      handleDecimalInput()
    } else if (char === ',') {
      context.insertOperator(',')
    }
  }

  // Clear the hidden input
  input.value = ''
}

function handleDigitInput(char: string) {
  const pos = context.cursorPos.value
  const prevToken = pos > 0 ? context.tokens.value[pos - 1] : null

  if (prevToken && prevToken.type === 'number') {
    // Append to existing number token
    appendDigitToNumber(prevToken, char)
    // Force reactivity by replacing the array reference
    context.tokens.value = [...context.tokens.value]
  } else {
    // Create new number token
    context.insertToken({
      id: generateId(),
      type: 'number',
      value: parseInt(char, 10),
    })
  }
}

function handleDecimalInput() {
  const pos = context.cursorPos.value
  const prevToken = pos > 0 ? context.tokens.value[pos - 1] : null

  if (prevToken && prevToken.type === 'number') {
    const str = String(prevToken.value)
    if (!str.includes('.')) {
      prevToken.value = parseFloat(str + '.')
      context.tokens.value = [...context.tokens.value]
    }
  } else {
    context.insertToken({
      id: generateId(),
      type: 'number',
      value: 0,
    })
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (composing.value) return

  switch (e.key) {
    case 'Backspace':
      e.preventDefault()
      handleBackspace()
      break

    case 'Delete':
      e.preventDefault()
      handleDelete()
      break

    case 'ArrowLeft':
      e.preventDefault()
      if (e.shiftKey) {
        // Could extend selection in future
      } else {
        context.moveCursorLeft()
      }
      break

    case 'ArrowRight':
      e.preventDefault()
      if (e.shiftKey) {
        // Could extend selection in future
      } else {
        context.moveCursorRight()
      }
      break

    case 'Home':
      e.preventDefault()
      context.setCursorPos(0)
      break

    case 'End':
      e.preventDefault()
      context.setCursorPos(context.tokens.value.length)
      break

    case 'Enter':
      e.preventDefault()
      // Could trigger evaluation
      break

    case 'Escape':
      e.preventDefault()
      hiddenInputRef.value?.blur()
      break

    // Single-char operators
    case '+':
    case '-':
    case '*':
    case '/':
    case '%':
      e.preventDefault()
      context.insertOperator(e.key)
      break

    case '(':
      e.preventDefault()
      context.insertBracket('(')
      break

    case ')':
      e.preventDefault()
      context.insertBracket(')')
      break
  }
}

function handleBackspace() {
  const pos = context.cursorPos.value
  if (pos <= 0) return

  const prevToken = context.tokens.value[pos - 1]

  if (prevToken.type === 'number') {
    const str = String(prevToken.value)
    if (str.length <= 1 || (str.length === 2 && str.startsWith('-'))) {
      context.removeToken(pos - 1)
    } else {
      const newVal = str.slice(0, -1)
      ;(prevToken as NumberToken).value = parseFloat(newVal)
      context.tokens.value = [...context.tokens.value]
    }
  } else {
    context.removeToken(pos - 1)
  }
}

function handleDelete() {
  const pos = context.cursorPos.value
  if (pos >= context.tokens.value.length) return
  context.removeToken(pos)
}

function handleCompositionEnd(e: CompositionEvent) {
  composing.value = false
  // Process the final composed text
  const input = e.target as HTMLInputElement
  if (input.value) {
    handleInput({ target: input } as unknown as Event)
  }
}

// --- Drag and Drop (internal reordering) ---
function handleDragStart(e: DragEvent, index: number) {
  dragIndex.value = index
  dragOverPos.value = null
  e.dataTransfer?.setData('text/plain', String(index))
  e.dataTransfer!.effectAllowed = 'move'
  ;(e.currentTarget as HTMLElement)?.classList.add('is-dragging-source')
}

function handleDragEnd(_e: DragEvent) {
  dragIndex.value = null
  dragOverPos.value = null
  // Remove dragging class from all tokens
  document.querySelectorAll('.token-el.is-dragging-source').forEach((el) => {
    el.classList.remove('is-dragging-source')
  })
}

function handleDragOver(e: DragEvent) {
  // Calculate insertion position based on mouse position
  const container = editorContentRef.value
  if (!container) return

  const tokenEls = container.querySelectorAll<HTMLElement>('.token-el')
  if (tokenEls.length === 0) {
    dragOverPos.value = 0
    return
  }

  const mouseX = e.clientX
  let bestPos = 0
  let minDist = Infinity

  for (let pos = 0; pos <= tokenEls.length; pos++) {
    let gapX: number
    if (pos === 0) {
      gapX = tokenEls[0].getBoundingClientRect().left
    } else if (pos === tokenEls.length) {
      gapX = tokenEls[tokenEls.length - 1].getBoundingClientRect().right
    } else {
      gapX = (tokenEls[pos - 1].getBoundingClientRect().right +
        tokenEls[pos].getBoundingClientRect().left) / 2
    }

    const dist = Math.abs(mouseX - gapX)
    if (dist < minDist) {
      minDist = dist
      bestPos = pos
    }
  }

  dragOverPos.value = bestPos
}

// --- Drop handler (both internal reorder and external variable panel) ---
function handleDrop(e: DragEvent) {
  // Internal reorder: drag from another token
  const textData = e.dataTransfer?.getData('text/plain')
  if (textData) {
    const fromIndex = parseInt(textData, 10)
    const toPos = dragOverPos.value
    if (!isNaN(fromIndex) && toPos !== null && fromIndex !== toPos) {
      context.moveToken(fromIndex, toPos)
      focusInput()
    }
  }

  // External drop from VariablePanel
  try {
    const variableData = e.dataTransfer?.getData('application/x-formula-variable')
    if (variableData) {
      const { variableId, name, label } = JSON.parse(variableData)
      context.insertToken({
        id: generateId(),
        type: 'variable',
        variableId,
        name,
        label,
      })
      focusInput()
    }
  } catch {
    // Not a variable drag, ignore
  }

  dragOverPos.value = null
  dragIndex.value = null
}
</script>

<style scoped>
.formula-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 160px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: text;
}

.formula-editor:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
}

.formula-editor.is-focused {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
}

.formula-editor.is-empty {
  min-height: 200px;
}

/* ===== Toolbar ===== */
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
  user-select: none;
}

.toolbar-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.toolbar-hint {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

/* ===== Editor Content ===== */
.editor-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;
  padding: 14px;
  min-height: 80px;
  position: relative;
  flex: 1;
  align-content: flex-start;
}

.editor-content.is-empty-content::before {
  content: '点击左侧变量 / 函数插入，或直接键盘输入数字和运算符';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  pointer-events: none;
  text-align: center;
  line-height: 1.6;
  max-width: 300px;
  white-space: nowrap;
}

/* ===== Tokens ===== */
.token {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', Courier, monospace;
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.15s, transform 0.1s, opacity 0.15s;
  line-height: 1.8;
  white-space: nowrap;
  position: relative;
}

.token:active {
  cursor: grabbing;
}

.token:hover {
  z-index: 1;
}

.token.is-hovered {
  box-shadow: 0 0 0 2px currentColor;
}

.token.is-dragging {
  opacity: 0.3;
}

/* Variable token */
.token-variable {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-8);
  font-weight: 600;
  border-radius: 3px;
}

.token-variable:hover {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}

.token-variable .token-bracket {
  opacity: 0.45;
  font-weight: 400;
}

/* Function token */
.token-function {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
  border: 1px solid var(--el-color-success-light-8);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  border-radius: 3px;
}

.token-function:hover {
  background: var(--el-color-success-light-8);
  border-color: var(--el-color-success-light-5);
}

.token-function .fn-paren {
  opacity: 0.55;
  margin-left: 1px;
}

/* Operator token */
.token-operator {
  background: transparent;
  color: var(--el-text-color-regular);
  padding: 2px 2px;
  font-weight: 700;
  font-size: 14px;
}

.operator-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
}

/* Number token */
.token-number {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  border: 1px solid var(--el-color-warning-light-8);
  font-weight: 600;
  border-radius: 3px;
}

.token-number:hover {
  background: var(--el-color-warning-light-8);
  border-color: var(--el-color-warning-light-5);
}

/* Bracket token */
.token-bracket {
  background: transparent;
  color: var(--el-text-color-secondary);
  padding: 2px 1px;
  font-weight: 600;
  font-size: 15px;
}

.bracket-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 10px;
}

/* Bracket matching highlight */
.token.bracket-match {
  box-shadow: 0 0 0 2px var(--el-color-danger) !important;
  border-radius: 4px;
  animation: bracket-pulse 1s ease-in-out infinite alternate;
  z-index: 2;
}

@keyframes bracket-pulse {
  from {
    box-shadow: 0 0 0 2px var(--el-color-danger);
  }
  to {
    box-shadow: 0 0 0 3px var(--el-color-danger), 0 0 8px var(--el-color-danger-light-5);
  }
}

/* ===== Cursor ===== */
.cursor-blink {
  display: inline-block;
  width: 2px;
  height: 22px;
  background: var(--el-color-primary);
  animation: cursorBlink 1s step-end infinite;
  vertical-align: middle;
  flex-shrink: 0;
  border-radius: 1px;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ===== Drop Indicator ===== */
.drop-indicator {
  display: inline-block;
  width: 3px;
  height: 28px;
  background: var(--el-color-primary);
  border-radius: 2px;
  flex-shrink: 0;
  animation: dropPulse 0.5s ease-in-out infinite alternate;
}

@keyframes dropPulse {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

/* ===== Hidden Input ===== */
.hidden-input {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>

<style>
/* Teleported context menu (global styles) */
.context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 100px;
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.12s;
  user-select: none;
}

.context-menu-item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.context-menu-item svg {
  flex-shrink: 0;
  opacity: 0.6;
}

.context-menu-item:hover svg {
  opacity: 1;
}
</style>
