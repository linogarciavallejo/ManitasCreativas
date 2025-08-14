import { makeApiRequest } from './apiHelper';

export interface FeatureFlag {
  enabled: boolean;
  requiresAdmin: boolean;
  description?: string;
  allowedRoles: string[];
}

export interface FeatureFlagsResponse {
  features: Record<string, FeatureFlag>;
}

export interface User {
  esAdmin: boolean;
  rol: string;
}

class FeatureFlagsService {
  private featureFlags: Record<string, FeatureFlag> = {};
  private isLoaded = false;

  async loadFeatureFlags(): Promise<void> {
    try {
      const response = await makeApiRequest<FeatureFlagsResponse>('/featureflags', 'GET');
      this.featureFlags = response.features;
      this.isLoaded = true;
      console.log('Feature flags loaded:', this.featureFlags);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      // Use fallback configuration if API fails
      this.featureFlags = this.getFallbackFeatureFlags();
      this.isLoaded = true;
    }
  }

  async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadFeatureFlags();
    }
  }

  isFeatureEnabled(featureName: string): boolean {
    const feature = this.featureFlags[featureName];
    return feature ? feature.enabled : false;
  }

  isFeatureAvailableForUser(featureName: string, user: User | null): boolean {
    if (!user || !this.isFeatureEnabled(featureName)) {
      return false;
    }

    const feature = this.featureFlags[featureName];
    if (!feature) return false;

    // If feature requires admin and user is not admin, deny access
    if (feature.requiresAdmin && !user.esAdmin) {
      return false;
    }

    // If allowed roles are specified, check if user role is in the list
    if (feature.allowedRoles.length > 0 && user.rol) {
      return feature.allowedRoles.includes(user.rol);
    }

    // If no specific role requirements and feature is enabled, allow access
    return true;
  }

  getAvailableFeatures(user: User | null): string[] {
    return Object.keys(this.featureFlags).filter(featureName =>
      this.isFeatureAvailableForUser(featureName, user)
    );
  }

  getFeatureFlags(): Record<string, FeatureFlag> {
    return { ...this.featureFlags };
  }

  private getFallbackFeatureFlags(): Record<string, FeatureFlag> {
    // Fallback configuration in case API is not available
    return {
      'tuitions': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'transport-payments': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'other-payments': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'edit-payments': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'payment-report': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'transport-payments-report': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'reports': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'statement': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
      'rubros': { enabled: true, requiresAdmin: true, allowedRoles: ['Administrador'] },
      'students': { enabled: true, requiresAdmin: true, allowedRoles: ['Administrador'] },
      'users': { enabled: true, requiresAdmin: true, allowedRoles: ['Administrador'] },
      'routes-assignment': { enabled: true, requiresAdmin: true, allowedRoles: ['Administrador'] },
      'uniforms-configuration': { enabled: true, requiresAdmin: true, allowedRoles: ['Administrador'] },
      'uniforms-management': { enabled: true, requiresAdmin: false, allowedRoles: ['Administrador', 'Usuario'] },
    };
  }
}

// Export singleton instance
export const featureFlagsService = new FeatureFlagsService();
