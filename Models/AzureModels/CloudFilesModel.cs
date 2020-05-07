using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.WindowsAzure.Storage.Blob;

namespace XYZToDo.Models.AzureModels
{
    public class CloudFilesModel
    {
        // public string ContainerName { get; set; }
        public CloudFilesModel(string containerName) : this(null, containerName)
        {
            Files = new List<CloudFile>();
            // this.ContainerName = containerName;
        }
        public CloudFilesModel(IEnumerable<IListBlobItem> list, string containerName)
        {
            Files = new List<CloudFile>();
            if (list != null && list.Count<IListBlobItem>() > 0)
            {
                foreach (var item in list)
                {
                    CloudFile info = CloudFile.CreateFromIListBlobItem(item, containerName);
                    if (info != null)
                    {
                        Files.Add(info);
                    }
                }
            }
        }
        public void AddRange(IEnumerable<IListBlobItem> list, string containerName)
        {
            if (list != null && list.Count<IListBlobItem>() > 0)
            {
                foreach (var item in list)
                {
                    CloudFile info = CloudFile.CreateFromIListBlobItem(item, containerName);
                    if (info != null)
                    {
                        Files.Add(info);
                    }
                }
            }
        }
        public List<CloudFile> Files { get; set; }
    }
}