// using System;
// using System.Linq;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.SignalR;
// using Microsoft.EntityFrameworkCore;
// using XYZToDo.Models;
// using XYZToDo.Models.Abstract;
// using XYZToDo.Infrastructure;
// using Microsoft.AspNetCore.Http;
// using Newtonsoft.Json;
// using System.Collections.Generic;

// namespace XYZToDo.Hubs
// {
//     [Authorize]
//     public class TeamMemberNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionTeamMember).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionTeamMember.Add(new ConnectionTeamMember
//                 {
//                     ConnectionId = Context.ConnectionId,
//                     UserAgent = Context.GetHttpContext().Request.Headers["User-Agent"],
//                     Connected = true
//                 });

//                 db.SaveChanges();

//             }
//             await base.OnConnectedAsync();
//         }

//         public override async Task OnDisconnectedAsync(Exception exception)
//         {
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 ConnectionTeamMember connection = db.ConnectionTeamMember.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }


//         public async Task NotifyNewTeamMember(string teamMember, string mode)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 TeamMember tMember = JsonConvert.DeserializeObject<TeamMember>(teamMember);
//                 if (tMember == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     if (mode == "new") // ***sadece eklenen kişiye mesaj 
//                     {
//                         if (tMember.Username == thisUser) // dont sent to yourself.
//                             return;

//                         Member member = context.Member.Include(u => u.ConnectionTeamMember).SingleOrDefault(u => u.Username == tMember.Username);
//                         if (member != null && member.ConnectionTeamMember.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionTeamMember) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewTeamMemberAvailable", teamMember, mode);
//                                 }
//                                 catch (System.Exception)
//                                 {
//                                     throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                                 }
//                             }
//                         }
//                     }
//                     else if (mode == "update") // ***takım sahibi, takım arkadaşlarına, ve eklenen kişiye mesaj gönder.
//                     {
//                         // if (tMember.Username == thisUser) // dont sent to yourself.
//                         //     return;
//                         //1) to team owner(for accept/reject)
//                         string teamOwner = context.TeamMember.Where(TM => TM.TeamMemberId == tMember.TeamMemberId).Select(t => t.Team.Owner).FirstOrDefault();

//                         //2)to added person(for owner resent invitation)
//                         string added = tMember.Username;

//                         //3)to team friends(in invitations)

//                         string[] friends = context.Team.Where(t => t.TeamId == tMember.TeamId).SelectMany(t => t.TeamMember).Select(tm => tm.Username).ToArray();

//                         List<string> all = new List<string>();
//                         all.Add(teamOwner);
//                         all.Add(added);
//                         all.AddRange(friends);

//                         string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                         foreach (var to in allUnique)
//                         {
//                             if (to == thisUser) // dont sent to yourself.
//                                 continue;

//                             Member member = context.Member.Include(u => u.ConnectionTeamMember).SingleOrDefault(u => u.Username == to);
//                             if (member != null && member.ConnectionTeamMember.Count > 0)
//                             {
//                                 foreach (var connection in member.ConnectionTeamMember) // tablets, phones, PC's etc..
//                                 {
//                                     try
//                                     {
//                                         await Clients.Client(connection.ConnectionId).SendAsync("NewTeamMemberAvailable", teamMember, mode);
//                                     }
//                                     catch (System.Exception)
//                                     {
//                                         throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                                     }
//                                 }
//                             }

//                         }
//                     }
//                 }
//             }
//             catch { }

//         }
//         public async Task NotifyDeletedTeamMember(string teamMember)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 TeamMember tMember = JsonConvert.DeserializeObject<TeamMember>(teamMember);
//                 if (tMember == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     //***takım sahibi(ayrılan kişi), takım arkadaşlarına(ayrılan kişi ve takım sahibi), ve eklenen kişiye(takım sahibi gönderir) mesaj gönder.

//                     //1) to team owner(for accept/reject)
//                     string teamOwner = context.TeamMember.Where(TM => TM.TeamMemberId == tMember.TeamMemberId).Select(t => t.Team.Owner).FirstOrDefault();

//                     //2)to added person(for owner resent invitation)
//                     string added = tMember.Username;

//                     //3)to team friends(in invitations)

//                     string[] friends = context.Team.Where(t => t.TeamId == tMember.TeamId).SelectMany(t => t.TeamMember).Select(tm => tm.Username).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(teamOwner);
//                     all.Add(added);
//                     all.AddRange(friends);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionTeamMember).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionTeamMember.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionTeamMember) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedTeamMemberAvailable", teamMember);
//                                 }
//                                 catch (System.Exception)
//                                 {
//                                     throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//             catch { }
//         }


//     }
// }

