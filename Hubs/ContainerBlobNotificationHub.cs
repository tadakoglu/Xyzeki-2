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
//     public class ContainerBlobNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionContainerBlob).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionContainerBlob.Add(new ConnectionContainerBlob
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
//                 ConnectionContainerBlob connection = db.ConnectionContainerBlob.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }

//         //Avoid async void
//         public async Task NotifyNewContainerBlob(string containerBlob) // Send to here. (Sending functionality)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 CloudFile cBlob = JsonConvert.DeserializeObject<CloudFile>(containerBlob);
//                 if (cBlob == null)
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

//                         Member member = context.Member.Include(u => u.ConnectionContainerBlob).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionContainerBlob.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionContainerBlob) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewContainerBlobAvailable", containerBlob);
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

//         public async Task NotifyDeletedContainerBlob(string containerBlob)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 CloudFile cBlob = JsonConvert.DeserializeObject<CloudFile>(containerBlob);
//                 if (cBlob == null)
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

//                         Member member = context.Member.Include(u => u.ConnectionContainerBlob).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionContainerBlob.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionContainerBlob) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedContainerBlobAvailable", containerBlob);
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