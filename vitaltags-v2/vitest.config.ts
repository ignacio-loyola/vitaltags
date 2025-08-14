import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['apps/**/src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'node',
    reporters: 'default',
  },
})


