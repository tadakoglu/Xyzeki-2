using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class MemberSettingRepository : IMemberSettingRepository
    {
        XYZToDoSQLDbContext context;
        public MemberSettingRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<MemberSetting> MemberSetting => context.MemberSetting;

        public MemberSetting GetMySetting(string username)
        {
            return MemberSetting.Where(mSetting => mSetting.Username == username)?.FirstOrDefault();
        }
        public ReturnModel UpdateMySetting(MemberSetting setting)
        {
            MemberSetting mSetting = context.MemberSetting.Where(mS => mS.Username == setting.Username).FirstOrDefault();

            if (mSetting == null)
            {
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            }

            try
            {   
                mSetting.SwitchMode = setting.SwitchMode;
                mSetting.Theme = setting.Theme;
                mSetting.OwnerReporting = setting.OwnerReporting;
                mSetting.AssignedToReporting = setting.AssignedToReporting;
                context.Entry(mSetting).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }
    }
}