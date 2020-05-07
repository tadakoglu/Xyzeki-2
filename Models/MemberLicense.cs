using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class MemberLicense
    {
        public Guid LicenseId { get; set; }
        public string LicenseType { get; set; }
        public string Username { get; set; }
        public string AzureSaConnectionString { get; set; }
        public int AzureSaSizeInGb { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public decimal Fee { get; set; }
        public string Currency { get; set; }
        public string Company { get; set; }
        public int NumberOfEmployees { get; set; }
        public long? TaxNumber { get; set; }
        public string Address { get; set; }

        public Member UsernameNavigation { get; set; }
        public MemberLicenseUsedStorage MemberLicenseUsedStorage { get; set; }
    }
}
