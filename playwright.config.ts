import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') })

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const isExternalURL = baseURL !== 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  ...(isExternalURL
    ? {}
    : {
        webServer: {
          command: 'npx next build --webpack && npx next start',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 180 * 1000,
          env: {
            NEXT_PUBLIC_E2E_TEST_MODE: 'true',
          },
        },
      }),
})
