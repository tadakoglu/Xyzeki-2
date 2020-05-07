using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface ITeamMemberRepository
    {
        IQueryable<TeamMember> TeamMembers { get; } // TeamMembers query api

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        TeamMember[] GetTeamMembers(long teamId);
        TeamMember[] GetTeamMembers(string usernameJoined); // Returns null or objects
        TeamMember[] GetMyTeamsMembers(string owner); // Returns null or objects
        string[] GetMyTeamsMembersForSignalR(string owner);
        Member[] GetMyTMsAsMembers(string owner); // Returns null or objects
        Member[] GetTMsAsMembersJoined(string username); // Returns null or objects


        TeamMember[] TeamMembersPT(string username);
        Member[] TeamMembersPTAsMembers(string username);

        ReturnModel AddTeamMember(TeamMember teamMember, string thisMember); // Return -1 if error has occured, otherwise 0(OK),
        ReturnModel UpdateTeamMember(TeamMember teamMember,string username);
        TeamMember DeleteTeamMember(long teamMemberId,string username);


    }
}
