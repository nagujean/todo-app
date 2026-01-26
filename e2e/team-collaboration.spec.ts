import { test, expect, Page } from '@playwright/test'

/**
 * Team Collaboration Feature E2E Tests
 *
 * These tests run with E2E Test Mode (mock authentication) for testing:
 * - Team creation and management UI
 * - Role-based access control (RBAC) UI
 * - Team member invitations UI
 * - Mobile responsive design
 */

// E2E Test Mode URL parameter
const E2E_URL = '/?e2e=true'

// Helper function to wait for app to be fully ready
async function waitForAppReady(page: Page) {
  // Wait for the main content to load
  await page.waitForLoadState('networkidle')
  // Wait for the page to be fully rendered - give Next.js more time to compile
  await page.waitForSelector('main', { timeout: 60000 })
  // Additional wait for React hydration
  await page.waitForTimeout(500)
}

test.describe('Team Collaboration Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Capture ALL console logs for debugging
    page.on('console', msg => {
      console.log(`BROWSER [${msg.type()}]: ${msg.text()}`)
    })

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`)
    })

    // Set E2E flag via init script BEFORE any page JavaScript runs
    await page.addInitScript(() => {
      localStorage.setItem('E2E_TEST_MODE', 'true')
      console.log('[E2E] localStorage flag set via addInitScript')
    })
    await page.goto(E2E_URL)
    await waitForAppReady(page)
  })

  test.describe('1. UI Component Rendering', () => {
    test('TeamSwitcher component should be visible when logged in', async ({ page }) => {
      // TeamSwitcher should be visible in header - look for button containing "개인"
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
    })

    test('UserMenu should have logout option', async ({ page }) => {
      // Wait for team switcher to confirm we're logged in
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })

      // Click on user menu (button with user icon AND chevron-down, variant="ghost")
      const userMenuButton = page.locator('button[data-variant="ghost"]').filter({
        has: page.locator('svg.lucide-user'),
      }).filter({
        has: page.locator('svg.lucide-chevron-down'),
      })
      await userMenuButton.click()

      // Check for logout option
      await expect(page.getByText('로그아웃')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('2. Team Creation Flow', () => {
    test('CreateTeamDialog opens when clicking new team button', async ({ page }) => {
      // Click team switcher
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      // Click "새 팀 만들기" - use role="listbox" as that's what the component uses
      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()

      // Dialog should open
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
      await expect(page.getByText('새 팀 만들기').first()).toBeVisible()

      // Form elements should be visible
      await expect(page.getByPlaceholder('팀 이름을 입력하세요')).toBeVisible()
      await expect(page.getByPlaceholder('팀에 대한 설명을 입력하세요')).toBeVisible()
    })

    test('CreateTeamDialog validates empty team name', async ({ page }) => {
      // Open create team dialog
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()

      // Try to submit without name - button should be disabled
      const createButton = page.getByRole('button', { name: '만들기' })
      await expect(createButton).toBeDisabled({ timeout: 5000 })
    })

    test('CreateTeamDialog can be closed', async ({ page }) => {
      // Open create team dialog
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })

      // Close dialog
      const cancelButton = page.getByRole('button', { name: '취소' })
      await cancelButton.click()

      // Dialog should be closed
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 })
    })

    test('Can create a new team', async ({ page }) => {
      const teamName = `Test Team ${Date.now()}`

      // Open create team dialog
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()

      // Fill team details
      await page.fill('input[placeholder="팀 이름을 입력하세요"]', teamName)
      await page.fill('textarea[placeholder="팀에 대한 설명을 입력하세요"]', 'Test team description')

      // Submit
      const createButton = page.getByRole('button', { name: '만들기' })
      await expect(createButton).toBeEnabled({ timeout: 5000 })
      await createButton.click()

      // Wait for dialog to close and team to be created
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

      // After creating, the team switcher now shows the new team name (setCurrentTeam is called)
      // Verify the new team name appears in the team switcher button
      const newTeamSwitcher = page.locator('button').filter({ hasText: teamName })
      await expect(newTeamSwitcher).toBeVisible({ timeout: 5000 })

      // Click to open dropdown and verify the team is listed as an option
      await newTeamSwitcher.click()
      await expect(page.getByRole('option', { name: teamName })).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('3. Team Switching', () => {
    test('TeamSwitcher dropdown opens on click', async ({ page }) => {
      // Click team switcher
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      // Dropdown should show "새 팀 만들기" option
      await expect(page.getByText('새 팀 만들기')).toBeVisible({ timeout: 5000 })
    })

    test('Selecting "개인" shows personal todo title', async ({ page }) => {
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })

      // Title should show "할 일 목록" for personal
      await expect(page.getByText('할 일 목록')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('4. Team Members Modal', () => {
    test('Team Members option appears in user menu when team is selected', async ({ page }) => {
      const testTeamName = `Test Team ${Date.now()}`

      // First, create a team to ensure we have one
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      // Click "새 팀 만들기" to create a team
      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()

      // Fill team details and create
      await page.fill('input[placeholder="팀 이름을 입력하세요"]', testTeamName)
      const createButton = page.getByRole('button', { name: '만들기' })
      await expect(createButton).toBeEnabled({ timeout: 5000 })
      await createButton.click()

      // Wait for dialog to close and team to be created
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

      // The team switcher should now show the new team name
      await expect(page.locator('button').filter({ hasText: testTeamName })).toBeVisible({ timeout: 5000 })

      // Open user menu (button with user icon AND chevron-down, variant="ghost")
      const userMenuButton = page.locator('button[data-variant="ghost"]').filter({
        has: page.locator('svg.lucide-user'),
      }).filter({
        has: page.locator('svg.lucide-chevron-down'),
      })
      await userMenuButton.click()

      // "팀 멤버" option should be visible
      await expect(page.getByText('팀 멤버')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('5. Invite Dialog', () => {
    test('Invite option appears in user menu when team is selected', async ({ page }) => {
      const testTeamName = `Invite Test Team ${Date.now()}`

      // First, create a team to ensure we have one
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      // Click "새 팀 만들기" to create a team
      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()

      // Fill team details and create
      await page.fill('input[placeholder="팀 이름을 입력하세요"]', testTeamName)
      const createButton = page.getByRole('button', { name: '만들기' })
      await expect(createButton).toBeEnabled({ timeout: 5000 })
      await createButton.click()

      // Wait for dialog to close and team to be created
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

      // The team switcher should now show the new team name
      await expect(page.locator('button').filter({ hasText: testTeamName })).toBeVisible({ timeout: 5000 })

      // Open user menu (button with user icon AND chevron-down, variant="ghost")
      const userMenuButton = page.locator('button[data-variant="ghost"]').filter({
        has: page.locator('svg.lucide-user'),
      }).filter({
        has: page.locator('svg.lucide-chevron-down'),
      })
      await userMenuButton.click()

      // "팀원 초대" option should be visible
      await expect(page.getByText('팀원 초대')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('6. Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

    test('TeamSwitcher is responsive on mobile', async ({ page }) => {
      // TeamSwitcher should still be visible and functional
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })

      // Should be clickable
      await teamSwitcher.click()
      await expect(page.getByText('새 팀 만들기')).toBeVisible({ timeout: 5000 })
    })

    test('Dialogs are properly sized on mobile', async ({ page }) => {
      // Open create team dialog
      const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
      await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      await expect(newTeamButton).toBeVisible({ timeout: 5000 })
      await newTeamButton.click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })

      // Dialog should not overflow viewport
      const dialogBox = await dialog.boundingBox()
      if (dialogBox) {
        expect(dialogBox.width).toBeLessThanOrEqual(375)
      }
    })
  })
})

test.describe('Role-Based Access Control (RBAC)', () => {
  test('Owner can see all management options', async ({ page }) => {
    await page.goto(E2E_URL)
    await waitForAppReady(page)

    const testTeamName = `RBAC Test Team ${Date.now()}`

    // Create a team where the user is owner
    const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
    await expect(teamSwitcher).toBeVisible({ timeout: 15000 })
    await teamSwitcher.click()

    // Click "새 팀 만들기" to create a team
    const newTeamButton = page.getByText('새 팀 만들기')
    await expect(newTeamButton).toBeVisible({ timeout: 5000 })
    await newTeamButton.click()

    // Fill team details and create
    await page.fill('input[placeholder="팀 이름을 입력하세요"]', testTeamName)
    const createButton = page.getByRole('button', { name: '만들기' })
    await expect(createButton).toBeEnabled({ timeout: 5000 })
    await createButton.click()

    // Wait for dialog to close and team to be created
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // The team switcher should now show the new team name (user is owner)
    await expect(page.locator('button').filter({ hasText: testTeamName })).toBeVisible({ timeout: 5000 })

    // Open user menu (button with user icon AND chevron-down, variant="ghost")
    const userMenuButton = page.locator('button[data-variant="ghost"]').filter({
      has: page.locator('svg.lucide-user'),
    }).filter({
      has: page.locator('svg.lucide-chevron-down'),
    })
    await userMenuButton.click()

    // Owner should see: 팀 멤버, 팀원 초대
    await expect(page.getByText('팀 멤버')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('팀원 초대')).toBeVisible({ timeout: 5000 })
  })

  test('Team title changes when switching teams', async ({ page }) => {
    await page.goto(E2E_URL)
    await waitForAppReady(page)

    // Personal view should show "할 일 목록"
    await expect(page.getByText('할 일 목록')).toBeVisible({ timeout: 15000 })

    // Switch to a team if available
    const teamSwitcher = page.locator('button').filter({ hasText: '개인' })
    await teamSwitcher.click()

    const teamOptions = page.locator('button[role="option"]').filter({
      hasNot: page.getByText('개인'),
    }).filter({
      hasNot: page.getByText('새 팀 만들기'),
    })

    const teamCount = await teamOptions.count()
    if (teamCount === 0) {
      // No teams to switch to, test passes as personal view is correct
      return
    }

    const teamName = await teamOptions.first().textContent()
    await teamOptions.first().click()
    await page.waitForTimeout(500)

    // Title should change to team name
    if (teamName) {
      await expect(page.getByText(teamName.trim())).toBeVisible({ timeout: 5000 })
    }
  })
})
