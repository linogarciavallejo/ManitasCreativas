using Amazon.CloudWatchLogs;
using Amazon.CloudWatchLogs.Model;
using Amazon;
using Serilog;

namespace ManitasCreativas.WebApi.Services;

public static class CloudWatchTest
{
    public static async Task TestCloudWatchConnectionAsync(string accessKey, string secretKey, string region)
    {
        try
        {
            Console.WriteLine("🔍 Testing CloudWatch connection...");
            
            var client = new AmazonCloudWatchLogsClient(accessKey, secretKey, RegionEndpoint.GetBySystemName(region));
            
            // Test connection by describing log groups
            var request = new DescribeLogGroupsRequest
            {
                LogGroupNamePrefix = "ManitasCreativas",
                Limit = 10
            };
            
            var response = await client.DescribeLogGroupsAsync(request);
            Console.WriteLine($"✅ CloudWatch connection successful! Found {response.LogGroups.Count} log groups");
            
            // Check if our specific log group exists
            var logGroupExists = response.LogGroups.Any(lg => lg.LogGroupName == "ManitasCreativas-API");
            if (logGroupExists)
            {
                Console.WriteLine("✅ ManitasCreativas-API log group found");
                
                // Check log streams
                var streamsRequest = new DescribeLogStreamsRequest
                {
                    LogGroupName = "ManitasCreativas-API",
                    Limit = 10
                };
                
                var streamsResponse = await client.DescribeLogStreamsAsync(streamsRequest);
                Console.WriteLine($"📊 Found {streamsResponse.LogStreams.Count} log streams in ManitasCreativas-API");
                
                foreach (var stream in streamsResponse.LogStreams)
                {
                    var creationTimeStr = stream.CreationTime != default(DateTime)
                        ? stream.CreationTime.ToString()
                        : "Unknown";
                    Console.WriteLine($"   - Stream: {stream.LogStreamName} (Creation time: {creationTimeStr})");
                }
            }
            else
            {
                Console.WriteLine("⚠️ ManitasCreativas-API log group not found, Serilog will create it");
                
                // Try to create the log group manually
                try
                {
                    await client.CreateLogGroupAsync(new CreateLogGroupRequest
                    {
                        LogGroupName = "ManitasCreativas-API"
                    });
                    Console.WriteLine("✅ Created ManitasCreativas-API log group");
                }
                catch (ResourceAlreadyExistsException)
                {
                    Console.WriteLine("ℹ️ Log group already exists (race condition)");
                }
            }
            
            // Test writing a log entry directly
            Console.WriteLine("🧪 Testing direct log write...");
            await TestDirectLogWrite(client);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ CloudWatch connection failed: {ex.Message}");
            Console.WriteLine($"   Exception Type: {ex.GetType().Name}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"   Inner Exception: {ex.InnerException.Message}");
            }
            Log.Error(ex, "CloudWatch connectivity test failed");
        }
    }
    
    private static async Task TestDirectLogWrite(AmazonCloudWatchLogsClient client)
    {
        try
        {
            var streamName = $"test-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            
            // Create a test log stream
            await client.CreateLogStreamAsync(new CreateLogStreamRequest
            {
                LogGroupName = "ManitasCreativas-API",
                LogStreamName = streamName
            });
            
            // Put a test log event
            await client.PutLogEventsAsync(new PutLogEventsRequest
            {
                LogGroupName = "ManitasCreativas-API",
                LogStreamName = streamName,
                LogEvents = new List<InputLogEvent>
                {
                    new InputLogEvent
                    {
                        Message = "🧪 Test log entry from CloudWatch connectivity test",
                        Timestamp = DateTime.UtcNow
                    }
                }
            });
            
            Console.WriteLine($"✅ Successfully wrote test log to stream: {streamName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Direct log write test failed: {ex.Message}");
        }
    }
}
