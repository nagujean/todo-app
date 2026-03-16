/**
 * Feature Flags Utility
 *
 * Provides type-safe feature flag access with canary rollout support.
 * Integrates with Vercel Edge Config (production) and localStorage (development).
 *
 * @see SPEC-DEPLOY-STABILITY-001 Phase 2
 */

// Feature flag types
export type FeatureName =
  | "new-todo-ui"
  | "advanced-filtering"
  | "realtime-collaboration"
  | "performance-monitoring"
  | "experimental-features";

export interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  description: string;
  targetUsers?: string[]; // User IDs for targeted rollout
}

// Feature flag definitions
export const FEATURE_FLAGS: Record<FeatureName, FeatureFlagConfig> = {
  "new-todo-ui": {
    enabled: true,
    rolloutPercentage: 10, // Canary: 10% of users
    description: "New redesigned Todo UI with improved UX",
  },
  "advanced-filtering": {
    enabled: true,
    rolloutPercentage: 50, // 50% rollout
    description: "Advanced filtering and search capabilities",
  },
  "realtime-collaboration": {
    enabled: false,
    rolloutPercentage: 0,
    description: "Real-time collaborative editing",
  },
  "performance-monitoring": {
    enabled: true,
    rolloutPercentage: 100, // Full rollout
    description: "Performance monitoring and analytics",
  },
  "experimental-features": {
    enabled: true,
    rolloutPercentage: 5,
    description: "Experimental features for early adopters",
    targetUsers: ["admin@example.com", "test@example.com"], // Target specific users
  },
};

// Vercel Edge Config interface (placeholder for production)
interface EdgeConfig {
  get(key: string): Promise<FeatureFlagConfig | undefined>;
  getAll(): Promise<Record<string, FeatureFlagConfig>>;
}

/**
 * Get Edge Config client
 * In production, this would use @vercel/edge-config
 */
async function getEdgeConfig(): Promise<EdgeConfig | null> {
  // Production: Use Vercel Edge Config
  if (process.env.NODE_ENV === "production" && typeof window === "undefined") {
    try {
      // Placeholder for Vercel Edge Config integration
      // const { get } = await import('@vercel/edge-config');
      // return get as EdgeConfig;
      return null;
    } catch (error) {
      console.error("Failed to load Edge Config:", error);
      return null;
    }
  }

  // Development: Use localStorage fallback
  return null;
}

/**
 * Get feature flag configuration
 *
 * @param feature - Feature name
 * @returns Feature flag configuration
 */
export async function getFeatureFlag(feature: FeatureName): Promise<FeatureFlagConfig | null> {
  try {
    // Try Edge Config first (production)
    const edgeConfig = await getEdgeConfig();
    if (edgeConfig) {
      const config = await edgeConfig.get(feature);
      if (config) return config;
    }

    // Fallback to local configuration
    return FEATURE_FLAGS[feature] || null;
  } catch (error) {
    console.error(`Failed to get feature flag for ${feature}:`, error);
    return FEATURE_FLAGS[feature] || null;
  }
}

/**
 * Check if feature is enabled for current user
 *
 * @param feature - Feature name
 * @param userId - User ID (optional, for targeted rollout)
 * @returns Whether feature is enabled
 */
export async function isFeatureEnabled(feature: FeatureName, userId?: string): Promise<boolean> {
  try {
    const config = await getFeatureFlag(feature);

    if (!config || !config.enabled) {
      return false;
    }

    // Check targeted users first
    if (config.targetUsers && userId && config.targetUsers.includes(userId)) {
      return true;
    }

    // Check rollout percentage
    if (config.rolloutPercentage >= 100) {
      return true;
    }

    if (config.rolloutPercentage <= 0) {
      return false;
    }

    // Consistent hash based on user ID for deterministic rollout
    if (userId) {
      const hash = hashUserId(userId);
      return hash < config.rolloutPercentage;
    }

    // Random rollout for anonymous users
    const random = Math.random() * 100;
    return random < config.rolloutPercentage;
  } catch (error) {
    console.error(`Failed to check feature flag for ${feature}:`, error);
    return false; // Fail closed
  }
}

/**
 * Hash user ID to consistent number (0-100)
 *
 * @param userId - User ID
 * @returns Hash value (0-100)
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 101; // 0-100
}

/**
 * Get all feature flags
 *
 * @returns All feature flag configurations
 */
export async function getAllFeatureFlags(): Promise<Record<FeatureName, FeatureFlagConfig>> {
  try {
    const edgeConfig = await getEdgeConfig();
    if (edgeConfig) {
      const flags = await edgeConfig.getAll();
      return { ...FEATURE_FLAGS, ...flags } as Record<FeatureName, FeatureFlagConfig>;
    }

    return FEATURE_FLAGS;
  } catch (error) {
    console.error("Failed to get all feature flags:", error);
    return FEATURE_FLAGS;
  }
}

/**
 * Update feature flag (development only)
 *
 * @param feature - Feature name
 * @param config - New configuration
 */
export function setFeatureFlag(feature: FeatureName, config: Partial<FeatureFlagConfig>): void {
  if (process.env.NODE_ENV === "production") {
    console.warn("Cannot set feature flags in production");
    return;
  }

  FEATURE_FLAGS[feature] = {
    ...FEATURE_FLAGS[feature],
    ...config,
  };

  // Save to localStorage for persistence
  if (typeof window !== "undefined") {
    const flags = JSON.parse(localStorage.getItem("featureFlags") || "{}") as Record<
      string,
      FeatureFlagConfig
    >;
    flags[feature] = FEATURE_FLAGS[feature];
    localStorage.setItem("featureFlags", JSON.stringify(flags));
  }
}

/**
 * React hook for feature flags
 *
 * @param feature - Feature name
 * @param userId - User ID (optional)
 * @returns [isEnabled, isLoading]
 */
export function useFeatureFlag(feature: FeatureName, userId?: string): [boolean, boolean] {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    isFeatureEnabled(feature, userId)
      .then(setIsEnabled)
      .finally(() => setIsLoading(false));
  }, [feature, userId]);

  return [isEnabled, isLoading];
}

// Import React for the hook
import React from "react";
