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
using Newtonsoft.Json;

namespace XYZToDo.Controllers
{
    [Authorize()]
    [Route("api/[controller]")]
    public class PrivateTalksController : ControllerBase
    {
        IPrivateTalkRepository IPrivateTalkRepository;
        public PrivateTalksController(IPrivateTalkRepository iPrivateTalkRepository)
        {
            this.IPrivateTalkRepository = iPrivateTalkRepository;
        }
        [HttpGet()] // GET /PrivateTalks
        [Authorize(Roles = "Manager")]
        public IActionResult PrivateTalks()
        {
            if (IPrivateTalkRepository.PrivateTalks != null)
            {
                return Ok(IPrivateTalkRepository.PrivateTalks); //new JsonResult(IPrivateTalkRepository.PrivateTalks.ToList())
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        // [HttpGet("{sender}/Sender")] // GET PrivateTalks/tadakoglu/Sender    
        // [Authorize(Roles = "Manager")]
        // public IActionResult PrivateTalks(string sender) //Accepts from route parameters not JSON.
        // {
        //     PrivateTalk[] privateTalks = IPrivateTalkRepository.MyPrivateTalks(sender);
        //     if (privateTalks != null)
        //     {
        //         return Ok(privateTalks); // 200 OK
        //     }
        //     return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        // }
        [HttpGet("isMyPrivateTalk/{privateTalkId}")] // GET PrivateTalks/isMyPrivateTalk/2    // GET PrivateTalks/isPrivateTalkJoined/2  
        public IActionResult isMyPrivateTalk(long privateTalkId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(IPrivateTalkRepository.isMyPrivateTalkGuard(privateTalkId, member));
        }
        [HttpGet("isPrivateTalkJoined/{privateTalkId}")] // GET PrivateTalks/isPrivateTalkJoined/2  
        public IActionResult isPrivateTalkJoined(long privateTalkId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(IPrivateTalkRepository.isPrivateTalkJoinedGuard(privateTalkId, member));
        }

        [HttpGet("MyPTUnreadCount")] // GET PrivateTalks/MyPTUnreadCount   PrivateTalks/ReceivedPTUnreadCount  
        public IActionResult MyUnreadPTCount()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            return Ok(IPrivateTalkRepository.GetUnreadMyPrivateTalksCount(member));
        }
        [HttpGet("ReceivedPTUnreadCount")] // GET PrivateTalks/ReceivedPTUnreadCount  
        public IActionResult ReceivedUnreadPTCount()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            return Ok(IPrivateTalkRepository.GetUnreadReceivedPrivateTalksCount(member));
        }

        [HttpGet("GetNewUnreadPrivateTalk/{privateTalkId}")] // GET PrivateTalks/GetNewUnreadPrivateTalk/{privateTalkId}
        public IActionResult GetNewUnreadPrivateTalk(int privateTalkId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();
            PrivateTalkInsideOut ptio = IPrivateTalkRepository.GetNewUnreadPrivateTalk(privateTalkId, member);
            return Ok(ptio);
        }

        [HttpGet("MyPrivateTalks/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET PrivateTalks/MyPrivateTalks/Page/{pageNo}        
        public IActionResult MyPrivateTalks(int pageNo = 1, string searchValue = "undefined", int pageSize=50)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            PrivateTalk[] myPrivateTalks = IPrivateTalkRepository.MyPrivateTalks(member, pageNo, searchValue,pageSize);
            if (myPrivateTalks != null)
            {
                return Ok(myPrivateTalks); // 200 OK
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("Received/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET PrivateTalks/Received/Page/{pageNo}        
        public IActionResult PrivateTalksReceived(int pageNo = 1, string searchValue = "undefined", int pageSize=50) // You will be able to see the Private talks of the owners of the teams that you joined...
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            PrivateTalk[] myPrivateTalks = IPrivateTalkRepository.PrivateTalksReceived(member, pageNo, searchValue, pageSize);
            if (myPrivateTalks != null)
            {
                return Ok(myPrivateTalks); // 200 OK
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }


        [HttpGet("My/MessagesCount/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET api/PrivateTalks/My/Page/2/MessagesCount
        public IActionResult GetMyPrivateTalkMessagesCount(int pageNo = 1, string searchValue = "undefined", int pageSize=50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            MessageCountModel[] ptmCount = this.IPrivateTalkRepository.GetMyPrivateTalkMessagesCount(member, pageNo, searchValue,pageSize);
            if (ptmCount != null)
                return Ok(ptmCount);
            else
                return NoContent();
        }

        [HttpGet("Received/MessagesCount/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET api/PrivateTalks/Received/Page/2/MessagesCount
        public IActionResult GetReceivedPrivateTalkMessagesCount(int pageNo = 1, string searchValue = "undefined", int pageSize=50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            MessageCountModel[] ptmCount = this.IPrivateTalkRepository.GetReceivedPrivateTalkMessagesCount(member, pageNo, searchValue,pageSize);
            if (ptmCount != null)
                return Ok(ptmCount);
            else
                return NoContent();
        }

        [HttpPost("PrivateTalkLastSeen")] // POST /PrivateTalks/PrivateTalkLastSeen + JSON Object
        public IActionResult NewPrivateTalkLastSeen([FromBody]PrivateTalkLastSeen privateTalkLastSeen) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (privateTalkLastSeen == null)
                return BadRequest(); // 400 Bad Request

            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            ReturnModel newOrUpdatePTLS = IPrivateTalkRepository.NewPrivateTalkLastSeen(privateTalkLastSeen);
            if (newOrUpdatePTLS.ErrorCode == ErrorCodes.OK)
            {
                return NoContent(); //204 No Content
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }

        [HttpGet("{privateTalkId}")] // GET PrivateTalks/2133
        public IActionResult GetPrivateTalk(long privateTalkId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalk privateTalk = IPrivateTalkRepository.GetPrivateTalk(privateTalkId);
            if (privateTalk != null)
            {
                return Ok(privateTalk);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost()] // POST /PrivateTalks + JSON Object
        public IActionResult NewPrivateTalk([FromBody]PrivateTalk privateTalk) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (privateTalk == null)
                return BadRequest(); // 400 Bad Request

            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            privateTalk.Sender = member;
            ReturnModel newPrivateTalk = IPrivateTalkRepository.NewPrivateTalk(privateTalk);
            if (newPrivateTalk.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(GetPrivateTalk), new { PrivateTalkId = newPrivateTalk.ReturnedId }, newPrivateTalk.ReturnedId); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }

        [HttpPut("{privateTalkId}")] // PUT PrivateTalks/3 + JSON Object
        public IActionResult UpdatePrivateTalk([FromRoute]long privateTalkId, [FromBody]PrivateTalk privateTalk)
        {

            if (privateTalk == null || privateTalk.Sender != User.Identity.Name || privateTalkId != privateTalk.PrivateTalkId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = IPrivateTalkRepository.UpdatePrivateTalk(privateTalk);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return NoContent(); //204 No Content
            }
            else if (r.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return BadRequest();
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }

        [HttpDelete("{privateTalkId}")] // DELETE PrivateTalks/1
        public IActionResult DeletePrivateTalk([FromRoute]long privateTalkId) //[FromRoute] is optional, it already accepts from route parameters not JSON.
        {
            PrivateTalk privateTalk = IPrivateTalkRepository.DeletePrivateTalk(privateTalkId);
            if (privateTalk != null)
            {
                return Ok(privateTalk); // or use No Content without arguments returned.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     

        }

    }
}