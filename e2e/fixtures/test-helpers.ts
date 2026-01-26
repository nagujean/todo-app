import { test as base, Page, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  displayName: 'Test User',
}

export const TEAM_OWNER = {
  email: 'owner@example.com',
  password: 'ownerpassword123',
  displayName: 'Team Owner',
}

export const TEAM_MEMBER = {
  email: 'member@example.com',
  password: 'memberpassword123',
  displayName: 'Team Member',
}

// Extended test with authentication
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ browser }, use) => {
    const authStatePath = path.join(__dirname, 'auth-state.json')

    let context
    if (fs.existsSync(authStatePath)) {
      context = await browser.newContext({ storageState: authStatePath })
    } else {
      context = await browser.newContext()
    }

    const page = await context.newPage()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page)
    await context.close()
  },
})

// Helper to login via UI
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  await page.waitForURL('/', { timeout: 15000 })
}

// Helper to create user via Firebase Emulator REST API
export async function createTestUser(email: string, password: string, displayName: string) {
  try {
    const response = await fetch(
      'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          returnSecureToken: true,
        }),
      }
    )
    return response.ok
  } catch {
    return false
  }
}

// Helper to wait for app to be ready
export async function waitForAppReady(page: Page) {
  // Wait for loading to finish
  await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 }).catch(() => {})
  // Wait for main content
  await page.waitForSelector('main', { timeout: 10000 }).catch(() => {})
}

// Helper to add a todo
export async function addTodo(page: Page, title: string) {
  const input = page.getByPlaceholder('할 일을 입력하세요...')
  await input.fill(title)
  await input.press('Enter')
  await expect(page.getByText(title)).toBeVisible({ timeout: 5000 })
}

// Helper to create a team
export async function createTeam(page: Page, teamName: string) {
  // Click team switcher
  await page.click('[data-testid="team-switcher"]')
  // Click new team button
  await page.click('[data-testid="new-team-button"]')
  // Fill team name
  await page.fill('[data-testid="team-name-input"]', teamName)
  // Submit
  await page.click('[data-testid="create-team-button"]')
  // Wait for team to be created
  await expect(page.getByText(teamName)).toBeVisible({ timeout: 5000 })
}

export { expect }
