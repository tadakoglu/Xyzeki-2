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
    public class TeamMembersController : ControllerBase
    {
        ITeamMemberRepository ITeamMemberRepository;
        public TeamMembersController(ITeamMemberRepository TeamMemberRepository)
        {
            this.ITeamMemberRepository = TeamMemberRepository;
        }
        [HttpGet()] // GET /TeamMembers
        [Authorize(Roles = "Manager")]
        public IActionResult TeamMembers()
        {
            if (ITeamMemberRepository.TeamMembers != null)
            {
                return Ok(ITeamMemberRepository.TeamMembers);
            }
            return NoContent(); // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("Team/{teamId}")] // GET TeamMembers/Team/2
        public IActionResult GetTeamMembers(long teamId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            TeamMember[] teamMembers = ITeamMemberRepository.GetTeamMembers(teamId);
            if (teamMembers != null)
            {
                return Ok(teamMembers);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
        [HttpGet("Joined")] // GET TeamMembers/Joined    
        public IActionResult GetTeamMembersJoined()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            TeamMember[] teamMembersIAmIn = ITeamMemberRepository.GetTeamMembers(member.ToString());
            if (teamMembersIAmIn != null)
            {
                return Ok(teamMembersIAmIn);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("Owned")] // GET TeamMembers/Owned    
        public IActionResult GetTeamMembersOwned()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            TeamMember[] teamMembersOwned = ITeamMemberRepository.GetMyTeamsMembers(member.ToString());
            if (teamMembersOwned != null)
            {
                return Ok(teamMembersOwned);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }
        [HttpGet("Owned/AsMembers")] // GET TeamMembers/Owned/AsMembers
        public IActionResult GetTMOwnedAsMembers()
        {
            var owner = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Member[] membersOwned = ITeamMemberRepository.GetMyTMsAsMembers(owner.ToString());
            if (membersOwned != null)
            {
                return Ok(membersOwned);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }
        [HttpGet("Joined/AsMembers")] // GET TeamMembers/Joined/AsMembers  
        public IActionResult GetTMsAsMembersJoined()
        {
            var username = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Member[] teamMembersIAmIn = ITeamMemberRepository.GetTMsAsMembersJoined(username.ToString());
            if (teamMembersIAmIn != null)
            {
                return Ok(teamMembersIAmIn);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("AllTeamMembersPT")] // GET TeamMembers/AllTeamMembersPT
        public IActionResult GetAllTeamMembersPT()
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            TeamMember[] allTeamMembersPT = ITeamMemberRepository.TeamMembersPT(member.ToString());
            if (allTeamMembersPT != null)
            {
                return Ok(allTeamMembersPT);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("AllTeamMembersPTAsMembers")] // GET TeamMembers/AllTeamMembersPTAsMembers
        public IActionResult GetAllTeamMembersPTAsMembers()
        {
            var username = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            Member[] allTeamMembersPTAsMembers = ITeamMemberRepository.TeamMembersPTAsMembers(username.ToString());
            if (allTeamMembersPTAsMembers != null)
            {
                return Ok(allTeamMembersPTAsMembers);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpPost()] // POST /TeamMembers + JSON Object
        public IActionResult NewTeamMember([FromBody]TeamMember teamMember) //Accepts JSON body, not x-www-form-urlencoded!
        {
            var username = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (username != null && username == teamMember.Username)//adding herself/himself
                teamMember.Status = true;
            ReturnModel newTeamMember = ITeamMemberRepository.AddTeamMember(teamMember, username);
            if (newTeamMember.ErrorCode == ErrorCodes.OK)
            {
                if (newTeamMember.ErrorCode == ErrorCodes.OK)
                    return Ok(newTeamMember.ReturnedId); //teamMemberId
            }
            else if (newTeamMember.ErrorCode == ErrorCodes.Forbidden)
            {
                return Forbid();
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }
        [HttpPut("{teamMemberId}")] // PUT TeamMembers/3 + JSON Object
        public IActionResult UpdateTeamMember(long teamMemberId, [FromBody]TeamMember teamMember)
        {
            if (teamMember == null || teamMemberId == 0 || teamMemberId != teamMember.TeamMemberId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = ITeamMemberRepository.UpdateTeamMember(teamMember, User.Identity.Name); //Only allows to change "Status"
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return NoContent(); //204 No Content
            }
            else if (r.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return BadRequest();
            }
            else if (r.ErrorCode == ErrorCodes.Forbidden)
            {
                return Forbid();
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }


        [HttpDelete("{teamMemberId}")] // DELETE /TeamMembers/1
        public IActionResult DeleteTeamMember([FromRoute]long teamMemberId)
        {
            var username = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT

            TeamMember r = ITeamMemberRepository.DeleteTeamMember(teamMemberId, username);
            if (r != null)
            {
                return Ok(r); // 204 No Content
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

    }
}
