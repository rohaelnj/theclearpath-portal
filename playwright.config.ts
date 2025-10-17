import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: { baseURL: 'http://localhost:8888', headless: true },
  timeout: 60_000,
  webServer: {
    command: 'PORT=8888 next dev',
    port: 8888,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
