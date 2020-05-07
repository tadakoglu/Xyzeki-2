using System;
using Microsoft.WindowsAzure.Storage.Blob;

namespace XYZToDo.Models.AzureModels
{
    public class CloudFile
    {
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public string URL { get; set; }
        public long Size { get; set; }

        public string UploadedBy { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public string ContainerName { get; set; }

        public static CloudFile CreateFromIListBlobItem(IListBlobItem item, string containerName)
        {
            if (item is CloudBlockBlob)
            {
                var blob = (CloudBlockBlob)item;
                blob.FetchAttributesAsync().Wait(5000); //Gets the properties & metadata for the blob.
                string UploadedBy;
                var result = blob.Metadata.TryGetValue("UploadedBy", out UploadedBy);
                if (!result)
                    return null;

                string CreatedAt;
                var result2 = blob.Metadata.TryGetValue("CreatedAt", out CreatedAt);
                if (!result2)
                    return null;




                return new CloudFile
                {
                    FileName = blob.Name,
                    URL = blob.Uri.ToString(),
                    Size = blob.Properties.Length,
                    ContentType = blob.Properties.ContentType,
                    CreatedAt = DateTimeOffset.Parse(CreatedAt),
                    UploadedBy = UploadedBy,
                    ContainerName = containerName
                };
            }
            return null;
        }
    }
}

