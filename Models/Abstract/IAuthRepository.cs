using System;
using System.Linq;
using System.Threading.Tasks;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{

    public interface IAuthRepository
    {
        //Method arguments are models when we send a full model to API method. Otherwise, just the ID is enough, e.g in Delete method
        IQueryable<Member> Members { get; }

        Tuple<string, Member> Login(LoginModel member); // Returns JWT Token with member data
        ReturnModel Register(RegisterModel member); //Return -2 if user exists error has ocurred or MemberId, -1 for db errors.

        Task<ReturnModel> RequestForgotPasswordEmail(string email);
        bool IsSecurityCodeFoundAndValid(Guid securityCode);
        ReturnModel SetUpNewPassword(Guid securityCode, string newPassword);
    }
}
