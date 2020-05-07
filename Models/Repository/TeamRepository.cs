using System;
using System.Linq;
using System.Threading.Tasks;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace XYZToDo.Models.Repository
{
    public class TeamRepository : ITeamRepository
    {
        XYZToDoSQLDbContext context;
        public TeamRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<Team> Teams => context.Team;
        public Team[] MyTeams(string username) // Returns null or objects
        {
            return Teams.Where(t => t.Owner == username)?.ToArray();
        }
        public bool isMyTeamGuard(long teamId,string thisMember)
        {
            Team team = Teams.Where(t => t.TeamId == teamId).FirstOrDefault();
            if(team==null)
            return false;
            if(team.Owner == thisMember)
            return true;
            else
            return false;
        }
        public Team[] TeamsJoined(string username) // Returns null or objects
        {
            return context.TeamMember.Where(tm => tm.Username == username && tm.Team.Owner != username)?.Select(tm => tm.Team)?.ToArray();
        }
        public bool isTeamJoinedGuard(long teamId,string thisMember)
        {  
            Team teamJoined = context.TeamMember.Where(tm => tm.Username == thisMember && tm.Status==true && tm.Team.Owner != thisMember)?.Select(tm => tm.Team).Where(t => t.TeamId == teamId).FirstOrDefault();
            if(teamJoined != null)
            return true;
            else
            return false;
        }
    
        public Team[] TeamsPT(string username) // kurumsal lisans sahibi en az bir takımında bulunmak zorunda.
        {
            IQueryable<Member> teamOwners = context.TeamMember.Where(tm => tm.Username == username && tm.Status == true)?.Select(tm => tm.Team.OwnerNavigation);

            Team[] allTeams = teamOwners.SelectMany(m => m.Team).ToLookup(t => t.TeamId).Select(t => t.First()).ToArray();
            return allTeams;
        }

        public Team GetTeam(long teamId) // Returns null or object
        {
            return context.Team.Where(t => t.TeamId == teamId).FirstOrDefault();
        }

        public ReturnModel NewTeam(Team team) // Return -1 for any errors otherwise TeamID
        {
            try
            {
                if (this.CanCreateNewTeam(team.Owner))
                {
                    context.Team.Add(team);
                    context.SaveChanges();
                }
                else
                {
                    return new ReturnModel { ErrorCode = ErrorCodes.Forbidden };
                }

            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = team.TeamId }; // Provides TeamId(identity autoset from db) 
        }
        public bool CanCreateNewTeam(string thisMember) // Eğer ben başka bir kişiye ait bir takımın üyesi isem takım oluşturamam.
        {
            int membershipCount = context.TeamMember.Where(tm => tm.Team.Owner != thisMember && tm.Username == thisMember && tm.Status == true).Count();
            if (membershipCount == 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public ReturnModel UpdateTeam(Team team) // Return -1 nad -3 for any errors otherwise 0
        {
            if (team.TeamId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                context.Entry(team).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }

        public Team DeleteTeam(long teamId) // Return null for any errors otherwise Team(deleted)
        {
            Team team = context.Team.Where(t => t.TeamId == teamId).FirstOrDefault(); //Or use Find()
            if (team != null)
            {
                context.Remove(team);
                context.SaveChanges();
            }
            return team;

        }
    }
}
