import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('E2E Test Setup: Using mock authentication mode')
  console.log('No Firebase emulator required - tests will run with mock user')
}

export default globalSetup
