using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.WindowsAzure.Storage.Blob;

namespace XYZToDo.Models.AzureModels
{
    public class CloudContainersModel
    {
        public CloudContainersModel() : this(null)
        {
            Containers = new List<CloudContainer>();
        }
        public CloudContainersModel(IEnumerable<CloudBlobContainer> list)
        {
            Containers = new List<CloudContainer>();
            if (list != null && list.Count<CloudBlobContainer>() > 0)
            {
                foreach (var item in list)
                {
                    CloudContainer info = CloudContainer.CreateFromCloudBlobContainer(item);
                    if (info != null)
                    {
                        Containers.Add(info);
                    }
                }
            }
        }
        public void AddRange(IEnumerable<CloudBlobContainer> list)
        {
            if (list != null && list.Count<CloudBlobContainer>() > 0)
            {
                foreach (var item in list)
                {
                    CloudContainer info = CloudContainer.CreateFromCloudBlobContainer(item);
                    if (info != null)
                    {
                        Containers.Add(info);
                    }
                }
            }
        }
        public List<CloudContainer> Containers { get; set; }
    }
}