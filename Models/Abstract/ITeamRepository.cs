using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface ITeamRepository
    {
        IQueryable<Team> Teams { get; } //Teams query api

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        Team[] MyTeams(string username); // Teams owned
        bool isMyTeamGuard(long teamId, string thisMember);

        Team[] TeamsJoined(string username);
        
        bool isTeamJoinedGuard(long teamId, string thisMember);
        
        Team[] TeamsPT(string username);
        Team GetTeam(long teamId);


        ReturnModel NewTeam(Team team); // Return -1 if error has occured, otherwise TeamId, Returns created team from database(It includes TeamID, autoset by identity)
        ReturnModel UpdateTeam(Team team);
        Team DeleteTeam(long teamId); //Return null if error has occurred, otherwise Team(deleted)




    }
}
