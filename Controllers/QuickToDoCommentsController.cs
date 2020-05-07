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
    public class QuickToDoCommentsController : ControllerBase
    {
        IQuickTodoCommentRepository IQuickTodoCommentRepository;
        public QuickToDoCommentsController(IQuickTodoCommentRepository iQuickTodoCommentRepository)
        {
            this.IQuickTodoCommentRepository = iQuickTodoCommentRepository;
        }

        [HttpGet("QuickToDo/{taskId}")] // GET QuickToDoComments/QuickToDo/2
        public IActionResult GetQuickToDoComments(long taskId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            QuickTaskComment[] quickTaskComments = IQuickTodoCommentRepository.GetQuickTodoComments(taskId);
            if (quickTaskComments != null)
            {
                return Ok(quickTaskComments);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }


        [HttpGet("{messageId}")] // GET QuickToDoComments/1
        public IActionResult GetQuickToDoComment(long messageId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            QuickTaskComment quickTaskComment = IQuickTodoCommentRepository.GetQuickTodoComment(messageId);
            if (quickTaskComment != null)
            {
                return Ok(quickTaskComment);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost()] // POST /QuickToDoComments + JSON Object
        public IActionResult NewQuickToDoComment([FromBody]QuickTaskComment quickTaskComment) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (quickTaskComment == null)
                return BadRequest(); // 400 Bad Request

            ReturnModel r = IQuickTodoCommentRepository.AddQuickTodoComment(quickTaskComment);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(GetQuickToDoComment), new { messageId = r.ReturnedId }, r.ReturnedId); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }
        [HttpPut("{messageId}")] // PUT QuickToDoComments/3 + JSON Object
        public IActionResult UpdateQuickToDoComment([FromRoute]long messageId, [FromBody]QuickTaskComment quickTaskComment)
        {
            if (quickTaskComment == null || messageId != quickTaskComment.MessageId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = IQuickTodoCommentRepository.UpdateQuickTodoComment(quickTaskComment);
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
        [HttpDelete("{messageId}")] // DELETE /QuickToDoComments/1
        public IActionResult DeleteQuickToDoComment([FromRoute]long messageId)
        {
            QuickTaskComment qtc = IQuickTodoCommentRepository.DeleteQuickTodoComment(messageId);
            if (qtc != null)
            {
                return Ok(qtc); // This is to inform our member.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
    }
}