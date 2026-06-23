<template>
  <div class="variable-panel">
    <div class="panel-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#409eff" stroke-width="2"><path d="M4 7c0-1.5 1-2 2-2h12c1 0 2 .5 2 2v10c0 1.5-1 2-2 2H6c-1 0-2-.5-2-2V7z"/><path d="M8 10h8M8 14h5"/></svg>
      变量
    </div>
    <el-scrollbar max-height="280px">
      <div
        v-for="v in variables"
        :key="v.id"
        class="variable-item"
        draggable="true"
        @dragstart="onDragStart($event, v)"
        @click="context.insertVariable(v)"
      >
        <el-tag type="primary" size="small" class="variable-tag">
          [{{ v.label }}]
        </el-tag>
        <span class="variable-unit" v-if="v.unit">({{ v.unit }})</span>
        <el-tag size="small" type="info" class="variable-type-tag">{{ v.type }}</el-tag>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElScrollbar, ElTag } from 'element-plus'
import type { VariableItem } from '../types'
import { BUILT_IN_VARIABLES } from '../types'
import { injectFormulaEditor } from '../composables/useFormulaEditor'

const context = injectFormulaEditor()

const variables = computed<VariableItem[]>(() => {
  if (context.variables.value.length > 0) {
    return context.variables.value
  }
  return BUILT_IN_VARIABLES
})

function onDragStart(event: DragEvent, v: VariableItem) {
  event.dataTransfer?.setData(
    'application/x-formula-variable',
    JSON.stringify({ variableId: v.id, name: v.name, label: v.label }),
  )
  event.dataTransfer!.effectAllowed = 'copy'
}
</script>

<style scoped>
.variable-panel {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
}

.variable-panel :deep(.el-card) {
  border: none;
  box-shadow: none;
}

.variable-panel :deep(.el-card__header) {
  padding: 10px 14px !important;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.variable-panel :deep(.el-card__body) {
  padding: 4px 0 !important;
}

.panel-header {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #303133;
}

.variable-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: grab;
  border-radius: 0;
  transition: background-color 0.12s;
  user-select: none;
  border-left: 3px solid transparent;
}

.variable-item:hover {
  background-color: #ecf5ff;
  border-left-color: #409eff;
}

.variable-item:active {
  cursor: grabbing;
  background-color: #d9ecff;
}

.variable-tag {
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
}

.variable-tag :deep(.el-tag__content) {
  font-weight: 600;
}

.variable-unit {
  font-size: 11px;
  color: #c0c4cc;
  flex-shrink: 0;
}

.variable-type-tag {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 10px;
}
</style>
