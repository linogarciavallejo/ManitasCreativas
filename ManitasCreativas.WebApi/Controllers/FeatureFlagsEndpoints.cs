using ManitasCreativas.Application.Interfaces.Services;

public static class FeatureFlagsEndpoints
{
    public static void MapFeatureFlagsEndpoints(this WebApplication app)
    {
        app.MapGet("/featureflags", async (IFeatureFlagsService featureFlagsService, ILogger<Program> logger) =>
        {
            try
            {
                var featureFlags = featureFlagsService.GetFeatureFlags();
                logger.LogInformation("Feature flags retrieved successfully");
                return Results.Ok(featureFlags);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving feature flags");
                return Results.Problem("Error retrieving feature flags", statusCode: 500);
            }
        });

        app.MapGet("/featureflags/{featureName}/enabled", async (string featureName, IFeatureFlagsService featureFlagsService, ILogger<Program> logger) =>
        {
            try
            {
                var isEnabled = featureFlagsService.IsFeatureEnabled(featureName);
                return Results.Ok(new { featureName, enabled = isEnabled });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error checking feature flag {FeatureName}", featureName);
                return Results.Problem("Error checking feature flag", statusCode: 500);
            }
        });
    }
}
