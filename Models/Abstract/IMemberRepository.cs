using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IMemberRepository
    {
        IQueryable<Member> Members { get; }

        Member GetMember(string username);
        bool GrantAccess(string username, string passwordTry);
        ReturnModel UpdateMember(RegisterModel member);
        Member DeleteMember(string username); 
      
    }
}
