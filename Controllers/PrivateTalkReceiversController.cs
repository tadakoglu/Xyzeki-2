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
    public class PrivateTalkReceiversController : ControllerBase
    {
        IPrivateTalkReceiverRepository IPrivateTalkReceiverRepository;
        public PrivateTalkReceiversController(IPrivateTalkReceiverRepository iPrivateTalkReceiverRepository)
        {
            this.IPrivateTalkReceiverRepository = iPrivateTalkReceiverRepository;
        }

        [HttpGet("PrivateTalk/MyAll/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET PrivateTalkReceivers/PrivateTalk/MyAll/Page/2
        public IActionResult GetMyPrivateTalkReceivers(int pageNo = 1,string searchValue = "undefined", int pageSize = 50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            PrivateTalkReceiver[] privateTalkReceivers = IPrivateTalkReceiverRepository.GetMyPrivateTalkReceivers(member, pageNo,searchValue,pageSize);
            if (privateTalkReceivers != null)
            {
                return Ok(privateTalkReceivers);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        //  [HttpGet("PrivateTalk/ReceivedAll/Page/{pageNo}")] // GET PrivateTalkReceivers/PrivateTalk/ReceivedAll/Page/1
        // public IActionResult GetReceivedPrivateTalkReceivers(int pageNo = 1) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        // {
        //     var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
        //     if (member == null)
        //         return Unauthorized();

        //     PrivateTalkTeamReceiver[] privateTalkReceivers = IPrivateTalkReceiverRepository.GetReceivedPrivateTalkReceivers(member, pageNo);
        //     if (privateTalkReceivers != null)
        //     {
        //         return Ok(privateTalkReceivers);
        //     }
        //     return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        // }


        [HttpGet("PrivateTalk/{privateTalkId}")] // GET PrivateTalkReceivers/PrivateTalk/2
        public IActionResult GetPrivateTalkReceivers(long privateTalkId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalkReceiver[] privateTalkReceivers = IPrivateTalkReceiverRepository.GetPrivateTalkReceivers(privateTalkId);
            if (privateTalkReceivers != null)
            {
                return Ok(privateTalkReceivers);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpGet("{privateTalkReceiverId}")] // GET PrivateTalkReceivers/1
        public IActionResult GetPrivateTalkReceiver(long privateTalkReceiverId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalkReceiver privateTalkReceiver = IPrivateTalkReceiverRepository.GetPrivateTalkReceiver(privateTalkReceiverId);
            if (privateTalkReceiver != null)
            {
                return Ok(privateTalkReceiver);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }


        // [HttpPost()] // POST /PrivateTalkReceivers + JSON Object
        // public IActionResult NewPrivateTalkReceiver([FromBody]PrivateTalkReceiver privateTalkReceiver) //Accepts JSON body, not x-www-form-urlencoded!
        // {
        //     if (privateTalkReceiver == null)
        //         return BadRequest(); // 400 Bad Request

        //     var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
        //     if (member == null)
        //         return Unauthorized();


        //     ReturnModel r = IPrivateTalkReceiverRepository.AddPrivateTalkReceiver(privateTalkReceiver);
        //     if (r.ErrorCode == ErrorCodes.OK)
        //     {
        //         return CreatedAtAction(null, null, r.ReturnedId); // 201 Created
        //     }
        //     return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        // }

        [HttpPost()] // POST /PrivateTalkReceivers + JSON Object
        public IActionResult NewPrivateTalkReceivers([FromBody]PrivateTalkReceiver[] privateTalkReceivers) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (privateTalkReceivers == null)
                return BadRequest(); // 400 Bad Request

            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();


            ReturnModel r = IPrivateTalkReceiverRepository.AddPrivateTalkReceivers(privateTalkReceivers);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(null, null); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }



        // [HttpDelete("{privateTalkReceiverId}")] // DELETE /PrivateTalkReceivers/1
        // public IActionResult DeletePrivateTalkReceiver([FromRoute]long privateTalkReceiverId)
        // {
        //     PrivateTalkReceiver ptr = IPrivateTalkReceiverRepository.DeletePrivateTalkReceiver(privateTalkReceiverId);
        //     if (ptr != null)
        //     {
        //         return Ok(ptr); // This is to inform our member.
        //     }
        //     return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        // }

        [HttpDelete("PrivateTalk/{privateTalkId}")] // DELETE /PrivateTalkReceivers/PrivateTalk/{privateTalkId}
        public IActionResult DeletePrivateTalkReceivers([FromRoute]long privateTalkId)
        {
            PrivateTalkReceiver[] ptr = IPrivateTalkReceiverRepository.DeletePrivateTalkReceivers(privateTalkId);
            if (ptr != null)
            {
                return Ok(ptr); // This is to inform our member.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
    }
}