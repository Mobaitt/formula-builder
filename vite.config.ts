import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { Plugin } from 'vite'

function cssInjectionPlugin(): Plugin {
  return {
    name: 'css-injection',
    enforce: 'post',
    apply: 'build',
    generateBundle(_, bundle) {
      // 找到生成的 CSS 文件
      const cssKey = Object.keys(bundle).find(k => k.endsWith('.css'))
      if (!cssKey) return
      const cssAsset = bundle[cssKey]
      if (cssAsset.type !== 'asset') return
      const cssCode = typeof cssAsset.source === 'string'
        ? cssAsset.source
        : new TextDecoder().decode(cssAsset.source)

      // 将 CSS 注入到所有 JS 入口文件
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) {
          chunk.code = `(function(){var s=document.createElement('style');s.textContent=${JSON.stringify(cssCode)};document.head.appendChild(s)})();` + chunk.code
        }
      }

      // 移除独立 CSS 文件
      delete bundle[cssKey]
    },
  }
}

export default defineConfig({
  plugins: [vue(), cssInjectionPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry/index.ts'),
      name: 'FormulaBuilder',
      fileName: 'formula-builder',
    },
    rollupOptions: {
      external: ['vue', 'element-plus'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
        },
      },
    },
    emptyOutDir: false,
  },
})
