using System;
using System.Security.Cryptography;
using XYZToDo.Infrastructure.Abstract;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Text;
using System.IO;

namespace XYZToDo.Infrastructure
{
    public class CryptoHelpers : ICryptoHelpers
    {
        //This method creates its own salt.
        // Returns (CrptoPasswordBase64Str, saltBase64Str) 
        public (string, string) EncryptWithPBKDF2(string password) // That will set salt variable to salt created here
        {
            //MyNotes:
            // Salt to add onto key = 16bytes
            // PRF(Pseudo-random function for key derivation) = HMAC:SHA512, the output hash is 512 bits in length. 
            // IterationCount = Number of iterations to apply PRF when derivating key: 10000
            // Number of bytes requested = desired length of derived key(in bytes)= 32bytes

            // Generate a 128-bit(16 bytes) salt using a secure PRNG(Pseudorandom number generator)
            byte[] salt = new byte[128 / 8]; // 16 bytes long salt
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt); // Fills salt array with random sequences
            }
            //My Notes: 
            //C# byte holds 8-bit unsigned integers.
            //The smallest possible value for a byte variable is 0; the largest possible value is 255. So forth; 111 111 11 binary = 255 in decimal
            //RFC 2898 Specification of Pbkdf2
            byte[] CryptoPassword = KeyDerivation.Pbkdf2 // Derive a 512bit(64bytes) high-secure key
            (password: password, salt: salt, prf: KeyDerivationPrf.HMACSHA512, iterationCount: 10000, numBytesRequested: 512 / 8);

            string CrptoPasswordBase64Str = Convert.ToBase64String(CryptoPassword); // Convert encrypted password to Base 64 string
            string saltBase64Str = Convert.ToBase64String(salt); // Convert salt to Base 64 string
            return (CrptoPasswordBase64Str, saltBase64Str);
        }
        public string EncryptWithPBKDF2(string password, string cryptoSaltBase64Str) // Returns CrptoPasswordBase64Str
        {
            byte[] salt = Convert.FromBase64String(cryptoSaltBase64Str);
            byte[] CryptoPassword = KeyDerivation.Pbkdf2 // Derive a 512bit(64bytes) high-secure key
            (password: password, salt: salt, prf: KeyDerivationPrf.HMACSHA512, iterationCount: 10000, numBytesRequested: 512 / 8);

            string CrptoPasswordBase64Str = Convert.ToBase64String(CryptoPassword); // Convert encrypted password to Base 64 string

            return CrptoPasswordBase64Str;
        }
        public string DecryptWithAES(string AuthorizationCode)
        {

            string keyString = "14530000000001234000000800001993"; //replace with your key
            string ivString = "1453001234001993"; //replace with your iv

            byte[] key = Encoding.ASCII.GetBytes(keyString);
            byte[] iv = Encoding.ASCII.GetBytes(ivString);

            using (var rijndaelManaged = new RijndaelManaged { Key = key, IV = iv, Mode = CipherMode.CBC })
            {
                rijndaelManaged.BlockSize = 128;
                rijndaelManaged.KeySize = 256;
                using (var memoryStream = new MemoryStream(Convert.FromBase64String(AuthorizationCode)))
                using (var cryptoStream = new CryptoStream(memoryStream, rijndaelManaged.CreateDecryptor(key, iv), CryptoStreamMode.Read))
                {
                    return new StreamReader(cryptoStream).ReadToEnd();
                }
            }



        }
    }
}

//References
//https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/consumer-apis/password-hashing?view=aspnetcore-2.2
