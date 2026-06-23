<script setup lang="ts">
import FormulaDesigner from './components/FormulaDesigner.vue'
</script>

<template>
  <div class="app-container">
    <FormulaDesigner />
  </div>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #e8edf5 0%, #f0f2f5 100%);
}
</style>
