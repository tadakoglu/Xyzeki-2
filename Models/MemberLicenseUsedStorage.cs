using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class MemberLicenseUsedStorage
    {
        public Guid LicenseId { get; set; }
        public long AzureSaUsedSizeInBytes { get; set; }

        public MemberLicense License { get; set; }
    }
}
