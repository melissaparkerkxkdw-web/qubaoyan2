import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：使用相对路径，确保在 EdgeOne/CDN 子目录下也能正确加载资源
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 生产环境优化：移除 source map 减小体积，防止源码泄露
    sourcemap: false,
    rollupOptions: {
      output: {
        // 手动分包，将第三方库单独打包，利用浏览器缓存
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          utils: ['html2canvas', 'jspdf', 'pptxgenjs']
        }
      }
    }
  }
})