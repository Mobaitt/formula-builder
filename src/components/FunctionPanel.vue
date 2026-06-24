<template>
  <div class="function-panel">
    <div class="panel-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67c23a" stroke-width="2"><path d="M16 3h3v4M4 3h8v4M4 21l12-18M12 21h8v-4"/></svg>
      函数
    </div>
    <div class="search-wrapper">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input class="search-input" placeholder="搜索函数…" v-model="searchQuery" />
    </div>
    <el-scrollbar>
      <div
        v-for="fn in filteredFunctions"
        :key="fn.name"
        class="function-item"
        @click="context.insertFunction(fn)"
      >
        <el-tag type="success" size="small" class="function-tag">{{ fn.label }}</el-tag>
        <span class="function-parenthesis">()</span>
        <span class="function-args">{{ fn.argsCount === 'any' ? 'N' : fn.argsCount }} 参</span>
        <span class="function-desc">{{ fn.description }}</span>
        <el-popover
          placement="right"
          :width="260"
          trigger="hover"
          :show-after="200"
          popper-class="fn-help-popover"
        >
          <template #reference>
            <span class="fn-help-icon" @click.stop>?</span>
          </template>
          <div class="fn-help-content">
            <div class="fn-help-name">{{ fn.label }}</div>
            <div class="fn-help-row">
              <span class="fn-help-label">签名</span>
              <code class="fn-help-signature">{{ helpData[fn.name]?.signature }}</code>
            </div>
            <div class="fn-help-row">
              <span class="fn-help-label">说明</span>
              <span class="fn-help-text">{{ helpData[fn.name]?.description }}</span>
            </div>
            <div class="fn-help-row">
              <span class="fn-help-label">示例</span>
              <code class="fn-help-example">{{ helpData[fn.name]?.example }}</code>
            </div>
          </div>
        </el-popover>
      </div>
      <div v-if="filteredFunctions.length === 0" class="no-result">无匹配函数</div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElPopover, ElScrollbar, ElTag } from 'element-plus'
import { BUILT_IN_FUNCTIONS, FUNCTIONS_HELP } from '../types'
import { injectFormulaEditor } from '../composables/useFormulaEditor'

const context = injectFormulaEditor()
const searchQuery = ref('')

const functions = BUILT_IN_FUNCTIONS
const helpData = FUNCTIONS_HELP

const filteredFunctions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return functions
  return functions.filter(
    (fn) =>
      fn.label.toLowerCase().includes(q) ||
      fn.name.toLowerCase().includes(q) ||
      (fn.description && fn.description.toLowerCase().includes(q)),
  )
})
</script>

<style scoped>
.function-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.function-panel .el-scrollbar {
  flex: 1;
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  flex-shrink: 0;
}

.search-wrapper {
  position: relative;
  padding: 6px 10px;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 28px;
  padding: 0 10px 0 28px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  outline: none;
  background: var(--el-fill-color-lighter);
  transition: border-color 0.15s, background 0.15s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--el-color-success);
  background: var(--el-bg-color);
}

.search-input::placeholder {
  color: var(--el-text-color-placeholder);
}

.function-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.12s;
  user-select: none;
  border-left: 3px solid transparent;
  min-width: 0;
}

.function-item:hover {
  background-color: var(--el-color-success-light-9);
  border-left-color: var(--el-color-success);
}

.function-item:active {
  background-color: var(--el-color-success-light-8);
}

.function-tag {
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.function-parenthesis {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 600;
  flex-shrink: 0;
}

.function-args {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.function-desc {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 50px;
}

.fn-help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--el-border-color-darker);
  color: var(--el-text-color-secondary);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s;
  line-height: 1;
  flex-shrink: 0;
}

.fn-help-icon:hover {
  background: var(--el-color-success);
  color: #fff;
}
</style>

<style>
/* Teleported popover styles */
.fn-help-popover {
  padding: 0 !important;
  line-height: 1.6;
}

.fn-help-content {
  padding: 12px 14px;
}

.fn-help-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-color-success);
  margin-bottom: 10px;
  font-family: 'Courier New', Courier, monospace;
}

.fn-help-row {
  margin-bottom: 8px;
}

.fn-help-row:last-child {
  margin-bottom: 0;
}

.fn-help-label {
  display: block;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 2px;
}

.fn-help-signature {
  display: block;
  padding: 4px 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.fn-help-text {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.fn-help-example {
  display: block;
  padding: 4px 8px;
  background: var(--el-color-success-light-9);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: var(--el-color-success);
}
</style>
