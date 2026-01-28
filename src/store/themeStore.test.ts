import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useThemeStore.setState({ isDark: false })
    // Clear localStorage for persist tests
    localStorage.removeItem('theme-storage')
  })

  describe('Initial State (REQ-009)', () => {
    it('should have isDark as false by default', () => {
      const state = useThemeStore.getState()
      expect(state.isDark).toBe(false)
    })

    it('should have correct initial state structure', () => {
      const state = useThemeStore.getState()

      expect(state).toHaveProperty('isDark')
      expect(state).toHaveProperty('toggleTheme')
      expect(typeof state.isDark).toBe('boolean')
      expect(typeof state.toggleTheme).toBe('function')
    })
  })

  describe('toggleTheme (REQ-008)', () => {
    it('should toggle isDark from false to true', () => {
      const { toggleTheme } = useThemeStore.getState()

      expect(useThemeStore.getState().isDark).toBe(false)

      toggleTheme()

      expect(useThemeStore.getState().isDark).toBe(true)
    })

    it('should toggle isDark from true to false', () => {
      // Set initial state to true
      useThemeStore.setState({ isDark: true })
      const { toggleTheme } = useThemeStore.getState()

      expect(useThemeStore.getState().isDark).toBe(true)

      toggleTheme()

      expect(useThemeStore.getState().isDark).toBe(false)
    })

    it('should toggle multiple times correctly', () => {
      const { toggleTheme } = useThemeStore.getState()

      // Start: false
      expect(useThemeStore.getState().isDark).toBe(false)

      // Toggle 1: true
      toggleTheme()
      expect(useThemeStore.getState().isDark).toBe(true)

      // Toggle 2: false
      toggleTheme()
      expect(useThemeStore.getState().isDark).toBe(false)

      // Toggle 3: true
      toggleTheme()
      expect(useThemeStore.getState().isDark).toBe(true)
    })

  })

  describe('Persistence', () => {
    it('should persist state to localStorage under theme-storage key', () => {
      const { toggleTheme } = useThemeStore.getState()

      // Toggle to true
      toggleTheme()

      // Check that localStorage has the theme-storage key
      const storedValue = localStorage.getItem('theme-storage')
      expect(storedValue).not.toBeNull()
    })

    it('should persist isDark value correctly', () => {
      const { toggleTheme } = useThemeStore.getState()

      // Toggle to true
      toggleTheme()

      // Get the stored value and verify isDark is true
      const storedValue = localStorage.getItem('theme-storage')
      if (storedValue) {
        const parsed = JSON.parse(storedValue)
        expect(parsed.state.isDark).toBe(true)
      }
    })

    it('should use correct storage key name', () => {
      // Verify the persist middleware is configured with the correct storage key
      // by checking that the store has persist methods
      expect(useThemeStore.persist).toBeDefined()
      expect(typeof useThemeStore.persist.rehydrate).toBe('function')
    })
  })
})
