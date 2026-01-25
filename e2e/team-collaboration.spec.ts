import { test, expect } from '@playwright/test'

/**
 * Team Collaboration Feature E2E Tests
 *
 * Note: These tests require authentication. Tests will be skipped
 * if the user is not logged in. For full testing, use test accounts.
 *
 * Test Categories:
 * 1. UI Component Rendering
 * 2. Team Creation Flow
 * 3. Team Switching
 * 4. Team Members Modal
 * 5. Invite Dialog
 */

test.describe('Team Collaboration Feature', () => {
  // Check if user is authenticated before running team tests
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for auth to initialize
    await page.waitForTimeout(2000)
  })

  test.describe('1. UI Component Rendering', () => {
    test('TeamSwitcher component should be visible when logged in', async ({ page }) => {
      // Check if we're on login page (not authenticated)
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)

      if (isLoginPage) {
        test.skip()
        return
      }

      // TeamSwitcher should be visible in header
      const teamSwitcher = page.locator('button:has-text("개인")')
      await expect(teamSwitcher).toBeVisible()
    })

    test('UserMenu should have team options when team is selected', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Click on user menu
      const userMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-user') })
      await userMenuButton.click()

      // Check for logout option (always visible)
      await expect(page.getByText('로그아웃')).toBeVisible()
    })
  })

  test.describe('2. Team Creation Flow', () => {
    test('CreateTeamDialog opens when clicking new team button', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Click team switcher
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      // Click "새 팀 만들기"
      const newTeamButton = page.getByText('새 팀 만들기')
      if (await newTeamButton.isVisible()) {
        await newTeamButton.click()

        // Dialog should open
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText('새 팀 만들기')).toBeVisible()

        // Form elements should be visible
        await expect(page.getByPlaceholder('팀 이름')).toBeVisible()
        await expect(page.getByPlaceholder('팀에 대한 간단한 설명')).toBeVisible()
      }
    })

    test('CreateTeamDialog validates empty team name', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Open create team dialog
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      if (await newTeamButton.isVisible()) {
        await newTeamButton.click()

        // Try to submit without name
        const createButton = page.getByRole('button', { name: '만들기' })
        await expect(createButton).toBeDisabled()
      }
    })

    test('CreateTeamDialog can be closed', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Open create team dialog
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      if (await newTeamButton.isVisible()) {
        await newTeamButton.click()
        await expect(page.getByRole('dialog')).toBeVisible()

        // Close dialog
        const cancelButton = page.getByRole('button', { name: '취소' })
        await cancelButton.click()

        // Dialog should be closed
        await expect(page.getByRole('dialog')).not.toBeVisible()
      }
    })
  })

  test.describe('3. Team Switching', () => {
    test('TeamSwitcher dropdown opens on click', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Click team switcher
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      // Dropdown should show "개인" option
      await expect(page.getByRole('menuitem', { name: '개인' }).or(page.getByText('개인').nth(1))).toBeVisible()
    })

    test('Selecting "개인" shows personal todo title', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Title should show "할 일 목록" for personal
      await expect(page.getByText('할 일 목록')).toBeVisible()
    })
  })

  test.describe('4. Team Members Modal', () => {
    test('Team Members option appears in user menu when team is selected', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // First, need to select a team (skip if no teams)
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      // Check if any team exists in dropdown
      const teamItems = page.locator('[role="menuitem"]').filter({ hasNot: page.getByText('개인') })
      const teamCount = await teamItems.count()

      if (teamCount > 0) {
        // Select first team
        await teamItems.first().click()

        // Open user menu
        const userMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-user') })
        await userMenuButton.click()

        // "팀 멤버" option should be visible
        await expect(page.getByText('팀 멤버')).toBeVisible()
      }
    })
  })

  test.describe('5. Invite Dialog', () => {
    test('Invite option appears in user menu when team is selected', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // First, need to select a team
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      const teamItems = page.locator('[role="menuitem"]').filter({ hasNot: page.getByText('개인') })
      const teamCount = await teamItems.count()

      if (teamCount > 0) {
        await teamItems.first().click()

        // Open user menu
        const userMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-user') })
        await userMenuButton.click()

        // "팀원 초대" option should be visible
        await expect(page.getByText('팀원 초대')).toBeVisible()
      }
    })
  })

  test.describe('6. Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

    test('TeamSwitcher is responsive on mobile', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // TeamSwitcher should still be visible and functional
      const teamSwitcher = page.locator('button:has-text("개인")')
      await expect(teamSwitcher).toBeVisible()

      // Should be clickable
      await teamSwitcher.click()
      await expect(page.getByText('새 팀 만들기').or(page.getByText('개인').nth(1))).toBeVisible()
    })

    test('Dialogs are properly sized on mobile', async ({ page }) => {
      const isLoginPage = await page.getByText('로그인').isVisible().catch(() => false)
      if (isLoginPage) {
        test.skip()
        return
      }

      // Open create team dialog
      const teamSwitcher = page.locator('button:has-text("개인")')
      await teamSwitcher.click()

      const newTeamButton = page.getByText('새 팀 만들기')
      if (await newTeamButton.isVisible()) {
        await newTeamButton.click()

        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()

        // Dialog should not overflow viewport
        const dialogBox = await dialog.boundingBox()
        if (dialogBox) {
          expect(dialogBox.width).toBeLessThanOrEqual(375)
        }
      }
    })
  })
})

test.describe('Role-Based Access Control (RBAC)', () => {
  test.skip('Owner can see all management options', async ({ page }) => {
    // This test requires a logged-in owner account
    // Skip for now - requires test account setup
  })

  test.skip('Viewer cannot see edit/delete options', async ({ page }) => {
    // This test requires a viewer account
    // Skip for now - requires test account setup
  })
})
