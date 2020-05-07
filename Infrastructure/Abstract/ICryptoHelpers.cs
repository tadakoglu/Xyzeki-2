using System;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace XYZToDo.Infrastructure.Abstract
{
    public interface ICryptoHelpers
    {
         (string, string) EncryptWithPBKDF2(string password); // Returns (CrptoPasswordBase64Str, saltBase64Str) 
         string EncryptWithPBKDF2(string password, string cryptoSaltBase64Str); // Return (CrptoPasswordBase64Str) 
        
        string DecryptWithAES(string AuthorizationCode);
    }
}
