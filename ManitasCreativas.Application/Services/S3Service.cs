using Amazon.S3;
using Amazon.S3.Transfer;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public class S3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Config _s3Config;

    public S3Service(IAmazonS3 s3Client, S3Config s3Config)
    {
        _s3Client = s3Client;
        _s3Config = s3Config;
    }    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, DateTime? paymentDate = null)
    {
        // Create folder structure based on payment date: Year/Month/filename
        string folderPath = "";
        if (paymentDate.HasValue)
        {
            var year = paymentDate.Value.Year;
            var month = paymentDate.Value.Month.ToString("00"); // Ensure 2-digit month (01, 02, etc.)
            folderPath = $"{year}/{month}/";
        }

        // Combine folder path with filename
        var fullKey = $"{folderPath}{fileName}";

        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = fileStream,
            Key = fullKey,
            BucketName = _s3Config.BucketName,
            ContentType = contentType,
            //CannedACL = S3CannedACL.PublicRead
        };

        using (var transferUtility = new TransferUtility(_s3Client))
        {
            await transferUtility.UploadAsync(uploadRequest);
        }

        return $"https://{_s3Config.BucketName}.s3.amazonaws.com/{fullKey}";
    }
      public async Task<string?> MoveFileToArchiveAsync(string fileKey)
    {
        try
        {
            // Log the input parameters for debugging
            //Console.WriteLine($"[S3Service] MoveFileToArchiveAsync called with fileKey: {fileKey}");
            //Console.WriteLine($"[S3Service] Bucket name: {_s3Config.BucketName}");
            
            if (string.IsNullOrEmpty(fileKey))
            {
                Console.WriteLine("[S3Service] Error: fileKey is null or empty");
                return null;
            }
            
            // The fileKey now includes the full path (e.g., "2025/06/payment-123-guid-image.jpg")
            var archiveFileKey = $"archive/{fileKey}";
            //Console.WriteLine($"[S3Service] Original file key: {fileKey}");
            //Console.WriteLine($"[S3Service] Archive file key: {archiveFileKey}");            
            // Copy the file to the archive folder
            //Console.WriteLine($"[S3Service] Copying object from {fileKey} to {archiveFileKey}");
            await _s3Client.CopyObjectAsync(
                _s3Config.BucketName,
                fileKey,
                _s3Config.BucketName,
                archiveFileKey
            );
            //Console.WriteLine("[S3Service] Copy operation completed successfully");

            // Delete the original file
            //Console.WriteLine($"[S3Service] Deleting original object: {fileKey}");
            await _s3Client.DeleteObjectAsync(_s3Config.BucketName, fileKey);
            //Console.WriteLine("[S3Service] Delete operation completed successfully");
            
            // Return the new archived URL
            var archivedUrl = $"https://{_s3Config.BucketName}.s3.amazonaws.com/{archiveFileKey}";
            //Console.WriteLine($"[S3Service] Archived URL: {archivedUrl}");
            return archivedUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[S3Service] Error in MoveFileToArchiveAsync: {ex.Message}");
            Console.WriteLine($"[S3Service] Stack trace: {ex.StackTrace}");
            return null;
        }    
    }
      public string ExtractFileKeyFromUrl(string s3Url)
    {
        //Console.WriteLine($"[S3Service] ExtractFileKeyFromUrl called with s3Url: {s3Url}");
        
        if (string.IsNullOrEmpty(s3Url))
        {
            Console.WriteLine("[S3Service] s3Url is null or empty, returning empty string");
            return string.Empty;
        }

        try
        {
            var uri = new Uri(s3Url);
            // Get the full path after the bucket name (includes year/month folders)
            var fullKey = string.Join("", uri.Segments.Skip(1)); // Skip the first "/" segment
            // URL decode the full key to handle spaces and special characters
            var decodedKey = Uri.UnescapeDataString(fullKey);
            //Console.WriteLine($"[S3Service] Extracted full key: {decodedKey}");
            return decodedKey;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[S3Service] Error extracting file key from URL: {ex.Message}");
            return string.Empty;
        }
    }

    // Keep the old method for backward compatibility
    public string ExtractFileNameFromUrl(string s3Url)
    {
        //Console.WriteLine($"[S3Service] ExtractFileNameFromUrl called with s3Url: {s3Url}");
        
        if (string.IsNullOrEmpty(s3Url))
        {
            Console.WriteLine("[S3Service] s3Url is null or empty, returning empty string");
            return string.Empty;
        }        try
        {
            var uri = new Uri(s3Url);
            var fileName = uri.Segments.Last();
            // URL decode the filename to handle spaces and special characters
            var decodedFileName = Uri.UnescapeDataString(fileName);
            //Console.WriteLine($"[S3Service] Raw extracted fileName: {fileName}");
            //Console.WriteLine($"[S3Service] URL decoded fileName: {decodedFileName}");
            return decodedFileName;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[S3Service] Error extracting filename from URL: {ex.Message}");
            return string.Empty;
        }
    }
}