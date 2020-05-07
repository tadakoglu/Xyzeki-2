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
    public class ProjectsController : ControllerBase
    {
        IProjectRepository IProjectRepository;
        public ProjectsController(IProjectRepository iProjectRepository)
        {
            this.IProjectRepository = iProjectRepository;
        }
        [HttpGet()] // GET /Projects
        [Authorize(Roles = "Manager")]
        public IActionResult Projects() //For queries.
        {
            if (IProjectRepository.Projects != null)
            {
                return Ok(IProjectRepository.Projects);
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        // This method is for members that are in same Team, to be able to view themselves projects(if it's not a private project). But a authentication policy is required here. #todo        
        [HttpGet("{username}/Owns")]  // GET /Projects/tadakoglu/Owns
        [Authorize(Roles = "Manager")]
        public IActionResult Projects(string username)
        {
            Project[] projects = IProjectRepository.GetProjects(username);
            if (projects != null)
            {
                return Ok(projects); // 200 OK
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }
        [HttpGet("MyProjects")]  // GET /Projects/MyProjects
        public IActionResult MyProjects()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Project[] projects = IProjectRepository.GetProjects(member);
            if (projects != null)
            {
                return Ok(projects); // 200 OK
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("{projectId}/isShareholder")] // GET Projects/5343/isShareholder // Am I Shareholder ?? 
        public IActionResult isShareholder(long projectId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(IProjectRepository.isShareholder(projectId, member));
        }

        [HttpGet("isMyProject/{ProjectId}")] // GET Projects/isMyProject/2  
        public IActionResult isMyProject(long ProjectId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(IProjectRepository.isMyProjectGuard(ProjectId, member));
        }
        [HttpGet("isProjectAssigned/{ProjectId}")] // GET Projects/isProjectAssigned/2    // GET Projects/isMyProject/2  
        public IActionResult isProjectAssigned(long ProjectId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(IProjectRepository.isProjectAssignedGuard(ProjectId, member));
        }

        [HttpGet("MyProjects/Assigned")]  // GET /Projects/MyProjects/Assigned
        public IActionResult MyProjectsAssigned()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Project[] projects = IProjectRepository.GetProjectsAssigned(member);
            if (projects != null)
            {
                return Ok(projects); // 200 OK
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("{projectId}")] // GET Projects/2
        public IActionResult FindProject(long projectId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            Project project = IProjectRepository.FindProject(projectId);
            if (project != null)
            {
                return Ok(project);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost("POMs")] // POST /Projects/POMs + JSON Object
        public IActionResult SaveAllPOMs([FromBody]ProjectOrderModel[] POMs) //Accepts JSON body, not x-www-form-urlencoded!
        {
            ReturnModel result = IProjectRepository.SaveAllPOMs(POMs);
            if (result.ErrorCode == ErrorCodes.OK)
            {
                return Ok(true);
            }
            return Ok(false);

        }

        [HttpPost()] // POST /Projects + JSON Object
        public IActionResult NewProject([FromBody]Project project) //Accepts JSON body, not x-www-form-urlencoded!
        {
            ReturnModel newProject = IProjectRepository.NewProject(project);
            if (newProject.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(FindProject), new { projectId = newProject.ReturnedId }, newProject.ReturnedId); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }
        [HttpPut("{ProjectId}")] // PUT Projects/3 + JSON Object
        public IActionResult UpdateProject([FromRoute]long ProjectId, [FromBody]Project project)
        {
            if (project == null || ProjectId != project.ProjectId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = IProjectRepository.UpdateProject(project);
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
        [HttpDelete("{projectId}")] // DELETE Projects/1
        public IActionResult DeleteProject([FromRoute]long projectId) //[FromRoute] is optional, it already accepts from route parameters but don't accepts JSON.
        {
            Project project = IProjectRepository.DeleteProject(projectId);
            if (project != null)
            {
                return Ok(project); // or use No Content without arguments returned.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     

        }
    }
}
