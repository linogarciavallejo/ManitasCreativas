using Serilog;
using System.Diagnostics;
using System.Text;

namespace ManitasCreativas.WebApi.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var requestId = Guid.NewGuid().ToString();
        
        // Add request ID to context for tracing
        context.Items["RequestId"] = requestId;
        
        // Log request
        await LogRequest(context, requestId);
        
        // Call the next middleware in the pipeline
        await _next(context);
        
        stopwatch.Stop();
        
        // Log response
        LogResponse(context, requestId, stopwatch.ElapsedMilliseconds);
    }

    private async Task LogRequest(HttpContext context, string requestId)
    {
        try
        {
            var request = context.Request;
            var requestBody = string.Empty;
            
            // Read request body for POST/PUT requests (but not for file uploads)
            if ((request.Method == "POST" || request.Method == "PUT") && 
                request.ContentLength > 0 && 
                request.ContentLength < 10000 && // Limit to avoid logging large files
                request.ContentType != null && 
                (request.ContentType.Contains("application/json") || request.ContentType.Contains("application/xml")))
            {
                request.EnableBuffering();
                var buffer = new byte[Convert.ToInt32(request.ContentLength)];
                await request.Body.ReadExactlyAsync(buffer, 0, buffer.Length);
                requestBody = Encoding.UTF8.GetString(buffer);
                request.Body.Position = 0; // Reset for next middleware
            }

            Log.Information("HTTP Request {RequestId}: {Method} {Path} {QueryString} from {RemoteIpAddress} - Body: {RequestBody}",
                requestId,
                request.Method,
                request.Path,
                request.QueryString,
                context.Connection.RemoteIpAddress?.ToString(),
                requestBody);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Error logging request {RequestId}", requestId);
        }
    }

    private void LogResponse(HttpContext context, string requestId, long elapsedMs)
    {
        try
        {
            var response = context.Response;
            
            Log.Information("HTTP Response {RequestId}: {StatusCode} in {ElapsedMs}ms - Content-Type: {ContentType}",
                requestId,
                response.StatusCode,
                elapsedMs,
                response.ContentType);
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Error logging response {RequestId}", requestId);
        }
    }
}
