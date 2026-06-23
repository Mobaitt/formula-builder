<template>
  <div class="preview-panel">
    <div class="preview-inner">
      <div class="preview-section">
        <div class="preview-section-label">表达式</div>
        <div class="preview-expression">
          <code><template v-if="context.expression.value">{{ context.expression.value }}</template><template v-else><span class="expr-placeholder">（空公式）</span></template></code>
        </div>
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
        <button class="action-btn primary" @click="handleExport">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          导出
        </button>
        <button class="action-btn" @click="handleImport">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          导入
        </button>
        <button class="action-btn danger" @click="context.clearAll()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          清空
        </button>
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
import { ElMessage } from 'element-plus'
import { injectFormulaEditor } from '../composables/useFormulaEditor'
import type { FormulaSaveData } from '../types'

const context = injectFormulaEditor()
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleExport() {
  const data = context.getSaveData()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
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
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
}

.preview-section {
  flex: 1;
  min-width: 120px;
}

.preview-section-label {
  font-size: 10px;
  color: #c0c4cc;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
  font-weight: 600;
}

.preview-expression {
  font-size: 13px;
  padding: 4px 10px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow-x: auto;
  white-space: nowrap;
  font-family: 'Courier New', Courier, monospace;
  color: #303133;
}

.expr-placeholder {
  color: #c0c4cc;
  font-style: italic;
}

.preview-divider {
  width: 1px;
  height: 32px;
  background: #e8eaed;
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
  background: #67c23a;
  box-shadow: 0 0 4px rgba(103, 194, 58, 0.4);
}

.dot-error {
  background: #f56c6c;
  box-shadow: 0 0 4px rgba(245, 108, 108, 0.4);
}

.text-success {
  color: #67c23a;
}

.text-error {
  color: #f56c6c;
}

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
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
  white-space: nowrap;
}

.action-btn:hover {
  border-color: #c0c4cc;
  background: #f5f7fa;
}

.action-btn.primary {
  color: #409eff;
  border-color: #d9ecff;
  background: #ecf5ff;
}

.action-btn.primary:hover {
  background: #d9ecff;
  border-color: #a0cfff;
}

.action-btn.danger {
  color: #f56c6c;
  border-color: #fde2e2;
  background: #fef0f0;
}

.action-btn.danger:hover {
  background: #fde2e2;
  border-color: #fab6b6;
}

.action-btn svg {
  flex-shrink: 0;
}
</style>
