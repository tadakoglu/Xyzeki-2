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
    public class TeamsController : ControllerBase
    {
        ITeamRepository ITeamRepository;
        ITeamMemberRepository ITeamMemberRepository; // We need to add team owner to his/her team's team members
        public TeamsController(ITeamRepository iTeamRepository, ITeamMemberRepository iTeamMemberRepository)
        {
            this.ITeamRepository = iTeamRepository;
            this.ITeamMemberRepository = iTeamMemberRepository;
        }
        [HttpGet()] // GET /Teams
        [Authorize(Roles = "Manager")]
        public IActionResult Teams()
        {
            if (ITeamRepository.Teams != null)
            {
                return Ok(ITeamRepository.Teams); //new JsonResult(TeamRepository.Teams.ToList())
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }


        // This method is for members that are in same Team, to be able to view themselves. But a authentication policy is required here. #todo
        [HttpGet("{username}/Owns")] // GET Teams/tadakoglu/Owns    
        [Authorize(Roles = "Manager")]
        public IActionResult Teams(string username) //Accepts from route parameters not JSON.
        {
            Team[] myTeams = ITeamRepository.MyTeams(username);
            if (myTeams != null)
            {
                return Ok(myTeams); // 200 OK
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }
        [HttpGet("MyTeams")] // GET Teams/MyTeams        
        public IActionResult MyTeams()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Team[] myTeams = ITeamRepository.MyTeams(member);
            if (myTeams != null)
            {
                return Ok(myTeams); // 200 OK
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("Joined")] // GET Teams/Joined        
        public IActionResult TeamsJoined()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Team[] myTeams = ITeamRepository.TeamsJoined(member);
            if (myTeams != null)
            {
                return Ok(myTeams); // 200 OK
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("isMyTeam/{TeamId}")] // GET Teams/isMyTeam/2  
        public IActionResult isMyTeam(long TeamId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(ITeamRepository.isMyTeamGuard(TeamId, member));
        }
        [HttpGet("isTeamJoined/{TeamId}")] // GET Teams/isTeamJoined/1
        public IActionResult isTeamJoined(long TeamId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            return Ok(ITeamRepository.isTeamJoinedGuard(TeamId, member));
        }

        [HttpGet("{teamId}")] // GET Teams/2
        public IActionResult FindTeam(long teamId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            Team team = ITeamRepository.GetTeam(teamId);
            if (team != null)
            {
                return Ok(team);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        //sahip olduğum ve takım üyesi olduğum takımın kurucularının tüm takımları.
        [HttpGet("AllTeamsPT")] // GET Teams/AllTeamsPT        
        public IActionResult AllTeamsPT()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Team[] allTeamsPT = ITeamRepository.TeamsPT(member);
            if (allTeamsPT != null)
            {
                return Ok(allTeamsPT); // 200 OK
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpPost()] // POST /Teams + JSON Object
        public IActionResult NewTeam([FromBody]Team team) //Accepts JSON body, not x-www-form-urlencoded!
        {
            team.Owner = User.Identity.Name; // enforcing api security
            ReturnModel newTeam = ITeamRepository.NewTeam(team);
            if (newTeam.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(nameof(FindTeam), new { teamId = newTeam.ReturnedId }, newTeam.ReturnedId); // 201 Created
            }
            else if (newTeam.ErrorCode == ErrorCodes.Forbidden)
            {
                return Forbid();
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }

        [HttpPut("{TeamId}")] // PUT Teams/3 + JSON Object
        public IActionResult UpdateTeam([FromRoute]long TeamId, [FromBody]Team team)
        {
            if (team == null || TeamId != team.TeamId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = ITeamRepository.UpdateTeam(team);
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
        [HttpDelete("{TeamId}")] // DELETE Teams/1
        public IActionResult DeleteTeam([FromRoute]long teamId) //[FromRoute] is optional, it already accepts from route parameters not JSON.
        {
            Team team = ITeamRepository.DeleteTeam(teamId);
            if (team != null)
            {
                return Ok(team); // or use No Content without arguments returned.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     

        }
    }
}
