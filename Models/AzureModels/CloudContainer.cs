using System;
using Microsoft.WindowsAzure.Storage.Blob;

namespace XYZToDo.Models.AzureModels
{
    public class CloudContainer
    {
        public string ContainerName { get; set; }
        public string URI { get; set; }
        public string CreatedBy { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }

        public static CloudContainer CreateFromCloudBlobContainer(CloudBlobContainer item)
        {
            if (item is CloudBlobContainer)
            {
                var container = (CloudBlobContainer)item;
                container.FetchAttributesAsync().Wait(5000);//Gets the properties & metadata
                string CreatedBy;
                var result = container.Metadata.TryGetValue("CreatedBy", out CreatedBy);
                if (!result)
                    return null;

                return new CloudContainer
                {
                    ContainerName = container.Name,
                    URI = container.Uri.ToString(),
                    CreatedAt=DateTimeOffset.Now,
                    CreatedBy=CreatedBy
                };
            }
            return null;
        }
    }
}