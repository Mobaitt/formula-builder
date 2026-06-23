<template>
  <div class="output-config-panel">
    <div class="panel-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#606266" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3z"/></svg>
      输出配置
    </div>
    <div class="config-body">
      <div class="config-item">
        <label class="config-label">小数位数</label>
        <el-input-number
          :model-value="context.outputConfig.value.decimals"
          :min="0"
          :max="10"
          controls-position="right"
          size="small"
          class="config-input-number"
          @update:model-value="onDecimalsChange"
        />
      </div>
      <div class="config-item">
        <label class="config-label">前缀</label>
        <el-input
          :model-value="context.outputConfig.value.prefix"
          placeholder="例: ¥"
          size="small"
          @update:model-value="updateConfig('prefix', $event)"
        />
      </div>
      <div class="config-item">
        <label class="config-label">后缀</label>
        <el-input
          :model-value="context.outputConfig.value.suffix"
          placeholder="例: MPa"
          size="small"
          @update:model-value="updateConfig('suffix', $event)"
        />
      </div>
      <div class="config-item">
        <label class="config-label">千分位分隔</label>
        <el-switch
          :model-value="context.outputConfig.value.useThousandsSeparator"
          size="small"
          @update:model-value="onThousandsChange"
        />
      </div>
      <div class="config-item">
        <label class="config-label">空值显示</label>
        <el-input
          :model-value="context.outputConfig.value.nullDisplay"
          placeholder="例: --"
          size="small"
          @update:model-value="updateConfig('nullDisplay', $event)"
        />
      </div>

      <div class="config-divider" />

      <div class="preview-format">
        <div class="preview-label">预览</div>
        <div class="preview-value">{{ previewText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElInput, ElInputNumber, ElSwitch } from 'element-plus'
import type { OutputConfig } from '../types'
import { injectFormulaEditor } from '../composables/useFormulaEditor'
import { formatOutput } from '../utils/format'

const context = injectFormulaEditor()

function onDecimalsChange(value: number | undefined | null) {
  context.outputConfig.value = { ...context.outputConfig.value, decimals: value ?? 0 }
}

function onThousandsChange(value: boolean | string | number) {
  context.outputConfig.value = {
    ...context.outputConfig.value,
    useThousandsSeparator: Boolean(value),
  }
}

function updateConfig<K extends keyof OutputConfig>(key: K, value: OutputConfig[K]) {
  context.outputConfig.value = { ...context.outputConfig.value, [key]: value }
}

const previewText = computed(() => {
  return formatOutput(1234567.89123, context.outputConfig.value)
})
</script>

<style scoped>
.output-config-panel {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  overflow: hidden;
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

.config-body {
  padding: 12px 14px;
}

.config-item {
  margin-bottom: 12px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  font-weight: 500;
}

.config-input-number {
  width: 100%;
}

.config-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 12px 0;
}

.preview-format {
  text-align: center;
}

.preview-label {
  font-size: 11px;
  color: #c0c4cc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.preview-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Courier New', Courier, monospace;
  color: #409eff;
  word-break: break-all;
  padding: 8px 0;
  background: #fafbfc;
  border-radius: 4px;
}
</style>
