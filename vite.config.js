import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/jquery.temporary.offcanvas.js',
      name: 'TemporaryOffcanvas',
      fileName: (format) => `temporary.offcanvas.${format}.js`
    },
    rollupOptions: {
      external: ['jquery'],
      output: {
        globals: {
          jquery: 'jQuery'
        }
      }
    }
  }
})
