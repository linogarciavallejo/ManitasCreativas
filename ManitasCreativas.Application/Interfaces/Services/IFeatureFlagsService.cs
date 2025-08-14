using ManitasCreativas.Application.DTOs;

namespace ManitasCreativas.Application.Interfaces.Services
{
    public interface IFeatureFlagsService
    {
        FeatureFlagsDto GetFeatureFlags();
        bool IsFeatureEnabled(string featureName);
        bool IsFeatureAvailableForUser(string featureName, bool isAdmin, string? userRole = null);
    }
}
