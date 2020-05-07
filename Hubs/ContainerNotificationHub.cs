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
// using XYZToDo.Models.AzureModels;

// namespace XYZToDo.Hubs
// {
//     [Authorize]
//     public class ContainerNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionContainer).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionContainer.Add(new ConnectionContainer
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
//                 ConnectionContainer connection = db.ConnectionContainer.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }

//         public async Task NotifyNewContainer(string container) // Send to here. (Sending functionality)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 CloudContainer cContainer = JsonConvert.DeserializeObject<CloudContainer>(container);
//                 if (cContainer == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     List<string> all = new List<string>();


//                     // access members license
//                     MemberLicense validLic = null;

//                     MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisUser && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

//                     MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true && tm.Team.Owner != thisUser).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

//                     if (licenseJoined != null)
//                         validLic = licenseJoined;
//                     else if (myLicense != null)
//                         validLic = myLicense;

//                     if (validLic == null)
//                         return;

//                     string[] receivers = context.Team.Where(t => t.Owner == validLic.Username).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

//                     all.AddRange(receivers);


//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionContainer).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionContainer.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionContainer) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewContainerAvailable", container);
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

//         public async Task NotifyDeletedContainer(string container)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 CloudContainer cContainer = JsonConvert.DeserializeObject<CloudContainer>(container);
//                 if (cContainer == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     List<string> all = new List<string>();


//                     // access members license
//                     MemberLicense validLic = null;

//                     MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisUser && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

//                     MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true && tm.Team.Owner != thisUser).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

//                     if (licenseJoined != null)
//                         validLic = licenseJoined;
//                     else if (myLicense != null)
//                         validLic = myLicense;

//                     if (validLic == null)
//                         return;

//                     string[] receivers = context.Team.Where(t => t.Owner == validLic.Username).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

//                     all.AddRange(receivers);


//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionContainer).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionContainer.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionContainer) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedContainerAvailable", container);
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