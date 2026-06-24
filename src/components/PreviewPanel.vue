<template>
  <div class="preview-panel">
    <div class="preview-inner">
      <div class="preview-section">
        <div class="preview-section-label">表达式</div>
        <el-tooltip
          :content="context.expression.value || ''"
          placement="top"
          :show-after="300"
          :disabled="!context.expression.value || context.expression.value.length < 30"
        >
          <div class="preview-expression">
            <code><template v-if="context.expression.value">{{ context.expression.value }}</template><template v-else><span class="expr-placeholder">（空公式）</span></template></code>
          </div>
        </el-tooltip>
      </div>

      <div class="preview-divider" />

      <div class="preview-section">
        <div class="preview-section-label">验证</div>
        <div class="preview-validation">
          <span class="validation-dot" :class="context.validation.value.valid ? 'dot-success' : 'dot-error'" />
          <span :class="context.validation.value.valid ? 'text-success' : 'text-error'">
            {{ context.validation.value.valid ? '公式合法' : (context.validation.value.error || '公式错误') }}
          </span>
        </div>
      </div>

      <div class="preview-section actions-section">
        <button v-if="!actions?.export?.hidden" class="action-btn primary" @click="handleExport">
          {{ actions?.export?.label ?? '导出' }}
        </button>
        <button v-if="!actions?.import?.hidden" class="action-btn" @click="handleImport">
          {{ actions?.import?.label ?? '导入' }}
        </button>
        <button v-if="!actions?.clear?.hidden" class="action-btn danger" @click="context.clearAll()">
          {{ actions?.clear?.label ?? '清空' }}
        </button>
        <template v-for="(btn, i) in actions?.append" :key="i">
          <button class="action-btn" :class="btn.type ?? 'default'" @click="btn.onClick">
            {{ btn.label }}
          </button>
        </template>
      </div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElTooltip } from 'element-plus'
import { injectFormulaEditor } from '../composables/useFormulaEditor'
import type { ActionsConfig, FormulaSaveData } from '../types'

const context = injectFormulaEditor()
const fileInputRef = ref<HTMLInputElement | null>(null)

defineProps<{ actions?: ActionsConfig }>()

function handleExport() {
  const data = context.getSaveData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `formula-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

function handleImport() {
  fileInputRef.value?.click()
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as FormulaSaveData
      context.importFormula(data)
      ElMessage.success('导入成功')
    } catch {
      ElMessage.error('导入失败：无效的 JSON 格式')
    }
  }
  reader.readAsText(file)
  input.value = ''
}
</script>

<style scoped>
.preview-panel {
  width: 100%;
}

.preview-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.preview-section {
  flex: 1;
  min-width: 120px;
}

.preview-section-label {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
  font-weight: 600;
}

.preview-expression {
  font-size: 13px;
  padding: 4px 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Courier New', Courier, monospace;
  color: var(--el-text-color-primary);
}

.expr-placeholder {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.preview-divider {
  width: 1px;
  height: 32px;
  background: var(--el-border-color-light);
  flex-shrink: 0;
}

.preview-validation {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.validation-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-success {
  background: var(--el-color-success);
  box-shadow: 0 0 4px var(--el-color-success-light-5);
}

.dot-error {
  background: var(--el-color-danger);
  box-shadow: 0 0 4px var(--el-color-danger-light-5);
}

.text-success { color: var(--el-color-success); }
.text-error { color: var(--el-color-danger); }

.actions-section {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
  white-space: nowrap;
}

.action-btn:hover { border-color: var(--el-border-color); background: var(--el-fill-color-lighter); }
.action-btn.primary { color: var(--el-color-primary); border-color: var(--el-color-primary-light-8); background: var(--el-color-primary-light-9); }
.action-btn.primary:hover { background: var(--el-color-primary-light-8); border-color: var(--el-color-primary-light-5); }
.action-btn.danger { color: var(--el-color-danger); border-color: var(--el-color-danger-light-8); background: var(--el-color-danger-light-9); }
.action-btn.danger:hover { background: var(--el-color-danger-light-8); border-color: var(--el-color-danger-light-5); }
.action-btn svg { flex-shrink: 0; }
</style>
