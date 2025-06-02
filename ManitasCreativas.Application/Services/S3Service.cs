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
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = fileStream,
            Key = fileName,
            BucketName = _s3Config.BucketName,
            ContentType = contentType,
            //CannedACL = S3CannedACL.PublicRead
        };

        using (var transferUtility = new TransferUtility(_s3Client))
        {
            await transferUtility.UploadAsync(uploadRequest);
        }        return $"https://{_s3Config.BucketName}.s3.amazonaws.com/{fileName}";
    }    
    
    public async Task<string?> MoveFileToArchiveAsync(string fileName)
    {
        try
        {
            // Log the input parameters for debugging
            //Console.WriteLine($"[S3Service] MoveFileToArchiveAsync called with fileName: {fileName}");
            //Console.WriteLine($"[S3Service] Bucket name: {_s3Config.BucketName}");
            
            if (string.IsNullOrEmpty(fileName))
            {
                Console.WriteLine("[S3Service] Error: fileName is null or empty");
                return null;
            }
            
            // NOT NECESSARY ANYMORE, THE fileName PARAMETER HAS BEEN ALREADY EXTRACTED
            // Extract just the filename from the URL if it's a full URL
            //var actualFileName = ExtractFileNameFromUrl(fileName);
            //if (string.IsNullOrEmpty(actualFileName))
            //{
            //    Console.WriteLine($"[S3Service] Error: Could not extract filename from: {fileName}");
            //    return null;
            //}
            
            var archiveFileName = $"archive/{fileName}";
            //Console.WriteLine($"[S3Service] Actual file name: {actualFileName}");
            //Console.WriteLine($"[S3Service] Archive file name: {archiveFileName}");            
            // Copy the file to the archive folder
            //Console.WriteLine($"[S3Service] Copying object from {actualFileName} to {archiveFileName}");
            await _s3Client.CopyObjectAsync(
                _s3Config.BucketName,
                fileName,
                _s3Config.BucketName,
                archiveFileName
            );
            //Console.WriteLine("[S3Service] Copy operation completed successfully");

            // Delete the original file
            //Console.WriteLine($"[S3Service] Deleting original object: {actualFileName}");
            await _s3Client.DeleteObjectAsync(_s3Config.BucketName, fileName);
            //Console.WriteLine("[S3Service] Delete operation completed successfully");
            
            // Return the new archived URL
            var archivedUrl = $"https://{_s3Config.BucketName}.s3.amazonaws.com/{archiveFileName}";
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