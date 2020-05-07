using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IMemberSettingRepository
    {
        IQueryable<MemberSetting> MemberSetting{get;} // MemberLicenses query api
  
        MemberSetting GetMySetting(string username); 
        ReturnModel UpdateMySetting(MemberSetting setting);
        
    }
}
