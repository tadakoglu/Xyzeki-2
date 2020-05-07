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
//     public class CommentNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionComment).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionComment.Add(new ConnectionComment
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
//                 ConnectionComment connection = db.ConnectionComment.Find(Context.ConnectionId);
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
//         //mode='new' or 'update', that is for comments numbers service, it won't increase the number of comments when update operation happened.
//         public async Task NotifyNewQuickToDoComment(string comment, string mode) // Send to here. (Sending functionality)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 QuickTaskComment qTaskComment = JsonConvert.DeserializeObject<QuickTaskComment>(comment);
//                 if (qTaskComment == null)
//                     return;
//                 // to assignedTo and to owner
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     string owner = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.Owner).FirstOrDefault();
//                     string assignedTo = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.AssignedTo).FirstOrDefault();

//                     List<string> all = new List<string>();
//                     all.Add(owner);
//                     all.Add(assignedTo);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique) // That will also send a message to this user.
//                     {
//                         Member member = context.Member.Include(u => u.ConnectionComment).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionComment.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionComment) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewQuickToDoCommentAvailable", comment, mode);
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
//         public async Task NotifyDeletedQuickToDoComment(string comment)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 QuickTaskComment qTaskComment = JsonConvert.DeserializeObject<QuickTaskComment>(comment);
//                 if (qTaskComment == null)
//                     return;
//                 // to assignedTo and to owner including himself/herself
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     string owner = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.Owner).FirstOrDefault();
//                     string assignedTo = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.AssignedTo).FirstOrDefault();

//                     List<string> all = new List<string>();
//                     all.Add(owner);
//                     all.Add(assignedTo);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique) // That will also send a message to this user.
//                     {
//                         Member member = context.Member.Include(u => u.ConnectionComment).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionComment.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionComment) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedQuickToDoCommentAvailable", comment);
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

//         public async Task NotifyNewProjectToDoComment(string comment, string mode) // Send to here. (Sending functionality)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 ProjectTaskComment pTaskComment = JsonConvert.DeserializeObject<ProjectTaskComment>(comment);
//                 if (pTaskComment == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     //1) to project manager
//                     string projectManager = context.ProjectTask.Where(pt => pt.TaskId == pTaskComment.TaskId).Select(pt => pt.Project).Select(p => p.ProjectManager).FirstOrDefault();

//                     //2)to project owner
//                     string owner = context.ProjectTask.Where(pt => pt.TaskId == pTaskComment.TaskId).Select(pt => pt.Project).Select(p => p.Owner).FirstOrDefault();

//                     //3)to project shareholders
//                     string[] shareholders = context.ProjectTask.Where(pt => pt.TaskId == pTaskComment.TaskId).Select(pt => pt.Project).SelectMany(pt => pt.ProjectTask).Select(pt => pt.AssignedTo).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(projectManager);
//                     all.Add(owner);
//                     all.AddRange(shareholders);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         Member member = context.Member.Include(u => u.ConnectionComment).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionComment.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionComment) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewProjectToDoCommentAvailable", comment, mode);

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
//         public async Task NotifyDeletedProjectToDoComment(string comment)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 ProjectTaskComment pTaskComment = JsonConvert.DeserializeObject<ProjectTaskComment>(comment);
//                 if (pTaskComment == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     //1) to project manager
//                     string projectManager = context.Project.Where(p => p.ProjectId == pTaskComment.TaskId).Select(p => p.ProjectManager).FirstOrDefault();

//                     //2)to project owner
//                     string owner = context.Project.Where(p => p.ProjectId == pTaskComment.TaskId).Select(p => p.Owner).FirstOrDefault();

//                     //3)to project shareholders
//                     string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == pTaskComment.TaskId).Select(p => p.AssignedTo).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(projectManager);
//                     all.Add(owner);
//                     all.AddRange(shareholders);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         Member member = context.Member.Include(u => u.ConnectionComment).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionComment.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionComment) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedProjectToDoCommentAvailable", comment);
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