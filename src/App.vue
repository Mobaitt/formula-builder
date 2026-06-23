<script setup lang="ts">
import FormulaDesigner from './components/FormulaDesigner.vue'
import type { DeviceNode } from './types'

const customDevices: DeviceNode[] = [
  {
    id: 'pump',
    label: '泵组',
    children: [
      { id: 'pump_pressure', name: 'pump_pressure', label: '泵压', type: 'number', unit: 'MPa' },
      { id: 'pump_speed', name: 'pump_speed', label: '泵速', type: 'number', unit: 'rpm' },
      { id: 'pump_flow', name: 'pump_flow', label: '排量', type: 'number', unit: 'L/min' },
    ],
  },
  {
    id: 'sep',
    label: '分离器',
    children: [
      { id: 'sep_pressure', name: 'sep_pressure', label: '分离器压力', type: 'number', unit: 'MPa' },
      { id: 'liquid_level', name: 'liquid_level', label: '液位', type: 'number', unit: '%' },
    ],
  },
]
</script>

<template>
  <div class="app-container">
    <FormulaDesigner :devices="customDevices" />
  </div>
</template>

<style>
html, body, #app {
  margin: 0; padding: 0; height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  height: 100vh; padding: 4px; box-sizing: border-box;
  background: linear-gradient(135deg, #e8edf5 0%, #f0f2f5 100%);
}
</style>
