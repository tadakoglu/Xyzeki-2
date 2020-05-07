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
    public class PrivateTalkMessagesController : ControllerBase
    {
        IPrivateTalkMessageRepository IPrivateTalkMessageRepository;
        public PrivateTalkMessagesController(IPrivateTalkMessageRepository iPrivateTalkMessageRepository)
        {
            this.IPrivateTalkMessageRepository = iPrivateTalkMessageRepository;
        }
        [HttpGet()] // GET /PrivateTalkMessages
        [Authorize(Roles = "Manager")]
        public IActionResult PrivateTalkMessages()
        {
            if (IPrivateTalkMessageRepository.PrivateTalkMessages != null)
            {
                return Ok(IPrivateTalkMessageRepository.PrivateTalkMessages);
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("PrivateTalk/{privateTalkId}/Page/{pageNo}/PageSize/{pageSize}")] // GET PrivateTalkMessages/PrivateTalk/2
        public IActionResult GetPrivateTalkMessages(long privateTalkId, int pageNo = 1, int pageSize = 50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalkMessage[] privateTalkMessages = IPrivateTalkMessageRepository.GetPrivateTalkMessages(privateTalkId, pageNo, pageSize);
            if (privateTalkMessages != null)
            {
                return Ok(privateTalkMessages);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpGet("{messageId}")] // GET PrivateTalkMessages/1
        public IActionResult GetPrivateTalkMessage(long messageId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            PrivateTalkMessage privateTalkMessage = IPrivateTalkMessageRepository.GetPrivateTalkMessage(messageId);
            if (privateTalkMessage != null)
            {
                return Ok(privateTalkMessage);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost()] // POST /PrivateTalkMessages + JSON Object
        public IActionResult NewPrivateTalkMessage([FromBody]PrivateTalkMessage privateTalkMessage) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (privateTalkMessage == null)
                return BadRequest(); // 400 Bad Request

            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (member == null)
                return Unauthorized();

            privateTalkMessage.Sender = member;

            ReturnModel r = IPrivateTalkMessageRepository.AddPrivateTalkMessage(privateTalkMessage);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(GetPrivateTalkMessage), new { messageId = r.ReturnedId }, r.ReturnedId); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }

        [HttpDelete("{messageId}")] // DELETE /PrivateTalkMessages/1
        public IActionResult DeletePrivateTalkMessage([FromRoute]long messageId)
        {
            PrivateTalkMessage ptm = IPrivateTalkMessageRepository.DeletePrivateTalkMessage(messageId);
            if (ptm != null)
            {
                return Ok(ptm); // This is to inform our member.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
    }
}