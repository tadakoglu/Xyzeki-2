using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IMemberLicenseRepository
    {
        IQueryable<MemberLicense> MemberLicenses { get; } // MemberLicenses query api


        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects

        // ReturnModel ValidateLicense(MemberLicense memberLicense); // Return -1 if error has occured, otherwise 0(OK),
        bool AccessGranted(string username);
        bool PrimaryAccessGranted(string username);

        MemberLicense[] AllLicenses();
        ReturnModel NewLicense(MemberLicense memberLicense);
        MemberLicense DeleteLicense(Guid licenseId);


        MemberLicense MyLicense(string username);


        MemberLicenseUsedStorage GetUsedStorage(Guid licenseId);

        bool UpdateUsedStorage(MemberLicenseUsedStorage mlus);
        
    }
}
