<template>
  <div class="variable-panel">
    <div class="panel-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#409eff" stroke-width="2"><path d="M4 7c0-1.5 1-2 2-2h12c1 0 2 .5 2 2v10c0 1.5-1 2-2 2H6c-1 0-2-.5-2-2V7z"/><path d="M8 10h8M8 14h5"/></svg>
      变量
    </div>
    <div class="search-wrapper">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c4cc" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input class="search-input" placeholder="搜索变量…" v-model="searchQuery" />
    </div>
    <el-scrollbar>
      <!-- Flat results when searching -->
      <template v-if="searchQuery.trim()">
        <div
          v-for="v in flatFiltered"
          :key="v.id"
          class="variable-item"
          draggable="true"
          @dragstart="onDragStart($event, v)"
          @click="context.insertVariable(v)"
        >
          <el-tag type="primary" size="small" class="variable-tag">[{{ v.label }}]</el-tag>
          <el-tooltip :content="v.name" placement="top" :show-after="300">
            <span class="variable-name-tag">{{ v.name }}</span>
          </el-tooltip>
          <span class="variable-unit" v-if="v.unit">({{ v.unit }})</span>
          <el-tag size="small" type="info" class="variable-type-tag">{{ v.type }}</el-tag>
        </div>
        <div v-if="flatFiltered.length === 0" class="no-result">无匹配变量</div>
      </template>

      <!-- Device tree when not searching -->
      <template v-else>
        <template v-for="device in devices" :key="device.id">
          <div class="device-header" @click="toggleDevice(device.id)">
            <svg class="device-arrow" :class="{ expanded: expandedDevices.has(device.id) }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#409eff" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><path d="M8 2v4M16 2v4"/></svg>
            <el-tooltip :content="device.label" placement="top" :show-after="300" :disabled="device.label.length <= 6">
              <span class="device-label">{{ device.label }}</span>
            </el-tooltip>
            <span class="device-count">{{ device.children.length }}</span>
          </div>
          <template v-if="expandedDevices.has(device.id)">
            <div
              v-for="v in device.children"
              :key="v.id"
              class="variable-item"
              draggable="true"
              @dragstart="onDragStart($event, v)"
              @click="context.insertVariable(v)"
            >
              <el-tag type="primary" size="small" class="variable-tag">[{{ v.label }}]</el-tag>
              <el-tooltip :content="v.name" placement="top" :show-after="300">
                <span class="variable-name-tag">{{ v.name }}</span>
              </el-tooltip>
              <span class="variable-unit" v-if="v.unit">({{ v.unit }})</span>
              <el-tag size="small" type="info" class="variable-type-tag">{{ v.type }}</el-tag>
            </div>
          </template>
        </template>
      </template>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElScrollbar, ElTag, ElTooltip } from 'element-plus'
import type { VariableItem } from '../types'
import { injectFormulaEditor } from '../composables/useFormulaEditor'

const context = injectFormulaEditor()
const searchQuery = ref('')
const expandedDevices = ref(new Set(context.deviceList.value.map((d) => d.id)))

const devices = computed(() => context.deviceList.value)

const flatFiltered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const all = context.deviceList.value.flatMap((d) => d.children)
  return all.filter((v) => v.label.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
})

function toggleDevice(id: string) {
  const s = new Set(expandedDevices.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedDevices.value = s
}

function onDragStart(event: DragEvent, v: VariableItem) {
  event.dataTransfer?.setData('application/x-formula-variable', JSON.stringify({ variableId: v.id, name: v.name, label: v.label }))
  event.dataTransfer!.effectAllowed = 'copy'
}
</script>

<style scoped>
.variable-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.variable-panel .el-scrollbar {
  flex: 1;
  min-height: 0;
}

.panel-header {
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
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
  border-color: var(--el-color-primary);
  background: var(--el-bg-color);
}

.search-input::placeholder {
  color: var(--el-text-color-placeholder);
}

/* ===== Device Header ===== */
.device-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  transition: background 0.1s;
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--el-fill-color-light);
  min-width: 0;
}

.device-header:hover {
  background: var(--el-fill-color);
}

.device-arrow {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  transition: transform 0.15s;
}

.device-arrow.expanded {
  transform: rotate(90deg);
}

.device-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-count {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  padding: 0 6px;
  border-radius: 8px;
  line-height: 16px;
  flex-shrink: 0;
}

/* ===== Variable Item ===== */
.variable-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px 6px 24px;
  cursor: grab;
  transition: background-color 0.12s;
  user-select: none;
  border-left: 2px solid transparent;
  min-width: 0;
}

.variable-item:hover {
  background-color: var(--el-color-primary-light-9);
  border-left-color: var(--el-color-primary);
}

.variable-item:active {
  cursor: grabbing;
  background-color: var(--el-color-primary-light-8);
}

.variable-tag {
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  flex-shrink: 0;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variable-tag :deep(.el-tag__content) {
  font-weight: 600;
}

.variable-name-tag {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  font-family: 'Courier New', Courier, monospace;
  min-width: 0;
  flex: 0 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.variable-unit {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  margin-left: auto;
}

.variable-type-tag {
  flex-shrink: 0;
  font-size: 10px;
}

.no-result {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
