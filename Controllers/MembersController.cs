using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using XYZToDo.Infrastructure;
using XYZToDo.Infrastructure.Abstract;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using XYZToDo.Models;

namespace XYZToDo.Controllers
{
    [Authorize()]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        IMemberRepository IMemberRepository;
        ICryptoHelpers cryptoHelpers;
        public MembersController(IMemberRepository iMemberRepository, ICryptoHelpers cryptoHelpers)
        {
            this.IMemberRepository = iMemberRepository;
            this.cryptoHelpers = cryptoHelpers;
        }
        [HttpGet("GrantAccess/{passwordTry}")] // PUT Members/GrantAccess/12345
        public IActionResult GrantAccess(string passwordTry)
        {
            var memberLoggedin = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(IMemberRepository.GrantAccess(memberLoggedin, passwordTry)); // true or false
        }

        [HttpPut("{username}")] // PUT Members/tadakoglu + JSON Object
        public IActionResult UpdateMember([FromRoute]string username, [FromBody]RegisterModel member)
        {
            var memberLoggedin = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT

            if (username == null || member == null || memberLoggedin != username || member.Username != username)
            {
                return BadRequest(); // 400 Bad Request
            }
            try
            {
                member.Password = this.cryptoHelpers.DecryptWithAES(member.Password);
            }
            catch (System.Exception)
            {
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
            }

            ReturnModel r = IMemberRepository.UpdateMember(member);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return NoContent(); //204 No Content
            }
            if (r.ErrorCode == ErrorCodes.MemberAlreadyExistsError)
            {
                //return new StatusCodeResult(StatusCodes.Status422UnprocessableEntity); // 422 Unprocessable Entity; 409 Conflict is a little dangerous because it can expose emails in the system.
                //Google, Facebook, Amazon return OK here with some information.
                return Ok("#-1:ME"); // 200 OK but with error code #-1:ME = Email Already Exists.
            }
            else if (r.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return BadRequest();
            }

            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }

        [HttpGet("GetUser/{username}")]
        public IActionResult GetMember(string username) //Accepts JSON body, not x-www-form-urlencoded!
        {
            Member member = IMemberRepository.GetMember(username);
            if (member != null)
            {
                return Ok(member);//200 OK         
            }
            return NotFound(); //404
        }
    }
}
