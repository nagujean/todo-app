import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('E2E Test Teardown: Cleanup complete')
}

export default globalTeardown
