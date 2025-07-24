namespace ManitasCreativas.WebApi.Configuration;

public class AwsLoggingConfig
{
    public string LogGroup { get; set; } = string.Empty;
    public string LogStreamNamePrefix { get; set; } = string.Empty;
    public bool IncludeLogLevel { get; set; } = true;
    public bool IncludeCategory { get; set; } = true;
    public bool IncludeNewline { get; set; } = true;
    public bool IncludeException { get; set; } = true;
    public bool IncludeEventId { get; set; } = true;
    public bool IncludeScopes { get; set; } = true;
    public string LogLevel { get; set; } = "Information";
}
