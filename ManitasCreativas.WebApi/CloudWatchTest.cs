using Amazon.CloudWatchLogs;
using Amazon.CloudWatchLogs.Model;
using Amazon;

namespace ManitasCreativas.WebApi
{
    public static class CloudWatchTest
    {
        public static void TestCloudWatchConnection(string accessKey, string secretKey, string region)
        {
            try
            {
                var client = new AmazonCloudWatchLogsClient(accessKey, secretKey, RegionEndpoint.GetBySystemName(region));
                
                // Test basic connectivity by describing log groups
                var request = new DescribeLogGroupsRequest
                {
                    LogGroupNamePrefix = "ManitasCreativas"
                };
                
                var response = client.DescribeLogGroupsAsync(request).GetAwaiter().GetResult();
                
                Console.WriteLine($"✅ CloudWatch connection successful! Found {response.LogGroups.Count} log groups");
                
                foreach (var logGroup in response.LogGroups)
                {
                    Console.WriteLine($"   - Log Group: {logGroup.LogGroupName}");
                }
                
                // Test if we can create a log stream
                try
                {
                    var streamName = $"test-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
                    client.CreateLogStreamAsync(new CreateLogStreamRequest
                    {
                        LogGroupName = "ManitasCreativas-API",
                        LogStreamName = streamName
                    }).GetAwaiter().GetResult();
                    Console.WriteLine($"✅ Successfully created test log stream: {streamName}");
                    
                    // Test sending a log event
                    client.PutLogEventsAsync(new PutLogEventsRequest
                    {
                        LogGroupName = "ManitasCreativas-API",
                        LogStreamName = streamName,
                        LogEvents = new List<InputLogEvent>
                        {
                            new InputLogEvent
                            {
                                Message = "Test log message from CloudWatchTest",
                                Timestamp = DateTime.UtcNow
                            }
                        }
                    }).GetAwaiter().GetResult();
                    Console.WriteLine("✅ Successfully sent test log event");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error creating log stream or sending events: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ CloudWatch connection failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }
    }
}
