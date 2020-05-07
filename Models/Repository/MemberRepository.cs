using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Infrastructure.Abstract;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class MemberRepository : IMemberRepository
    {
        XYZToDoSQLDbContext context;
        IJWTHelpers jwtHelpers;
        ICryptoHelpers cryptoHelpers;
        public MemberRepository(XYZToDoSQLDbContext context, IJWTHelpers JWTHelpers, ICryptoHelpers cryptoHelpers)
        {
            this.context = context;
            this.jwtHelpers = JWTHelpers;
            this.cryptoHelpers = cryptoHelpers;
        }

        public IQueryable<Member> Members => context.Member;

        public Member DeleteMember(string username) // Return null for any errors otherwise Member(deleted) 
        {
            Member member = context.Member.Where(m => m.Username == username).FirstOrDefault();
            //context.Member.FindAsync()
            if (member != null)
            {
                context.Member.Remove(member);
                context.SaveChanges();
            }
            return member; // To inform user.
        }
        public Member GetMember(string username) // Return null for any errors otherwise Member(deleted) 
        {
            Member member = context.Member.Where(m => m.Username == username).FirstOrDefault();
            if (member != null)
                return member;
            return null;
        }
        public bool GrantAccess(string username, string passwordTry)
        {
            Member member = Members.Where(m => m.Username == username).FirstOrDefault();
            if (member != null)
            {
                string CryptoSalt = member.CryptoSalt;// From database
                string CryptoPassword = member.CryptoPassword; // From database

                string CryptoPasswordToCheck = cryptoHelpers.EncryptWithPBKDF2(passwordTry, CryptoSalt);
                if (CryptoPassword == CryptoPasswordToCheck)
                {
                    return true;
                }

            }
            return false;
        }


        // This method can return -2 exceptionally that means that "the user to be registered already exists" error.
        public async Task<ReturnModel> NewMember(RegisterModel registerModel) //Return -2 if user exists error has ocurred or MemberId, -1 for db errors.
        {
            Member member = Members.Where(m => m.Username == registerModel.Username || m.Email == registerModel.Email).FirstOrDefault();
            if (member != null)
            {
                return new ReturnModel { ErrorCode = ErrorCodes.MemberAlreadyExistsError }; // -2
            }
            try
            {
                Member newMember = new Member { Username = registerModel.Username, Email = registerModel.Email, Avatar = registerModel.Avatar };

                (newMember.CryptoPassword, newMember.CryptoSalt) = cryptoHelpers.EncryptWithPBKDF2(registerModel.Password);
                await context.Member.AddAsync(newMember); //New member(5 properties) is OK.
                await context.SaveChangesAsync();
                long MemberId = 0; // Use if needed(autoset from db)
                return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = MemberId }; //ID
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }  // -1            

        }
        public ReturnModel UpdateMember(RegisterModel registerModel) //Return -2 if user already exists error has ocurred or MemberId, -1 for db errors.
        {
            Member member = Members.Where(m => m.Username != registerModel.Username && m.Email == registerModel.Email).FirstOrDefault();
            if (member != null)
            {
                return new ReturnModel { ErrorCode = ErrorCodes.MemberAlreadyExistsError }; // -2
            }
            try
            {
                Member newMember = new Member
                {
                    Username = registerModel.Username,

                    Name = registerModel.Name,
                    Surname = registerModel.Surname,
                    CellCountry = registerModel.CellCountry,
                    Cell = registerModel.Cell,
                    Email = registerModel.Email,
                    Avatar = registerModel.Avatar
                };

                (newMember.CryptoPassword, newMember.CryptoSalt) = cryptoHelpers.EncryptWithPBKDF2(registerModel.Password);
                context.Entry(newMember).State = EntityState.Modified;
                context.SaveChanges();
                return new ReturnModel { ErrorCode = ErrorCodes.OK }; //ID
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }  // -1            

        }
    }
}
