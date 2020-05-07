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
    public class PrivateTalkTeamReceiversController : ControllerBase
    {
        IPrivateTalkTeamReceiverRepository IPrivateTalkTeamReceiverRepository;
        public PrivateTalkTeamReceiversController(IPrivateTalkTeamReceiverRepository iPrivateTalkTeamReceiverRepository)
        {
            this.IPrivateTalkTeamReceiverRepository = iPrivateTalkTeamReceiverRepository;
        }
        [HttpGet("PrivateTalk/MyAll/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET PrivateTalkTeamReceivers/PrivateTalk/MyAll/Page/1
        public IActionResult GetMyPrivateTalkTeamReceivers(int pageNo = 1,string searchValue = "undefined", int pageSize=50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            PrivateTalkTeamReceiver[] privateTalkteamReceivers = IPrivateTalkTeamReceiverRepository.GetMyPrivateTalkTeamReceivers(member, pageNo,searchValue,pageSize);
            if (privateTalkteamReceivers != null)
            {
                return Ok(privateTalkteamReceivers);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpGet("PrivateTalk/{privateTalkId}")] // GET PrivateTalkTeamReceivers/PrivateTalk/2
        public IActionResult GetPrivateTalkTeamReceivers(long privateTalkId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalkTeamReceiver[] privateTalkTeamReceivers = IPrivateTalkTeamReceiverRepository.GetPrivateTalkTeamReceivers(privateTalkId);
            if (privateTalkTeamReceivers != null)
            {
                return Ok(privateTalkTeamReceivers);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpGet("{privateTalkTeamReceiverId}")] // GET PrivateTalkTeamReceivers/1
        public IActionResult GetPrivateTalkTeamReceiver(long privateTalkTeamReceiverId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalkTeamReceiver privateTalkTeamReceiver = IPrivateTalkTeamReceiverRepository.GetPrivateTalkTeamReceiver(privateTalkTeamReceiverId);
            if (privateTalkTeamReceiver != null)
            {
                return Ok(privateTalkTeamReceiver);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost()] // POST /PrivateTalkTeamReceivers + JSON Object
        public IActionResult NewPrivateTalkTeamReceivers([FromBody]PrivateTalkTeamReceiver[] privateTalkTeamReceivers) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (privateTalkTeamReceivers == null)
                return BadRequest(); // 400 Bad Request

            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();


            ReturnModel r = IPrivateTalkTeamReceiverRepository.AddPrivateTalkTeamReceivers(privateTalkTeamReceivers);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(null, null); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }

        // [HttpDelete("{privateTalkTeamReceiverId}")] // DELETE /PrivateTalkTeamReceivers/1
        // public IActionResult DeletePrivateTalkMessage([FromRoute]long privateTalkTeamReceiverId)
        // {
        //     PrivateTalkTeamReceiver ptr = IPrivateTalkTeamReceiverRepository.DeletePrivateTalkTeamReceiver(privateTalkTeamReceiverId);
        //     if (ptr != null)
        //     {
        //         return Ok(ptr); // This is to inform our member.
        //     }
        //     return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        // }
         [HttpDelete("PrivateTalk/{privateTalkId}")] // DELETE /PrivateTalkTeamReceivers/PrivateTalk/1
        public IActionResult DeletePrivateTalkTeamReceivers([FromRoute]long privateTalkId)
        {
            PrivateTalkTeamReceiver[] ptr = IPrivateTalkTeamReceiverRepository.DeletePrivateTalkTeamReceivers(privateTalkId);
            if (ptr != null)
            {
                return Ok(ptr); // This is to inform our member.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
    }
}