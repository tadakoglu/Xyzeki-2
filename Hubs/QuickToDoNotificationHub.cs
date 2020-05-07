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
// using XYZToDo.Models.ViewModels;

// namespace XYZToDo.Hubs
// {
//     [Authorize]
//     public class QuickToDoNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionQuickToDo).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionQuickToDo.Add(new ConnectionQuickToDo
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
//                 ConnectionQuickToDo connection = db.ConnectionQuickToDo.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }
//         public async Task NotifyNewQuickToDo(string quickToDo, string to, string mode)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 QuickTask qTask = JsonConvert.DeserializeObject<QuickTask>(quickToDo);
//                 if (qTask == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     if (mode == "new") // ***sadece eklenen kişiye mesaj 
//                     {
//                         if (qTask.AssignedTo == thisUser) // dont sent to yourself.
//                             return;

//                         Member member = context.Member.Include(u => u.ConnectionQuickToDo).SingleOrDefault(u => u.Username == qTask.AssignedTo);
//                         if (member != null && member.ConnectionQuickToDo.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionQuickToDo) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewQuickToDoAvailable", quickToDo, to, mode);
//                                 }
//                                 catch (System.Exception)
//                                 {
//                                     throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                                 }
//                             }
//                         }
//                     }
//                     else if (mode == "update")
//                     {
//                         if (qTask.AssignedTo == qTask.Owner) // dont sent to yourself.
//                             return;

//                         Member member = context.Member.Include(u => u.ConnectionQuickToDo).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionQuickToDo.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionQuickToDo) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewQuickToDoAvailable", quickToDo, to, mode);
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
//         public async Task NotifyDeletedQuickToDo(string quickToDo, string to)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 // QuickTask qTask = JsonConvert.DeserializeObject<QuickTask>(quickToDo);
//                 // if (qTask == null)
//                 //     return;

//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     if (to == thisUser) // dont sent to yourself.
//                         return;

//                     Member member = context.Member.Include(u => u.ConnectionQuickToDo).SingleOrDefault(u => u.Username == to);
//                     if (member != null && member.ConnectionQuickToDo.Count > 0)
//                     {
//                         foreach (var connection in member.ConnectionQuickToDo) // tablets, phones, PC's etc..
//                         {
//                             try
//                             {
//                                 await Clients.Client(connection.ConnectionId).SendAsync("DeletedQuickToDoAvailable", quickToDo);
//                             }
//                             catch (System.Exception)
//                             {
//                                 throw new Exception("A problem occurred when sending a signal to a particular connection id");
//                             }
//                         }
//                     }

//                 }
//             }
//             catch { }
//         }

//         public async Task NotifyQuickToDoReOrdering(string TOMs)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 TaskOrderModel[] TOMsObject = JsonConvert.DeserializeObject<TaskOrderModel[]>(TOMs);
//                 if (TOMsObject == null)
//                     return;


//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     Dictionary<string, List<TaskOrderModel>> usernameTOMs = new Dictionary<string, List<TaskOrderModel>>();
//                     foreach (var TOM in TOMsObject) // bir kişinin tüm pomları tek seferde gönderilmeli. TaskID, Order
//                     {
//                         QuickTask qTask = context.QuickTask.Where(qt => qt.TaskId == TOM.TaskId).FirstOrDefault();
//                         if (qTask == null)
//                             continue;

//                         string assignedTo = qTask.AssignedTo;
//                         if (string.IsNullOrEmpty(assignedTo))
//                             continue;

//                         if (assignedTo == thisUser)
//                             continue;

//                         List<TaskOrderModel> TOMsList;
//                         if (!usernameTOMs.TryGetValue(assignedTo, out TOMsList))
//                         {
//                             TOMsList = new List<TaskOrderModel>();
//                             usernameTOMs.Add(assignedTo, TOMsList);
//                         }

//                         TOMsList.Add(TOM);
//                     }

//                     foreach (var to in usernameTOMs.Keys)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionQuickToDo).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionQuickToDo.Count > 0)
//                         {
//                             List<TaskOrderModel> toTOMs;
//                             if (usernameTOMs.TryGetValue(to, out toTOMs))
//                             {
//                                 foreach (var connection in member.ConnectionQuickToDo) // tablets, phones, PC's etc..
//                                 {
//                                     try
//                                     {
//                                         await Clients.Client(connection.ConnectionId).SendAsync("QuickToDoReOrderingAvailable", JsonConvert.SerializeObject(toTOMs.ToArray()));
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


//     }
// }