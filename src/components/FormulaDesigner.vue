<template>
  <div class="formula-designer">
    <div class="designer-header">
      <div class="header-left">
        <div class="designer-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7c0-1.5 1-2 2-2h12c1 0 2 .5 2 2v10c0 1.5-1 2-2 2H6c-1 0-2-.5-2-2V7z"/>
            <path d="M8 10h8M8 14h5"/>
          </svg>
        </div>
        <div>
          <div class="designer-title">公式编辑器</div>
          <div class="designer-subtitle">点击或拖拽变量 / 函数以构建公式</div>
        </div>
      </div>
      <div class="header-actions">
        <el-tag size="small" type="info" effect="plain" class="token-count-header">
          {{ context.tokens.value.length }} token(s)
        </el-tag>
      </div>
    </div>

    <div class="designer-body">
      <div class="left-panel panel-column">
        <VariablePanel />
        <FunctionPanel />
      </div>
      <div class="center-panel panel-column">
        <div class="editor-wrapper">
          <FormulaEditor />
        </div>
        <OperatorPanel />
      </div>
      <div class="right-panel panel-column">
        <OutputConfigPanel />
      </div>
    </div>

    <div class="designer-footer">
      <PreviewPanel :actions="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { provideFormulaEditor } from '../composables/useFormulaEditor'
import { resetIdCounter } from '../utils/token-utils'
import type { ActionsConfig, DeviceNode, FormulaSaveData, FormulaToken, OutputConfig, VariableItem } from '../types'
import FormulaEditor from './FormulaEditor.vue'
import FunctionPanel from './FunctionPanel.vue'
import OperatorPanel from './OperatorPanel.vue'
import OutputConfigPanel from './OutputConfigPanel.vue'
import PreviewPanel from './PreviewPanel.vue'
import VariablePanel from './VariablePanel.vue'

export interface FormulaDesignerProps {
  /** Structured device → variables tree. Overrides `variables` if provided. */
  devices?: DeviceNode[]
  /** Flat variable list — shown grouped under a single "自定义变量" node. Ignored if `devices` is set. */
  variables?: VariableItem[]
  /** Configure action buttons: rename, hide, or append custom buttons. */
  actions?: ActionsConfig
}

const props = withDefaults(defineProps<FormulaDesignerProps>(), {
  devices: undefined,
  variables: undefined,
  actions: undefined,
})

const context = provideFormulaEditor({
  devices: props.devices,
  variables: props.variables,
})

onUnmounted(() => {
  resetIdCounter()
})

/** 获取当前公式的完整保存数据（tokens + expression + outputConfig） */
function getSaveData(): FormulaSaveData {
  return context.getSaveData()
}

/** 导入公式数据 */
function importFormula(data: { tokens: FormulaToken[]; outputConfig?: OutputConfig }) {
  context.importFormula(data)
}

/** 清空所有 Token */
function clearAll() {
  context.clearAll()
}

defineExpose({ getSaveData, importFormula, clearAll })
</script>

<style scoped>
.formula-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.designer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 10px; }

.designer-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #409eff, #337ecc);
  border-radius: 8px; color: #fff;
}

.designer-icon svg { width: 18px; height: 18px; }

.designer-title { font-size: 15px; font-weight: 700; color: var(--el-text-color-primary); }
.designer-subtitle { font-size: 11px; color: var(--el-text-color-secondary); margin-top: 1px; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.token-count-header { font-family: 'Courier New', monospace; }

.designer-body {
  display: flex; flex: 1; gap: 8px; padding: 8px;
  overflow: hidden; min-height: 0;
}

.panel-column { display: flex; flex-direction: column; min-height: 0; }

.left-panel { width: 260px; flex-shrink: 0; gap: 8px; }
.left-panel > .variable-panel { flex: 3; min-height: 0; }
.left-panel > .function-panel { flex: 2; min-height: 0; }

.center-panel { flex: 1; min-width: 0; gap: 8px; overflow: visible; }

.editor-wrapper { flex: 1; display: flex; min-height: 100px; }
.editor-wrapper > .formula-editor { width: 100%; }

.right-panel { width: 260px; flex-shrink: 0; }
.right-panel > .output-config-panel {
  flex: 1; display: flex; flex-direction: column; min-height: 0;
}

.designer-footer { flex-shrink: 0; padding: 0 8px 8px; }
</style>
