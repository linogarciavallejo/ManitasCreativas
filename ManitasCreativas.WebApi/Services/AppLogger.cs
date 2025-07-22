using Serilog;
using Microsoft.Extensions.Logging;

namespace ManitasCreativas.WebApi.Services;

public interface IAppLogger
{
    void LogInformation(string message, params object[] args);
    void LogWarning(string message, params object[] args);
    void LogError(Exception ex, string message, params object[] args);
    void LogError(string message, params object[] args);
    void LogDebug(string message, params object[] args);
    void LogCritical(Exception ex, string message, params object[] args);
    
    // Specific business operation logging
    void LogUserAction(string userId, string action, string details = "");
    void LogPaymentProcessed(string paymentId, string alumnoId, decimal amount);
    void LogEmailSent(string recipient, string subject, bool success);
    void LogFileUploaded(string fileName, string userId, long fileSize);
    void LogDatabaseOperation(string operation, string table, string recordId = "");
}

public class AppLogger : IAppLogger
{
    private readonly Serilog.ILogger _logger = Log.ForContext<AppLogger>();

    public void LogInformation(string message, params object[] args)
    {
        _logger.Information(message, args);
    }

    public void LogWarning(string message, params object[] args)
    {
        _logger.Warning(message, args);
    }

    public void LogError(Exception ex, string message, params object[] args)
    {
        _logger.Error(ex, message, args);
    }

    public void LogError(string message, params object[] args)
    {
        _logger.Error(message, args);
    }

    public void LogDebug(string message, params object[] args)
    {
        _logger.Debug(message, args);
    }

    public void LogCritical(Exception ex, string message, params object[] args)
    {
        _logger.Fatal(ex, message, args);
    }

    public void LogUserAction(string userId, string action, string details = "")
    {
        _logger.Information("User Action: {UserId} performed {Action} - {Details}", 
            userId, action, details);
    }

    public void LogPaymentProcessed(string paymentId, string alumnoId, decimal amount)
    {
        _logger.Information("Payment Processed: {PaymentId} for Student {AlumnoId} - Amount: {Amount:C}", 
            paymentId, alumnoId, amount);
    }

    public void LogEmailSent(string recipient, string subject, bool success)
    {
        if (success)
        {
            _logger.Information("Email Sent Successfully: To {Recipient} - Subject: {Subject}", 
                recipient, subject);
        }
        else
        {
            _logger.Warning("Email Failed to Send: To {Recipient} - Subject: {Subject}", 
                recipient, subject);
        }
    }

    public void LogFileUploaded(string fileName, string userId, long fileSize)
    {
        _logger.Information("File Uploaded: {FileName} by User {UserId} - Size: {FileSize} bytes", 
            fileName, userId, fileSize);
    }

    public void LogDatabaseOperation(string operation, string table, string recordId = "")
    {
        _logger.Debug("Database Operation: {Operation} on {Table} - Record: {RecordId}", 
            operation, table, recordId);
    }
}
