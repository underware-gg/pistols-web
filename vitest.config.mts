import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: [
        'src/utils/smoothScroll.tsx',
        'src/hooks/useWindowDimensions.tsx',
        'src/components/PageMetadata.tsx',
        'src/components/ViewportVideo.tsx',
        'src/components/Cloud.tsx',
        'src/components/DuelistSprite.tsx',
        'src/components/MouseToolTip.tsx',
        'src/components/breakingbutton/BreakingButton.tsx',
        'src/components/CardItem.tsx',
        'src/components/ListItem.tsx',
        'src/utils/tweenScheduler.ts',
      ],
    },
  },
})
