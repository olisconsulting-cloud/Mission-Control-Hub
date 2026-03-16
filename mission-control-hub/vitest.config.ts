import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '.next/',
      ],
      all: true,
      lines: 50,
      functions: 50,
      branches: 50,
      statements: 50,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: { 
      '@': resolve(__dirname, './src'),
    },
  },
})
