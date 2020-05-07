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
    public class ProjectToDoCommentsController : ControllerBase
    {
        IProjectToDoCommentRepository IProjectToDoCommentRepository;
        public ProjectToDoCommentsController(IProjectToDoCommentRepository iProjectToDoCommentRepository)
        {
            this.IProjectToDoCommentRepository = iProjectToDoCommentRepository;
        }

        [HttpGet("ProjectToDo/{taskId}")] // GET ProjectToDoComments/ProjectToDo/2
        public IActionResult GetProjectToDoComments(long taskId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            ProjectTaskComment[] projectTaskComments = IProjectToDoCommentRepository.GetProjectToDoComments(taskId);
            if (projectTaskComments != null)
            {
                return Ok(projectTaskComments);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }


        [HttpGet("{messageId}")] // GET ProjectToDoComments/1
        public IActionResult GetProjectToDoComment(long messageId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            ProjectTaskComment projectTaskComment = IProjectToDoCommentRepository.GetProjectToDoComment(messageId);
            if (projectTaskComment != null)
            {
                return Ok(projectTaskComment);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost()] // POST /ProjectToDoComments + JSON Object
        public IActionResult NewProjectToDoComment([FromBody]ProjectTaskComment projectTaskComment) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (projectTaskComment == null)
                return BadRequest(); // 400 Bad Request

            ReturnModel r = IProjectToDoCommentRepository.AddProjectToDoComment(projectTaskComment);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(GetProjectToDoComment), new { messageId = r.ReturnedId }, r.ReturnedId); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }
        [HttpPut("{messageId}")] // PUT ProjectToDoComments/3 + JSON Object
        public IActionResult UpdateProjectToDoComment([FromRoute]long messageId, [FromBody]ProjectTaskComment projectTaskComment)
        {
            if (projectTaskComment == null || messageId != projectTaskComment.MessageId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = IProjectToDoCommentRepository.UpdateProjectToDoComment(projectTaskComment);
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

        [HttpDelete("{messageId}")] // DELETE /ProjectToDoComments/1
        public IActionResult DeleteProjectToDoComment([FromRoute]long messageId)
        {
            ProjectTaskComment ptc = IProjectToDoCommentRepository.DeleteProjectToDoComment(messageId);
            if (ptc != null)
            {
                return Ok(ptc); // This is to inform our member.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
    }
}