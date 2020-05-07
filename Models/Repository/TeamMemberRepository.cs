using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class TeamMemberRepository : ITeamMemberRepository
    {
        XYZToDoSQLDbContext context;
        public TeamMemberRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<TeamMember> TeamMembers => context.TeamMember;


        // NOTE: burası status true olmayanları da mutlaka içermeli sinyal altyapısı ona göre hazırlandı.
        public TeamMember[] GetTeamMembers(long teamId)  // Returns null or objects
        {
            return TeamMembers.Where(tm => tm.TeamId == teamId)?.ToArray();
        }
        public TeamMember[] GetTeamMembers(string username) // Returns null or objects
        {
            //Kendi takımlarımı katıldığım takımlarda gösterme
            //Kendi takımlarımıdaki takım üyeliğimi gelen davetiyelerim repolarına gönderme
            return context.TeamMember.Where(tm => tm.Username == username && tm.Team.Owner != username)?.ToArray();

        }
        public TeamMember[] GetMyTeamsMembers(string owner) // Returns null or objects, assign autocomplete
        {
            return context.TeamMember.Where(t => t.Team.Owner == owner).ToArray();
        }
        public string[] GetMyTeamsMembersForSignalR(string owner) // Returns null or objects
        {
            return context.TeamMember.Where(t => t.Team.Owner == owner && t.Status == true && t.Username != owner).Select(tm => tm.Username).ToArray();
        }

        //for profile data.
        public Member[] GetMyTMsAsMembers(string owner) // Returns null or objects
        {
            return context.TeamMember.Where(t => t.Team.Owner == owner && t.Username != owner).Select(tm => tm.UsernameNavigation).GroupBy(m => m.Username).Select(m => m.First()).ToArray();
        }

        // that is ALL-COMPANY EXCEPT ME.
        public Member[] GetTMsAsMembersJoined(string username) // Returns null or objects
        {
            // katıldığım takımların sahiplerinin tüm takımlarındaki kişileri getir.
            //burası katıldığım tüm takımlardakini hesaplıyor(katılmadığın takımlar var), tüm şirket olarak hesapla.
            IQueryable<Member> teamOwners = context.TeamMember.Where(tm => tm.Username == username && tm.Team.Owner != username)?.Select(tm => tm.Team.OwnerNavigation);

            Member[] allEmployees = teamOwners.SelectMany(m => m.Team).SelectMany(t => t.TeamMember).Where(tm => tm.Username != username).Select(t => t.UsernameNavigation).ToArray();
            return allEmployees;
        }


        //  public Member[] GetAllAsMembersJoined(string username) // Returns null or objects
        // {  
        //     // katıldığım takımların sahiplerinin tüm takımlarındaki kişileri getir.
        //     //burası katıldığım tüm takımlardakini hesaplıyor(katılmadığın takımlar var), tüm şirket olarak hesapla.
        //     IQueryable<Member> teamOwners = context.TeamMember.Where(tm => tm.Username == username && tm.Team.Owner!=username)?.Select(tm => tm.Team.OwnerNavigation);

        //     Member[] allEmployees = teamOwners.SelectMany(m=> m.Team).SelectMany(t => t.TeamMember).Where(tm => tm.Username!=username).Select(t => t.UsernameNavigation).ToArray();
        //     return allEmployees;
        // }

        public TeamMember[] TeamMembersPT(string username)
        { // assign autocomplete pt
            IQueryable<Member> teamOwners = context.TeamMember.Where(tm => tm.Username == username)?.Select(tm => tm.Team.OwnerNavigation);

            TeamMember[] allTeamMembers = teamOwners.SelectMany(m => m.Team).SelectMany(m => m.TeamMember).ToLookup(tm => tm.TeamMemberId).Select(tm => tm.First()).ToArray();
            return allTeamMembers;
        }

        public Member[] TeamMembersPTAsMembers(string username)
        {
            IQueryable<Member> teamOwners = context.TeamMember.Where(tm => tm.Username == username)?.Select(tm => tm.Team.OwnerNavigation);

            Member[] allTeamMembersAsMembers = teamOwners.SelectMany(m => m.Team).SelectMany(m => m.TeamMember).Select(tm => tm.UsernameNavigation).ToArray();
            return allTeamMembersAsMembers;
        }
        public bool CanSendMoreTeamMemberRequest(string thisMember)
        {
            //lisanstaki kişi sayısı(maxi team member capasity)
            MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisMember && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();
            if (myLicense == null)
                return false;

            int maximumEmployees = myLicense.NumberOfEmployees;

            //team members count in all teams.   //for unique, GroupBy(ptr => ptr.PrivateTalkId).Select(group => group.First())
            int allUniqueTeamMembersRequests = context.Team.Where(t => t.Owner == thisMember).SelectMany(m => m.TeamMember).Select(tm => tm.Username).GroupBy(username => username).Select(group => group.First()).Count();

            if (allUniqueTeamMembersRequests < maximumEmployees) // if still can add team member, return true,
                return true;
            else
                return false;

        }
        public ReturnModel AddTeamMember(TeamMember teamMember, string thisMember) // Return -1 for any errors otherwise 0
        {
            try
            {
                if (this.CanSendMoreTeamMemberRequest(thisMember))
                {
                    context.TeamMember.Add(teamMember);
                    context.SaveChanges();
                    return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = teamMember.TeamMemberId };
                }
                else
                {
                    return new ReturnModel { ErrorCode = ErrorCodes.Forbidden };
                }


            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
        }
        // burayı refactore et.
        public ReturnModel UpdateTeamMember(TeamMember teamMember, string username)
        {
            TeamMember tMember = context.TeamMember.Include(tm => tm.Team).Where(tm => tm.TeamMemberId == teamMember.TeamMemberId).FirstOrDefault();

            if (tMember == null)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                tMember.Status = teamMember.Status;
                if (this.CanUpdateTeamMember(tMember, username))
                {
                    context.Entry(tMember).State = EntityState.Modified;
                    context.SaveChanges();
                    return new ReturnModel { ErrorCode = ErrorCodes.OK };
                }
                else
                {
                    return new ReturnModel { ErrorCode = ErrorCodes.Forbidden };
                }

            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
        }
        public bool CanUpdateTeamMember(TeamMember teamMember, string thisMember)
        {
            try
            {
                // iki ihtimal var

                // #1) güncellediğim takım üyesinin takım sahibi ben isem
                // izin ver

                bool condition1 = context.Team.Where(t => t.TeamId == teamMember.TeamId).FirstOrDefault().Owner == thisMember;
                if (condition1)
                    return true;

                // #2) güncellediğim takım üyesinin takım sahibi ben değil isem.
                // cevap ret ve bekliyor(true değil ise) ise izin ver
                // cevap kabul et ise kabul edecek olan kişi(ben)nin kendi takımı yok ise ve de varsa şu an da bulunduğu takımdan farklı birinin takımında bulunmuyorsa izin ver.

                if (teamMember.Status != true)
                    return true;
                else // cevap kabul et ise.
                {
                    Team isTeamOwner = context.Team.Where(t => t.Owner == thisMember).FirstOrDefault();

                    // şu an bulunduğu takım
                    Team now = context.TeamMember.Where(tm => tm.Username == thisMember && tm.Status == true && tm.Team.Owner != thisMember).Select(tm => tm.Team).FirstOrDefault();

                    if (now == null) // birinin takımında yok ise
                    {
                        if (isTeamOwner == null)
                            return true;
                    }
                    else //  birinin takımında var ise
                    {
                        if (teamMember.Team.Owner == now.Owner && isTeamOwner == null)
                        { // bulunduğu takımın sahibi eklenmek istediği takım sahibi ile aynı ise ve takım sahibi değilsem.
                            return true;
                        }


                    }



                }
                return false;

            }
            catch
            {

                return false;
            }


        }
        public TeamMember DeleteTeamMember(long teamMemberId, string thisMember)
        {
            TeamMember tMember = context.TeamMember.Include(tm => tm.Team).Where(tm => tm.TeamMemberId == teamMemberId).FirstOrDefault();
            if (tMember != null)
            {
                this.RemoveMemberFromOtherFeatures(tMember);
                context.TeamMember.Remove(tMember);
                context.SaveChanges();
            }
            return tMember;
        }

        // Bir kişinin organizasyondan/şirketten çıkarılması sonucu ilgili proje, iş konuşması vb. kayıtların yeniden düzenlenmesi  
        void RemoveMemberFromOtherFeatures(TeamMember tMember)
        {
            try
            {
                // silinen takım üyesi takımın sahibi mi?
                if (tMember.Team.Owner == tMember.Username)
                {
                    return; // Hiçbir şey yapma.
                }

                //kişi silindiği takımın sahibinin başka bir takımında yer alıyor mu?
                TeamMember inOtherTeams = context.Team.Where(t => t.Owner == tMember.Team.Owner && t.TeamId != tMember.TeamId).
                SelectMany(t => t.TeamMember).Where(tm => tm.Username == tMember.Username && tm.Status == true).FirstOrDefault();
                if (inOtherTeams != null)
                {
                    return; // Hiçbir şey yapma.
                }

                // burada tüm kayıtları gerekli sırada sil veya yeniden düzenle.
                foreach (var p in context.Set<QuickTaskComment>().Where(qtc => qtc.Task.Owner != tMember.Username && qtc.Sender == tMember.Username))
                {
                    p.Sender = null;
                    context.Entry(p).State = EntityState.Modified;
                }
                foreach (var p in context.Set<QuickTask>().Where(qt => qt.Owner != tMember.Username && qt.AssignedTo == tMember.Username))
                {
                    p.AssignedTo = null;
                    p.Completedby = null;
                    context.Entry(p).State = EntityState.Modified;
                }

                foreach (var p in context.Set<ProjectTaskComment>().Where(ptc => ptc.Task.Project.Owner != tMember.Username && ptc.Sender == tMember.Username))
                {
                    p.Sender = null;
                    context.Entry(p).State = EntityState.Modified;
                }
                foreach (var p in context.Set<ProjectTask>().Where(pt => pt.Project.Owner != tMember.Username && pt.AssignedTo == tMember.Username))
                {
                    p.AssignedTo = null;
                    context.Entry(p).State = EntityState.Modified;
                }
                foreach (var p in context.Set<Project>().Where(p => p.Owner != tMember.Username && p.ProjectManager == tMember.Username))
                {
                    p.ProjectManager = null;
                    context.Entry(p).State = EntityState.Modified;
                }




                foreach (var p in context.Set<PrivateTalkReceiver>().Where(ptr => ptr.PrivateTalk.Owner != tMember.Username && ptr.Receiver == tMember.Username))
                {
                    context.Entry(p).State = EntityState.Deleted;
                }
                foreach (var p in context.Set<PrivateTalkLastSeen>().Where(ptls => ptls.PrivateTalk.Owner != tMember.Username && ptls.Visitor == tMember.Username))
                {
                    context.Entry(p).State = EntityState.Deleted;
                }
                foreach (var p in context.Set<PrivateTalkMessage>().Where(ptm => ptm.PrivateTalk.Owner != tMember.Username && ptm.Sender == tMember.Username))
                {
                    p.Sender = null;
                    context.Entry(p).State = EntityState.Modified;
                }
                foreach (var p in context.Set<PrivateTalk>().Where(pt => pt.Owner != tMember.Username && pt.Sender == tMember.Username))
                {
                    p.Sender = null;
                    context.Entry(p).State = EntityState.Modified;
                }

            }
            catch
            {
                return;
            }
        }


    }
}
