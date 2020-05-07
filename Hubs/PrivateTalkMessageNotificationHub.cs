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
//     public class PrivateTalkMessageNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionPrivateTalkMessage).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionPrivateTalkMessage.Add(new ConnectionPrivateTalkMessage
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
//                 ConnectionPrivateTalkMessage connection = db.ConnectionPrivateTalkMessage.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }
//         public async Task NotifyNewPrivateTalkMessage(string privateTalkMessage, bool isTypingSignal) // Send to here. (Sending functionality)
//         {

//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 PrivateTalkMessage ptm = JsonConvert.DeserializeObject<PrivateTalkMessage>(privateTalkMessage);
//                 if (ptm == null)
//                     return;
//                 using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     string sender = db.PrivateTalk.Where(pt => pt.PrivateTalkId == ptm.PrivateTalkId).Select(pt => pt.Sender).FirstOrDefault();
//                     string[] receivers = db.PrivateTalk.Where(pt => pt.PrivateTalkId == ptm.PrivateTalkId).SelectMany(t => t.PrivateTalkReceiver).Select(ptr => ptr.Receiver).ToArray();

//                     string[] teamReceivers = db.PrivateTalk.Where(pt => pt.PrivateTalkId == ptm.PrivateTalkId).SelectMany(t => t.PrivateTalkTeamReceiver).Select(pttr => pttr.Team).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(sender);
//                     all.AddRange(receivers);
//                     all.AddRange(teamReceivers);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = db.Member.Include(u => u.ConnectionPrivateTalkMessage).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionPrivateTalkMessage.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionPrivateTalkMessage) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewPrivateTalkMessageAvailable", privateTalkMessage, isTypingSignal);
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
//                     catch { }

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