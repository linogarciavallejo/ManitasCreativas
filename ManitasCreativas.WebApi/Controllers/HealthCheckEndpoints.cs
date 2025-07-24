using ManitasCreativas.WebApi.Services;
using System.Reflection;
using System.Diagnostics;

public static class HealthCheckEndpoints
{
    public static void MapHealthCheckEndpoints(this WebApplication app)
    {
        app.MapGet("/health", (IAppLogger appLogger) =>
        {
            try
            {
                var healthCheck = new
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(),
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
                };

                appLogger.LogInformation("Health check requested - Status: {Status}", healthCheck.Status);
                
                return Results.Ok(healthCheck);
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Health check failed");
                return Results.Problem("Health check failed");
            }
        });

        app.MapGet("/health/detailed", (IAppLogger appLogger) =>
        {
            try
            {
                var detailedHealth = new
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(),
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    MachineName = Environment.MachineName,
                    ProcessId = Environment.ProcessId,
                    WorkingSet = Environment.WorkingSet,
                    ThreadCount = Environment.ProcessorCount,
                    Uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime()
                };

                appLogger.LogInformation("Detailed health check requested - Status: {Status}, Uptime: {Uptime}", 
                    detailedHealth.Status, detailedHealth.Uptime);
                
                return Results.Ok(detailedHealth);
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Detailed health check failed");
                return Results.Problem("Detailed health check failed");
            }
        });

        app.MapPost("/health/test-logging", (TestLogDto testLog, IAppLogger appLogger) =>
        {
            try
            {
                // Test different log levels
                appLogger.LogInformation("Test log message: {Message}", testLog.Message);
                appLogger.LogWarning("Test warning message: {Message}", testLog.Message);
                
                if (testLog.SimulateError)
                {
                    appLogger.LogError("Simulated error: {Message}", testLog.Message);
                }

                appLogger.LogUserAction("test-user", "Test Logging", testLog.Message);
                
                return Results.Ok(new { Message = "Logging test completed", Timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                appLogger.LogError(ex, "Error in logging test");
                return Results.Problem("Error in logging test");
            }
        });
    }
}

public record TestLogDto(string Message, bool SimulateError = false);
