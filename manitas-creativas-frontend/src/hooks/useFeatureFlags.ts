import { useState, useEffect } from 'react';
import { getAvailableFeatures } from '../services/authService';
import { featureFlagsService } from '../services/featureFlagsService';

export interface UseFeatureFlagsResult {
  availableFeatures: string[];
  isLoading: boolean;
  isFeatureAvailable: (featureName: string) => boolean;
  refreshFeatureFlags: () => Promise<void>;
}

export const useFeatureFlags = (): UseFeatureFlagsResult => {
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeatures = async () => {
    try {
      setIsLoading(true);
      const features = await getAvailableFeatures();
      setAvailableFeatures(features);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      setAvailableFeatures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isFeatureAvailable = (featureName: string): boolean => {
    return availableFeatures.includes(featureName);
  };

  const refreshFeatureFlags = async () => {
    await featureFlagsService.loadFeatureFlags();
    await loadFeatures();
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  return {
    availableFeatures,
    isLoading,
    isFeatureAvailable,
    refreshFeatureFlags
  };
};
