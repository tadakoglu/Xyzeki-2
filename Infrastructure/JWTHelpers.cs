using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using System.IO;
using XYZToDo.Infrastructure.Abstract;

namespace XYZToDo.Infrastructure
{
    public class JWTHelpers: IJWTHelpers
    {
        //My Notes:
        //JSON web tokens consist of three basic parts: the header, payload, and the signature.
        //Token Header: A JSON object which indicates the type of the token (JWT) and the encryption algorithm used to sign it
        //Token Payload: A JSON object with the asserted Claims of the entity
        //Token Signature: A string created using a encryption algorithm with a secret using the header and payload combined as parameter. Used to verify the token has not been tampered with. Signature= HMAC:SHA256(Base64URLEncode(header) + "." + Base64URLEncode(payload), SecretKey)
        //JWT Token Structure = Base64URLEncode(header) + "." + Base64URLEncode(payload) + "." + HMAC:SHA256(Base64URLEncode(header) + "." + Base64URLEncode(payload), SecretKey) // Token parts are seperated with a dot (.) in a compact way.
        
        // 1) Web API will generate a JWT(Bearer token) and give it to logged in member. Member will use this token in every request header as "Authentication" : "Bearer XXX", XXX refers to token.
        // 2) ASP.NET Core JWT middleware will receieve the compact token structure sent by Web API, will do Base64URLDecoding to take apart token components 
        // 2.2) Then, ASP.NET Core JWT middleware will use its secret key(must be same with web api secret key in this example) to encrypt the token header and payload and compare the result with the signature of receipt token if they are same, those means validating and extracting JWT bearer tokens from a header. 
        // JWT validation is required to prevent hackers from using their own signatures or payloads. Don't put passwords in payload because its Base64URL structure can be easily decoded. 
        // By T.Adakoğlu
        
        public JWTHelpers()
        {  
            this.Configuration = new ConfigurationHelpers().Configuration; //Configuration["JWT:SecretKeyForTokenValidation:Key"])
        }
        public IConfiguration Configuration{get; set;}
       
        public string GenerateJWT(string username){ //This is for WebAPI, to create a unique JSON Web Token
           
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JWT:SecretKeyForTokenValidation:Key"])); // Our secret key for HMAC:SHA cryptography algorihm
            var signingCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256); // JWT signer or certificator or encryptor
            // signing = certification(imzalama/şifreleme); credentials = document indicating ability to do sth. (yetki belgesi), signing Credentials = imzalama yetki belgeleri, also Credentials means "identity document or a doc. showing identity(kimlik belgesi)" but not in this context.     
            // JSON Web Tokens' header and payload are signed with HMAC:SHA algorithm using a secret key, that is signature part of token compact stucture.
            var tokenOptions = new JwtSecurityToken(  
                issuer:  Configuration["JWT:BackEndWebServer"], /*the web server that issues the tokens */ // sender and receiver equals
                audience: Configuration["JWT:FrontEndWebServer"], /*value representing valid recipients, our front end web server */ // sender and receiver equals
                claims: (username == "tadakoglu") ? new List<Claim>{ new Claim(ClaimTypes.Name, username), new Claim(ClaimTypes.Role,"Manager")} : new List<Claim>{ new Claim(ClaimTypes.Name, username)},
                //claims:  new List<Claim>(), /* a list of user roles, there is no user roles(claims=haklar) assigned to this token for now, this is token payload*/
                expires: DateTime.Now.AddMinutes(double.Parse(Configuration["JWT:ExpireTimeInMinutes"])), /*DateTime object that represents the date and time after which the token expires */
                signingCredentials: signingCredentials //That will be used to sign the token (i.e. signing means certification or encryption) to create signature component of token compact structure, 
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions); // Token compact structure
            return tokenString; //Token compact structure, this will provide a JWT/Bearer token.
        }

        public TokenValidationParameters TokenValidationParameters  //This is for ASP.NET Core JWT Middleware that will validate tokens sent by users in request headers such as "Authentication" : "Bearer XXX", XXX refers to token.
        { 
            get {
                    return new TokenValidationParameters
                    {
                        ValidateIssuer=true,
                        ValidateAudience=true,
                        ValidateLifetime=true,
                        ValidateIssuerSigningKey=true, /* This will make sure if token sent by user are a valid one (created in our JWTHelpers.cs), invalid token signatures mean either token have been first changed and then sent by hacker , or just sent by a client which it not supposed to be, who dont have our secret key (hacker)*/
                        
                        ValidIssuer = Configuration["JWT:BackEndWebServer"], // sender and receiver equals
                        ValidAudience = Configuration["JWT:FrontEndWebServer"],  // sender and receiver equals
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JWT:SecretKeyForTokenValidation:Key"])) /* Web API */
                    };
            }
        }
        
    }
}
