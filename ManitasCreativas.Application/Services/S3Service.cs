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
        }

        return $"https://{_s3Config.BucketName}.s3.amazonaws.com/{fileName}";
    }

    public async Task<string?> MoveFileToArchiveAsync(string fileName)
    {
        try
        {
            var archiveFileName = $"archive/{fileName}";
            
            // Copy the file to the archive folder
            await _s3Client.CopyObjectAsync(
                _s3Config.BucketName,
                fileName,
                _s3Config.BucketName,
                archiveFileName
            );
            
            // Delete the original file
            await _s3Client.DeleteObjectAsync(_s3Config.BucketName, fileName);
            
            // Return the new archived URL
            return $"https://{_s3Config.BucketName}.s3.amazonaws.com/{archiveFileName}";
        }
        catch (Exception)
        {
            return null;
        }
    }

    public string ExtractFileNameFromUrl(string s3Url)
    {
        if (string.IsNullOrEmpty(s3Url))
            return string.Empty;

        var uri = new Uri(s3Url);
        return uri.Segments.Last();
    }
}