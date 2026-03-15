import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if E2E test mode is enabled.
 * Consolidated from multiple store files to eliminate code duplication.
 *
 * Checks (in order):
 * 1. SSR safety - returns false if window is undefined
 * 2. Build-time env var - NEXT_PUBLIC_E2E_TEST_MODE
 * 3. URL parameter - ?e2e=true
 * 4. localStorage - E2E_TEST_MODE flag
 */
export function isE2ETestMode(): boolean {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true') return true
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('e2e') === 'true') return true
  if (localStorage.getItem('E2E_TEST_MODE') === 'true') return true
  return false
}

/**
 * Convert Firestore Timestamp to ISO string.
 * Consolidated from multiple store files to eliminate code duplication.
 *
 * @param timestamp - Firestore Timestamp, string, or null/undefined
 * @returns ISO string representation
 */
export function convertTimestamp(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return new Date().toISOString()
  if (typeof timestamp === 'string') return timestamp
  return timestamp.toDate().toISOString()
}
