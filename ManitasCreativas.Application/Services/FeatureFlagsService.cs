using ManitasCreativas.Application.DTOs;
using ManitasCreativas.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ManitasCreativas.Application.Services
{
    public class FeatureFlagsService : IFeatureFlagsService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FeatureFlagsService> _logger;
        private readonly FeatureFlagsDto _featureFlags;

        public FeatureFlagsService(IConfiguration configuration, ILogger<FeatureFlagsService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _featureFlags = LoadFeatureFlags();
        }

        public FeatureFlagsDto GetFeatureFlags()
        {
            return _featureFlags;
        }

        public bool IsFeatureEnabled(string featureName)
        {
            if (string.IsNullOrWhiteSpace(featureName))
                return false;

            if (_featureFlags.Features.TryGetValue(featureName, out var feature))
            {
                return feature.Enabled;
            }

            _logger.LogWarning("Feature flag '{FeatureName}' not found in configuration", featureName);
            return false;
        }

        public bool IsFeatureAvailableForUser(string featureName, bool isAdmin, string? userRole = null)
        {
            if (!IsFeatureEnabled(featureName))
                return false;

            if (_featureFlags.Features.TryGetValue(featureName, out var feature))
            {
                // If feature requires admin and user is not admin, deny access
                if (feature.RequiresAdmin && !isAdmin)
                    return false;

                // If allowed roles are specified, check if user role is in the list
                if (feature.AllowedRoles.Count > 0 && !string.IsNullOrWhiteSpace(userRole))
                {
                    return feature.AllowedRoles.Contains(userRole);
                }

                // If no specific role requirements and feature is enabled, allow access
                return true;
            }

            return false;
        }

        private FeatureFlagsDto LoadFeatureFlags()
        {
            try
            {
                var featureFlags = new FeatureFlagsDto();
                var configSection = _configuration.GetSection("FeatureFlags");
                
                if (configSection.Exists())
                {
                    configSection.Bind(featureFlags);
                    _logger.LogInformation("Feature flags loaded successfully. Found {Count} features", 
                        featureFlags.Features.Count);
                }
                else
                {
                    _logger.LogWarning("FeatureFlags configuration section not found. Using default empty configuration.");
                }

                return featureFlags;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading feature flags configuration. Using default empty configuration.");
                return new FeatureFlagsDto();
            }
        }
    }
}
