using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class MemberLicenseRepository : IMemberLicenseRepository
    {
        XYZToDoSQLDbContext context;
        public MemberLicenseRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<MemberLicense> MemberLicenses => context.MemberLicense; // For querying purposes.

        public MemberLicense[] AllLicenses() // No need to show MemberLicense for now, members will not interact with license in MVP version.
        {
            return MemberLicenses.ToArray();
        }
        public ReturnModel NewLicense(MemberLicense memberLicense)
        {
            try
            {
                context.MemberLicense.Add(memberLicense);
                
                MemberLicenseUsedStorage mlus = new MemberLicenseUsedStorage { LicenseId = memberLicense.LicenseId, AzureSaUsedSizeInBytes = 1 };
                context.MemberLicenseUsedStorage.Add(mlus);
                
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, Model = memberLicense.LicenseId }; // Provides TeamId(identity autoset from db) 
        }
        public MemberLicense DeleteLicense(Guid licenseId)
        {
            MemberLicense mLicense = context.MemberLicense.Where(ml => ml.LicenseId == licenseId).FirstOrDefault();
            if (mLicense != null)
            {
                context.MemberLicense.Remove(mLicense);
                context.SaveChanges();
            }
            return mLicense; // This is to inform user.
        }


        public bool PrimaryAccessGranted(string username) // kurumsal(ekip) lisansı
        {
            MemberLicense myLicense = MemberLicenses.Where(ml => ml.Username == username && ml.EndDate > DateTimeOffset.Now && ml.LicenseType == "kurumsal").FirstOrDefault();

            if (myLicense != null) // if a license founded in my own or of a team(I joined) owner.
            {
                return true;
            }
            return false;

        }
        public bool AccessGranted(string username) // herhangi bir lisans bulunuyor(kurumsal, bireysel veya ekip üyesi lisansı)
        {
            MemberLicense myLicense = MemberLicenses.Where(ml => ml.Username == username && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

            MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == username  && tm.Status == true && tm.Team.Owner != username).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

            if (myLicense != null || licenseJoined != null) // if a license founded in my own or of a team(I joined) owner.
            {
                return true;
            }
            return false;

        }

        public MemberLicense MyLicense(string username)
        {
            MemberLicense myLicense = MemberLicenses.Where(ml => ml.Username == username && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

            MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == username && tm.Status == true && tm.Team.Owner != username).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

            if (licenseJoined != null)
                return licenseJoined;
            else if (myLicense != null)
            {
                return myLicense;
            }
            else
            {
                return null; // No any license.
            }

        }
        public MemberLicenseUsedStorage GetUsedStorage(Guid licenseId)
        {
            return context.MemberLicenseUsedStorage.Where(mlus => mlus.LicenseId == licenseId).FirstOrDefault();
        }
        public bool UpdateUsedStorage(MemberLicenseUsedStorage mlus)
        {
            try
            {
                context.Entry(mlus).State = EntityState.Modified;
                context.SaveChanges();
                return true;
            }
            catch { }
            return false;
        }

    }
}
