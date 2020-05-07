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
    public class ProjectToDosController : ControllerBase
    {
        IProjectToDoRepository IProjectToDoRepository;
        public ProjectToDosController(IProjectToDoRepository iProjectToDoRepository)
        {
            this.IProjectToDoRepository = iProjectToDoRepository;
        }
        [HttpGet()] // GET /ProjectToDos
        [Authorize(Roles = "Manager")]
        public IActionResult ProjectToDos()
        {
            if (IProjectToDoRepository.ProjectToDos != null)
            {
                return Ok(IProjectToDoRepository.ProjectToDos);
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("Project/{projectId}")] // GET ProjectToDos/Project/2
        public IActionResult GetProjectToDos(long projectId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            ProjectTask[] projectToDos = IProjectToDoRepository.GetProjectToDos(projectId);
            if (projectToDos != null)
            {
                return Ok(projectToDos);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
        [HttpGet("AssignedToMe/Search/{searchValue}")] // GET ProjectToDos/AssignedToMe
        public IActionResult AssignedProjectToDos(string searchValue = "undefined")
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            ProjectTask[] projectToDos = IProjectToDoRepository.AssignedProjectToDos(member, searchValue);
            if (projectToDos != null)
            {
                return Ok(projectToDos);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpGet("AssignedToMe/CommentsCount/Search/{searchValue}")] // GET api/ProjectToDos/AssignedToMe/CommentsCount
        public IActionResult GetProjectToDoAssignedCommentsCount(string searchValue = "undefined") //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            CommentCountModel[] ptAssignedCommentsCount = this.IProjectToDoRepository.GetProjectToDoAssignedCommentsCount(member, searchValue);
            if (ptAssignedCommentsCount != null)
                return Ok(ptAssignedCommentsCount);
            else
                return NoContent();
        }
        [HttpGet("Project/{projectId}/CommentsCount")] // GET api/ProjectToDos/Project/{projectId}/CommentsCount
        public IActionResult GetProjectToDoCommentsCount(long projectId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            CommentCountModel[] ptCommentsCount = this.IProjectToDoRepository.GetProjectToDoCommentsCount(projectId);
            if (ptCommentsCount != null)
                return Ok(ptCommentsCount);
            else
                return NoContent();
        }

        [HttpGet("{toDoId}")] // GET ProjectToDos/1
        public IActionResult FindProjectToDo(long toDoId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            ProjectTask projectToDo = IProjectToDoRepository.FindProjectToDo(toDoId);
            if (projectToDo != null)
            {
                return Ok(projectToDo);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
        [HttpPut("Complete/{ProjectTodoId}")]
        public IActionResult Complete([FromRoute]long ProjectTodoId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (ProjectTodoId == 0)
            {
                return BadRequest(); // 400 Bad Request
            }
            if (IProjectToDoRepository.FindProjectToDo(ProjectTodoId).AssignedTo == member) // Authorize
            {
                ProjectTask pTask = IProjectToDoRepository.Complete(ProjectTodoId);
                if (pTask != null)
                {
                    return Ok(pTask);
                }
                else
                {
                    return NoContent();
                }

            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }


        [HttpPost()] // POST /ProjectToDos + JSON Object
        public IActionResult NewProjectToDo([FromBody]ProjectTask projectTask) //Accepts JSON body, not x-www-form-urlencoded!
        {
            ReturnModel newProjectToDo = IProjectToDoRepository.NewProjectTask(projectTask);
            if (newProjectToDo.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(FindProjectToDo), new { toDoId = newProjectToDo.ReturnedId }, newProjectToDo.ReturnedId); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }

        [HttpPost("TOMs")] // POST /ProjectToDos/TOMs + JSON Object
        public IActionResult SaveAllTOMs([FromBody]TaskOrderModel[] TOMs, [FromQuery] long projectId) //Accepts JSON body, not x-www-form-urlencoded!
        {
            ReturnModel results = IProjectToDoRepository.SaveAllTOMs(TOMs, projectId);
            if (results.ErrorCode == ErrorCodes.OK)
            {
                return Ok(true);
            }
            return Ok(false);
        }


        [HttpPut("{taskId}")] // PUT ProjectToDos/3 + JSON Object
        public IActionResult UpdateProjectToDo([FromRoute]long taskId, [FromBody]ProjectTask projectToDo)
        {
            if (projectToDo == null || taskId != projectToDo.TaskId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = IProjectToDoRepository.UpdateProjectTask(projectToDo);
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
        [HttpDelete("{taskId}")] // DELETE ProjectToDos/1   You must own the project. or disable CORS
        public IActionResult RemoveProjectToDo(long taskId)
        {
            ProjectTask pTask = IProjectToDoRepository.RemoveProjectTask(taskId);
            if (pTask != null)
            {
                return Ok(pTask); // This is to inform our member.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
    }
}