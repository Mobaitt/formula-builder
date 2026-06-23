<template>
  <div class="function-panel">
    <div class="panel-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67c23a" stroke-width="2"><path d="M16 3h3v4M4 3h8v4M4 21l12-18M12 21h8v-4"/></svg>
      函数
    </div>
    <el-scrollbar max-height="220px">
      <div
        v-for="fn in functions"
        :key="fn.name"
        class="function-item"
        :title="fn.description"
        @click="context.insertFunction(fn)"
      >
        <el-tag type="success" size="small" class="function-tag">
          {{ fn.label }}
        </el-tag>
        <span class="function-parenthesis">()</span>
        <span class="function-args">{{ fn.argsCount === 'any' ? 'N' : fn.argsCount }} 参</span>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ElScrollbar, ElTag } from 'element-plus'
import { BUILT_IN_FUNCTIONS } from '../types'
import { injectFormulaEditor } from '../composables/useFormulaEditor'

const context = injectFormulaEditor()
const functions = BUILT_IN_FUNCTIONS
</script>

<style scoped>
.function-panel {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
}

.function-panel :deep(.el-card) {
  border: none;
  box-shadow: none;
}

.function-panel :deep(.el-card__header) {
  padding: 10px 14px !important;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
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

.function-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  cursor: pointer;
  border-radius: 0;
  transition: background-color 0.12s;
  user-select: none;
  border-left: 3px solid transparent;
}

.function-item:hover {
  background-color: #f0f9eb;
  border-left-color: #67c23a;
}

.function-item:active {
  background-color: #e1f3d8;
}

.function-tag {
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.function-parenthesis {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: #909399;
  font-weight: 600;
}

.function-args {
  font-size: 11px;
  color: #c0c4cc;
  margin-left: auto;
}
</style>
