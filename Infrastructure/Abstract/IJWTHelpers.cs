using System;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens; //Includes TokenValidationParameters

namespace XYZToDo.Infrastructure.Abstract
{
    public interface IJWTHelpers
    {      
        string GenerateJWT(string username);   //This is for Web API
        TokenValidationParameters TokenValidationParameters{get;}  //This is for ASP.NET Core JWT Middleware in Startup.cs
    }
}
