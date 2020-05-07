// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.SignalR;
// using XYZToDo.Models.Abstract;
// using System.Threading.Tasks;
// using System;
// using XYZToDo.Infrastructure;
// using Microsoft.EntityFrameworkCore;
// using System.Linq;
// using XYZToDo.Models;
// using Microsoft.AspNetCore.Http;
// using Newtonsoft.Json;
// using System.Collections.Generic;

// namespace XYZToDo.Hubs
// {
//     [Authorize]
//     public class PrivateTalkNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionPrivateTalk).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionPrivateTalk.Add(new ConnectionPrivateTalk
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
//                 ConnectionPrivateTalk connection = db.ConnectionPrivateTalk.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }
//         //Note : Online and offline system will be implemented later. 
//         //https://docs.microsoft.com/en-us/aspnet/core/signalr/hubs?view=aspnetcore-2.2
//         //https://docs.microsoft.com/en-us/aspnet/signalr/overview/guide-to-the-api/mapping-users-to-connections

//         public async Task NotifyNewPrivateTalk(string privateTalk, string receivers, string teamReceivers)
//         {
//             try // async will help in perserving order or signals sent
//             {
//                 //await Groups.AddToGroupAsync("connectionId", "sevval.xyzeki.com");
//                 //await Clients.Group("sevval.xyzeki.com").SendAsync("metot","arg1");

//                 string thisUser = Context.User.Identity.Name;
//                 //receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]
//                 PrivateTalkReceiver[] rs = JsonConvert.DeserializeObject<List<PrivateTalkReceiver>>(receivers).ToArray();
//                 PrivateTalkTeamReceiver[] trs = JsonConvert.DeserializeObject<List<PrivateTalkTeamReceiver>>(teamReceivers).ToArray();

//                 using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     foreach (PrivateTalkReceiver item in rs)
//                     {
//                         Member member = db.Member.Include(u => u.ConnectionPrivateTalk).SingleOrDefault(u => u.Username == item.Receiver);
//                         if (member == null)
//                             continue; //return;

//                         if (member.ConnectionPrivateTalk?.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionPrivateTalk) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
//                                 }
//                                 catch (System.Exception)
//                                 {
//                                     throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                                 }
//                             }
//                         }

//                     }

//                     foreach (PrivateTalkTeamReceiver item in trs)
//                     {

//                         ConnectionPrivateTalk[] connections = db.TeamMember.Where(tm => tm.TeamId == item.TeamId && tm.Username != thisUser && tm.Status == true)?.Select(t => t.UsernameNavigation).Include(m => m.ConnectionPrivateTalk).SelectMany(m => m.ConnectionPrivateTalk).ToArray();


//                         if (connections == null)
//                             continue;

//                         if (connections.Count() > 0)
//                         {
//                             foreach (var connection in connections) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
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

//         public async Task NotifyDeletedPrivateTalk(string privateTalk, string receivers, string teamReceivers)
//         {
//             try // async will help in preserving the order of signals with await on invoke method on Angular front end app.
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 //receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]
//                 PrivateTalkReceiver[] rs = JsonConvert.DeserializeObject<List<PrivateTalkReceiver>>(receivers).ToArray();
//                 PrivateTalkTeamReceiver[] trs = JsonConvert.DeserializeObject<List<PrivateTalkTeamReceiver>>(teamReceivers).ToArray();

//                 using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     foreach (PrivateTalkReceiver item in rs)
//                     {
//                         Member member = db.Member.Include(u => u.ConnectionPrivateTalk).SingleOrDefault(u => u.Username == item.Receiver);
//                         if (member == null)
//                             continue;

//                         if (member.ConnectionPrivateTalk?.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionPrivateTalk) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
//                                 }
//                                 catch (System.Exception)
//                                 {
//                                     throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                                 }
//                             }
//                         }

//                     }

//                     foreach (PrivateTalkTeamReceiver item in trs)
//                     {

//                         ConnectionPrivateTalk[] connections = db.TeamMember.Where(tm => tm.TeamId == item.TeamId && tm.Username != thisUser && tm.Status == true)?.Select(t => t.UsernameNavigation).Include(m => m.ConnectionPrivateTalk).SelectMany(m => m.ConnectionPrivateTalk).ToArray();


//                         if (connections == null)
//                             continue;

//                         if (connections.Count() > 0)
//                         {
//                             foreach (var connection in connections) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
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

//         public void NotifyPrivateTalkLastSeen(long privateTalkId) // Send to here. (Sending functionality)
//         {
//             string member = Context.User.Identity.Name;

//             using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 PrivateTalkLastSeen PTLastSeen = context.PrivateTalkLastSeen.Where(ptl => ptl.PrivateTalkId == privateTalkId && ptl.Visitor == member).FirstOrDefault();
//                 if (PTLastSeen != null) //IF EXISTS
//                 {
//                     PTLastSeen.LastSeen = System.DateTimeOffset.Now;
//                     try
//                     {
//                         context.Entry(PTLastSeen).State = EntityState.Modified;
//                         context.SaveChanges();
//                     }
//                     catch { } // there is a problem in update operation.

//                 }
//                 else
//                 {
//                     //Runs only once.
//                     PrivateTalkLastSeen newPTLS = new PrivateTalkLastSeen { PrivateTalkId = privateTalkId, Visitor = member, LastSeen = System.DateTimeOffset.Now };
//                     try
//                     {
//                         context.PrivateTalkLastSeen.Add(newPTLS);
//                         context.SaveChanges();
//                     }
//                     catch { }
//                 }


//             }


//         }
//     }

// }