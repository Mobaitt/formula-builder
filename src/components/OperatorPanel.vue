<template>
  <div class="operator-panel">
    <div class="panel-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#606266" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      运算符
    </div>
    <div class="operator-groups">
      <div class="op-group">
        <span class="op-group-label">算术</span>
        <div class="op-buttons">
          <button v-for="op in arithmeticOps" :key="op" class="op-btn" @click="insertOp(op)">{{ op }}</button>
        </div>
      </div>
      <div class="op-divider" />
      <div class="op-group">
        <span class="op-group-label">比较</span>
        <div class="op-buttons">
          <button v-for="op in comparisonOps" :key="op" class="op-btn" @click="insertOp(op)">{{ op }}</button>
        </div>
      </div>
      <div class="op-divider" />
      <div class="op-group">
        <span class="op-group-label">逻辑 &amp; 括号</span>
        <div class="op-buttons">
          <button class="op-btn" @click="insertOp('&&')">&amp;&amp;</button>
          <button class="op-btn" @click="insertOp('||')">||</button>
          <button class="op-btn bracket-btn" @click="context.insertBracket('(')">(</button>
          <button class="op-btn bracket-btn" @click="context.insertBracket(')')">)</button>
          <button class="op-btn comma-btn" @click="insertOp(',')">,</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { injectFormulaEditor } from '../composables/useFormulaEditor'

const context = injectFormulaEditor()

const arithmeticOps = ['+', '-', '*', '/', '%']
const comparisonOps = ['>', '<', '>=', '<=', '==']

function insertOp(op: string) {
  context.insertOperator(op)
}
</script>

<style scoped>
.operator-panel {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.operator-groups {
  padding: 8px 14px;
}

.op-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-group-label {
  font-size: 11px;
  color: #c0c4cc;
  white-space: nowrap;
  min-width: 32px;
  font-weight: 500;
}

.op-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.op-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafbfc;
  color: #606266;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
  line-height: 1;
}

.op-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.op-btn:active {
  background: #d9ecff;
  transform: scale(0.95);
}

.bracket-btn {
  font-weight: 600;
  color: #909399;
}

.bracket-btn:hover {
  color: #409eff;
}

.comma-btn {
  font-weight: 400;
}

.op-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 6px 0;
}
</style>
