using System;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using XYZToDo.Infrastructure;
using XYZToDo.Infrastructure.Abstract;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace XYZToDo.Models.Repository
{
    public class AuthRepository : IAuthRepository
    {
        XYZToDoSQLDbContext context;
        IJWTHelpers jwtHelpers;
        ICryptoHelpers cryptoHelpers;
        IMemberLicenseRepository licenses;
        SmtpClient smtpClient;
        public AuthRepository(XYZToDoSQLDbContext context, IJWTHelpers JWTHelpers, ICryptoHelpers cryptoHelpers, IMemberLicenseRepository licenses, SmtpClient smtpClient)
        {
            this.context = context;
            this.jwtHelpers = JWTHelpers;
            this.cryptoHelpers = cryptoHelpers;
            this.licenses = licenses;
            this.smtpClient = smtpClient;
            this.Configuration = new ConfigurationHelpers().Configuration; //Configuration["JWT:SecretKeyForTokenValidation:Key"])
        }
        public IConfiguration Configuration { get; set; }
        public IQueryable<Member> Members => context.Member;

        public Tuple<string, Member> Login(LoginModel loginModel) //Returns JWT token with member or null for any errors, note:  If user enters the password correct then generate JiWT, otherwise return null.
        {
            if (loginModel == null)
                return null;
            Member member = Members.Where(m => m.Username == loginModel.Username).FirstOrDefault();
            if (member != null)
            {
                string LoginPassword = loginModel.Password; // From user login UI
                string CryptoSalt = member.CryptoSalt;// From database

                string CryptoPassword = member.CryptoPassword; // From database
                string CryptoPasswordToCheck = cryptoHelpers.EncryptWithPBKDF2(LoginPassword, CryptoSalt);
                if (CryptoPassword == CryptoPasswordToCheck)
                {
                    //return jwtHelpers.GenerateJWT(loginModel.Username); // Send a valid JWT to our member
                    return new Tuple<string, Member>(jwtHelpers.GenerateJWT(loginModel.Username), member);
                }


            }
            return null;
        }


        public ReturnModel Register(RegisterModel registerModel) //Return -2 if user already exists error has ocurred or MemberId, -1 for db errors.
        {
            Member member = Members.Where(m => m.Username == registerModel.Username || m.Email == registerModel.Email).FirstOrDefault();
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

                context.Member.Add(newMember); //New member(5 properties) is OK.

                // CREATE DATABASE MEMBER SETTING RECORD
                string[] temalar = new string[] { "ArashiyamaBambulari", "Venedik", "Peribacalari", "Orman", "Yaprak", "Kedi", "Deniz", "Denizalti", "Brienz", "Bulutlar", "TropicalGunisigi", "DenizAgac", "Bulutlar", "Tarla" };
                Random r = new Random();

                string randomItem = temalar[r.Next() % temalar.Length];

                MemberSetting mSetting = new MemberSetting { Username = registerModel.Username, Theme = randomItem };
                context.MemberSetting.Add(mSetting);
                // END OF CREATE DATABASE MEMBER SETTING RECORD

                // //CREATE TRIAL LICENSE
                // MemberLicense trialLicense = new MemberLicense();
                // trialLicense.Username = registerModel.Username;
                // trialLicense.StartDate = DateTimeOffset.Now;
                // trialLicense.EndDate = trialLicense.StartDate.AddDays(15); // 2 Haftalık Deneme Lisansı
                // trialLicense.NumberOfEmployees = 10;
                // trialLicense.Address = "Deneme Lisansı";
                // trialLicense.AzureSaConnectionString = "Deneme Lisansı";
                // trialLicense.AzureSaSizeInGb = 20;
                // trialLicense.Company = "Deneme Lisansı";
                // trialLicense.Currency = "TL";
                // trialLicense.Fee = 1;
                // trialLicense.LicenseType = "kurumsal";

                // this.licenses.NewLicense(trialLicense);

                //END TRIAL LICENSE
                context.SaveChanges(); // canceled async

                try
                {
                    this.SendThankYouEmail(registerModel).Wait(5000); // wait max 5sn
                }
                catch { }

                long MemberId = 0; // Use if needed(autoset from db)
                return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = MemberId }; //ID

            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }  // -1    








        }
        public async Task SendThankYouEmail(RegisterModel member)
        {
            //gather information
            string name = member.Name;
            string surname = member.Surname;
            string username = member.Username;

            string from = Configuration["Email:Smtp:Sender"].ToString();
            string to = member.Email;

            string frontEndServer = Configuration["JWT:FrontEndWebServer"];

            #region mail-template
            string tableStart = @"<table border=""0"" align=""center"" cellpadding=""2"" cellspacing=""0"" style=""background: rgb(255, 255, 255);background: -webkit-linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));background: linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));text-align:left; font-size:16px; color: #353535; box-shadow: 0 5px 15px rgba(0, 0, 0, .08); font-size: 16px; font-family: Arial, Helvetica, sans-serif ""><tbody style=""margin-left:5%; margin-right:5%; margin-top: 20px; padding:5%;  padding: 10px;"">";

            //  PRINT 'Xyzeki LOGO'
            string logo = $@"<tr><td style=""padding-left:10px; padding-right:10px""><a href=""{frontEndServer}"" style="" color:black;  display: inline-block;padding-top: 0.3125rem; padding-bottom: 0.3125rem;margin-right: 1rem; font-size: 1.25rem; text-decoration: none; white-space: nowrap; ""><img src=""{frontEndServer}/assets/logo.png"" style=""height: 30px;  vertical-align: middle; ""><span style=""vertical-align: middle;""> Xyzeki</span></a></td></tr>";


            //  PRINT 'Merhaba Değerli ' + @Name + ' ' + @Surname + ',' + @Username + ','
            string greeting = @"<tr><td style=""padding-left:10px; padding-right:10px"">Merhaba Değerli " + name + " " + surname + ",</td></tr>";

            string request = @"<tr><td style=""padding-left:10px; padding-right:10px"">Bizi seçtiğiniz için teşekkür ederiz.</td></tr>";


            //  PRINT ''
            string emptyLine = @"<tr><td>&nbsp;</td></tr>";

            string lastwords = @"<tr><td style=""padding-left:10px; padding-right:10px"">Xyzeki olarak siz değerli üyelerimizin memnuniyetine oldukça değer vermekteyiz.</td></tr>";
            lastwords += @"<tr><td style=""padding-left:10px; padding-right:10px"">Elimizden gelenin en iyisi için söz veriyoruz.</td></tr>";

            //  PRINT 'İyi günler dileriz.'
            string goodbye = @"<tr><td style=""padding-left:10px; padding-right:10px"">İyi günler dileriz.</td></tr>";

            string trademark = $@"<tr style=""text-align:center; background-color: #666;""><td style=""padding-top: 10px""><a href=""{frontEndServer}"" style=""color:black; text-decoration: none;""><img src=""{frontEndServer}/assets/logo.png"" style="" height: 30px; vertical-align: middle ""> <span style=""vertical-align: middle;"" > Xyzeki</span></td></tr>";

            string trademark2 = @"<tr style=""text-align:center; background-color: #666; color: #fefefe""><td><small>© 2020 Xyzeki ve logosu, Türk Patent Enstütüsü tescilli ticari markalardır.</small></td></tr>";

            string tableEnd = @"</tbody></table>";

            string content = tableStart + logo + greeting + emptyLine + request + lastwords +
            emptyLine + goodbye + trademark + trademark2 + tableEnd;

            #endregion

            var msg = new System.Net.Mail.MailMessage(from,
                 to: to,
                 subject: "Xyzeki'ye Hoş Geldiniz ",
                 body: content
                 );
            msg.IsBodyHtml = true;

            await smtpClient.SendMailAsync(msg);
        }
        public async Task<ReturnModel> RequestForgotPasswordEmail(string email)
        {
            try
            {
                Member member = Members.Where(m => m.Email == email).FirstOrDefault();
                if (member == null)
                {
                    return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
                }
                //gather information
                string name = member.Name;
                string surname = member.Surname;
                string username = member.Username;

                string from = Configuration["Email:Smtp:Sender"].ToString();
                string to = email;
                string frontEndServer = Configuration["JWT:FrontEndWebServer"];

                //save record forgot password to database.
                ForgotPassword requestRecord = new ForgotPassword { Username = username, LastValid = DateTimeOffset.Now.AddMinutes(15) };
                context.ForgotPassword.Add(requestRecord);
                context.SaveChanges();

                // get security code from database.
                string securityCode = requestRecord.SecurityCode.ToString(); // get security code after SaveChanges...

                #region mail-template
                string tableStart = @"<table border=""0"" align=""center"" cellpadding=""2"" cellspacing=""0"" style=""background: rgb(255, 255, 255);background: -webkit-linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));background: linear-gradient(to right, rgb(255, 255, 255), rgb(248, 249, 250));text-align:left; font-size:16px; color: #353535; box-shadow: 0 5px 15px rgba(0, 0, 0, .08); font-size: 16px; font-family: Arial, Helvetica, sans-serif ""><tbody style=""margin-left:5%; margin-right:5%; margin-top: 20px; padding:5%;  padding: 10px;"">";

                //  PRINT 'Xyzeki LOGO'
                string logo = $@"<tr><td style=""padding-left:10px; padding-right:10px""><a href=""{frontEndServer}""style="" color:black;  display: inline-block;padding-top: 0.3125rem; padding-bottom: 0.3125rem;margin-right: 1rem; font-size: 1.25rem; text-decoration: none; white-space: nowrap; ""><img src=""{frontEndServer}/assets/logo.png"" style=""height: 30px;  vertical-align: middle; ""><span style=""vertical-align: middle;""> Xyzeki</span></a></td></tr>";


                //  PRINT 'Merhaba Değerli ' + @Name + ' ' + @Surname + ',' + @Username + ','
                string greeting = @"<tr><td style=""padding-left:10px; padding-right:10px"">Merhaba Değerli " + name + " " + surname + ",</td></tr>";

                //  PRINT 'Bugün sizden yeni bir şifre talebi aldık.
                string request = @"<tr><td style=""padding-left:10px; padding-right:10px"">Az önce sizden yeni bir şifre talebi aldık.</td></tr>";


                //  PRINT ''
                string emptyLine = @"<tr><td>&nbsp;</td></tr>";


                //  PRINT '10 dakika boyunca geçerli aşağıdaki güvenlik kodu ile Xyzeki Şifremi Unuttum bölümünden güvenli giriş yaparak şifrenizi <b>Xyzeki Hesap</b> bölümünden değiştirebilirsiniz.
                string lastwords = @"<tr><td style=""padding-left:10px; padding-right:10px"">15 dakika boyunca geçerli aşağıdaki bağlantı </td></tr>";
                lastwords += @"<tr><td style=""padding-left:10px; padding-right:10px"">üzerinden yeni bir şifre alabilirsiniz.</td></tr>";

                //  PRINT 'Güvenlik Kodu: adfddjdjf-fdfldfldfd-fdfd
                string secureLinkHTML = $@"<tr><td style=""padding-left:10px; padding-right:10px""><a href=""{frontEndServer}/sifre-degistir/guvenlik-kodu/" + securityCode + @"""" + @" style=""color:black;  display: inline-block;padding-top: 0.3125rem; padding-bottom: 0.3125rem;margin-right: 1rem; font-size: 1rem; text-decoration: none; white-space: nowrap; ""><span style=""vertical-align: middle;""><u>Xyzeki Yeni Şifre Bağlantısı</u></span></a></td></tr>";

                //  PRINT 'İyi günler dileriz.'
                string goodbye = @"<tr><td style=""padding-left:10px; padding-right:10px"">İyi günler dileriz.</td></tr>";

                string trademark = $@"<tr style=""text-align:center; background-color: #666;""><td style=""padding-top: 10px""><a href=""{frontEndServer}"" style=""color:black; text-decoration: none;""><img src=""{frontEndServer}/assets/logo.png"" style="" height: 30px; vertical-align: middle ""> <span style=""vertical-align: middle;"" > Xyzeki</span></td></tr>";

                string trademark2 = @"<tr style=""text-align:center; background-color: #666; color: #fefefe""><td><small>© 2020 Xyzeki ve logosu, Türk Patent Enstütüsü tescilli ticari markalardır.</small></td></tr>";

                //  PRINT 'Eğer bu talebi gerçektiren siz değilseniz, bu e-postayı dikkate almayınız.
                string warning = @"<tr style=""text-align:center; background-color: #666; color: #fefefe""><td><small>Eğer bu talebi gerçektiren siz değilseniz, lütfen bu e-postayı dikkate almayınız.</small></td></tr>";

                string tableEnd = @"</tbody></table>";

                string content = tableStart + logo + greeting + emptyLine + request + lastwords +
                secureLinkHTML + emptyLine + goodbye + trademark + trademark2 + warning + tableEnd;

                #endregion

                var msg = new System.Net.Mail.MailMessage(from,
                     to: to,
                     subject: "Xyzeki Şifremi Unuttum, Yeni Şifre Talebiniz ",
                     body: content
                     );
                msg.IsBodyHtml = true;

                await smtpClient.SendMailAsync(msg);
                return new ReturnModel { ErrorCode = ErrorCodes.OK };
            }
            catch
            {
                return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError };
            }
        }

        public ReturnModel SetUpNewPassword(Guid securityCode, string newPassword)
        {
            try
            {
                Member member = context.ForgotPassword.Where(fp => fp.SecurityCode == securityCode && fp.LastValid >= DateTimeOffset.Now).Select(fp => fp.UsernameNavigation).FirstOrDefault();
                if (member == null)
                {
                    return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
                }

                (member.CryptoPassword, member.CryptoSalt) = cryptoHelpers.EncryptWithPBKDF2(newPassword);

                context.Entry(member).State = EntityState.Modified;

                foreach (var p in context.Set<ForgotPassword>().Where(fp => fp.Username == member.Username))
                {
                    context.Entry(p).State = EntityState.Deleted;
                }

                context.SaveChanges();

                return new ReturnModel { ErrorCode = ErrorCodes.OK };
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }  // -1            


        }

        public bool IsSecurityCodeFoundAndValid(Guid securityCode)
        {
            ForgotPassword fpRecord = context.ForgotPassword.Where(fp => fp.SecurityCode == securityCode && fp.LastValid >= DateTimeOffset.Now).FirstOrDefault();
            if (fpRecord == null)
            {
                return false;
            }
            else
            {
                return true;
            }
        }

    }
}
