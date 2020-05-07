using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.IO;
using System.Numerics;
using System.Threading.Tasks;
using XYZToDo.Infrastructure;
using XYZToDo.Models;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.AzureModels;

namespace XYZToDo.Controllers
{
    [Authorize()]
    [Route("api/[controller]")]

    public class FilesController : ControllerBase
    {
        IMemberLicenseRepository iMemberLicenseRepository;
        public FilesController(IMemberLicenseRepository iMemberLicenseRepository)
        {
            this.iMemberLicenseRepository = iMemberLicenseRepository;
        }


        [HttpGet("ListContainers")]
        public async Task<CloudContainersModel> ListContainers()
        {
            CloudContainersModel containersList = new CloudContainersModel();
            try
            {
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

                    BlobContinuationToken continuationToken = null;
                    do
                    {
                        ContainerResultSegment resultSegment = await blobClient.ListContainersSegmentedAsync(continuationToken);
                        continuationToken = resultSegment.ContinuationToken;
                        containersList.AddRange(resultSegment.Results);
                    }
                    while (continuationToken != null);

                }
            }
            catch
            {
            }
            return containersList;
        }

        [Route("CreateContainer/{containerName}")]
        [HttpGet]
        public async Task<CloudContainer> CreateContainer(string containerName)
        {
            try
            {
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
                // if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount storageAccount))
                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient BlobClient = storageAccount.CreateCloudBlobClient();
                    CloudBlobContainer container = BlobClient.GetContainerReference(containerName);

                    container.Metadata.Add("CreatedBy", member);
                    container.Metadata.Add("CreatedAt", DateTimeOffset.Now.ToString());

                    if (await container.ExistsAsync())
                    {
                        return null;
                    }
                    else
                    {
                        await container.CreateAsync();
                        CloudContainer newContainer = new CloudContainer
                        {
                            ContainerName = container.Name,
                            URI = container.Uri.ToString(),
                            CreatedAt = DateTimeOffset.Now,
                            CreatedBy = member
                        };
                        return newContainer;
                    }

                }
                else
                {
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }

        [Route("DeleteContainer/{containerName}")]
        [HttpDelete]
        public async Task<bool> DeleteContainer(string containerName)
        {
            try
            {
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
                // if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount storageAccount))
                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient BlobClient = storageAccount.CreateCloudBlobClient();
                    CloudBlobContainer container = BlobClient.GetContainerReference(containerName);

                    if (container != null)
                    {
                        await container.DeleteIfExistsAsync();
                        return true;
                    }
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
            return true;
        }


        // [HttpGet("isCompanyContainer/{containerName}")] // GET Files/isCompanyContainer/abcdefg-abc   
        // public IActionResult isCompanyContainer(string containerName)
        // {
        //     var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
        //     MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
            
        // }


        [HttpGet("ListFiles/Container/{containerName}")]
        public async Task<CloudFilesModel> ListFiles(string containerName)
        {
            CloudFilesModel blobsList = new CloudFilesModel(containerName);
            try
            {
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
                // if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount storageAccount))
                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

                    CloudBlobContainer container = blobClient.GetContainerReference(containerName);
                    BlobContinuationToken blobContinuationToken = null;
                    // var results = await container.ListBlobsSegmentedAsync(null, blobContinuationToken);
                    do
                    {
                        BlobResultSegment resultSegment = await container.ListBlobsSegmentedAsync(
                            prefix: null,
                            useFlatBlobListing: true,
                            blobListingDetails: BlobListingDetails.All, // none
                            maxResults: null,
                            currentToken: blobContinuationToken,
                            options: null,
                            operationContext: null
                        );
                        blobContinuationToken = resultSegment.ContinuationToken;
                        blobsList.AddRange(resultSegment.Results,containerName);


                    } while (blobContinuationToken != null); // Loop while the continuation token is not null.

                }
            }
            catch
            {
            }
            return blobsList;
        }

        [HttpPost("InsertFile/Container/{containerName}")]
        public async Task<CloudFile> InsertFile(IFormFile asset, string containerName)
        {
            try
            {
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);

                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

                    CloudBlobContainer container = blobClient.GetContainerReference(containerName);

                    CloudBlockBlob blockBlob = container.GetBlockBlobReference(asset.FileName);
                    blockBlob.Metadata.Add("UploadedBy", member);
                    blockBlob.Metadata.Add("CreatedAt", DateTimeOffset.Now.ToString("O")); //2020-01-16T13:25:42.8408729+00:00

                    if (await blockBlob.ExistsAsync())
                    {
                        return null;
                    }

                    MemberLicenseUsedStorage mlus = this.iMemberLicenseRepository.GetUsedStorage(ml.LicenseId);
                    long newSizeTestInBytes = long.Parse(BigInteger.Add(mlus.AzureSaUsedSizeInBytes, asset.Length).ToString());
                    long capasityInBytes = long.Parse(BigInteger.Multiply(ml.AzureSaSizeInGb, 1073741824).ToString());

                    if (newSizeTestInBytes <= capasityInBytes)
                    {
                        await blockBlob.UploadFromStreamAsync(asset.OpenReadStream());

                        // Increase Used Storage Size
                        //await container.FetchAttributesAsync();
                        mlus.AzureSaUsedSizeInBytes += asset.Length;
                        this.iMemberLicenseRepository.UpdateUsedStorage(mlus);
                        // End of Increase Used Storage Size

                        await blockBlob.FetchAttributesAsync();
                        CloudFile newFile = new CloudFile { ContentType=blockBlob.Properties.ContentType, FileName = blockBlob.Name, URL = blockBlob.Uri.ToString(), Size = blockBlob.Properties.Length, UploadedBy = member, CreatedAt = DateTimeOffset.Now, ContainerName=containerName };
                        return newFile;
                    }
                    else
                    {
                        return null;

                    }

                }
                else
                {
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }

        [Route("DeleteFile/{fileName}/Container/{containerName}")]
        [HttpDelete]
        public async Task<bool> DeleteFile(string fileName, string containerName)
        {
            try
            {
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
                // if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount storageAccount))
                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient BlobClient = storageAccount.CreateCloudBlobClient();
                    CloudBlobContainer container = BlobClient.GetContainerReference(containerName);

                    if (await container.ExistsAsync())
                    {
                        CloudBlob file = container.GetBlobReference(fileName);

                        if (await file.ExistsAsync())
                        {
                            await file.DeleteAsync();

                            //Decrease used storage                            
                            MemberLicenseUsedStorage mlus = this.iMemberLicenseRepository.GetUsedStorage(ml.LicenseId);
                            await container.FetchAttributesAsync();
                            // await file.FetchAttributesAsync();

                            mlus.AzureSaUsedSizeInBytes = long.Parse(BigInteger.Subtract(mlus.AzureSaUsedSizeInBytes, file.Properties.Length).ToString());


                            if (mlus.AzureSaUsedSizeInBytes < 0)
                                mlus.AzureSaUsedSizeInBytes = 0;

                            this.iMemberLicenseRepository.UpdateUsedStorage(mlus);
                            // End of Decrease Used Storage Size

                            return true;
                        }
                    }
                }
                else
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
            return true;
        }

        [HttpGet("DownloadFile/{fileName}/Container/{containerName}")]
        public async Task<IActionResult> DownloadFile(string fileName, string containerName)
        {
            try
            {
                MemoryStream ms = new MemoryStream();
                var member = User.Identity.Name;
                MemberLicense ml = this.iMemberLicenseRepository.MyLicense(member);
                // if (CloudStorageAccount.TryParse(config.Value.StorageConnection, out CloudStorageAccount storageAccount))
                if (CloudStorageAccount.TryParse(ml?.AzureSaConnectionString, out CloudStorageAccount storageAccount))
                {
                    CloudBlobClient BlobClient = storageAccount.CreateCloudBlobClient();
                    CloudBlobContainer container = BlobClient.GetContainerReference(containerName);

                    if (await container.ExistsAsync())
                    {
                        CloudBlob file = container.GetBlobReference(fileName);
                        if (await file.ExistsAsync())
                        {
                            await file.DownloadToStreamAsync(ms);
                            Stream blobStream = file.OpenReadAsync().Result;
                            // await file.FetchAttributesAsync();
                            return File(blobStream, file.Properties.ContentType, file.Name);
                        }
                        else
                        {
                            return Content("File does not exist");
                        }
                    }
                    else
                    {
                        return Content("Container does not exist");
                    }
                }
                else
                {
                    return Content("Error opening storage");
                }
            }
            catch
            {
                return Content("Error opening storage");
            }
        }


    }
}