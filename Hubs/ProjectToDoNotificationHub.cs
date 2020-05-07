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
//     public class ProjectToDoNotificationHub : Hub
//     {

//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionProjectToDo).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionProjectToDo.Add(new ConnectionProjectToDo
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
//                 ConnectionProjectToDo connection = db.ConnectionProjectToDo.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }
//         public async Task NotifyNewProjectToDo(string projectToDo) // to owner, to manager, to other project shareholders
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 ProjectTask pTask = JsonConvert.DeserializeObject<ProjectTask>(projectToDo);
//                 if (pTask == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     //1) to project manager
//                     string projectManager = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.ProjectManager).FirstOrDefault();

//                     //2)to project owner
//                     string owner = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.Owner).FirstOrDefault();

//                     //3)to project shareholders
//                     string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.AssignedTo).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(projectManager);
//                     all.Add(owner);
//                     all.AddRange(shareholders);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionProjectToDo).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionProjectToDo.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionProjectToDo) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewProjectToDoAvailable", projectToDo);
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
//         public async Task NotifyDeletedProjectToDo(string projectToDo) // to owner, to manager, to other project shareholders
//         {

//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 ProjectTask pTask = JsonConvert.DeserializeObject<ProjectTask>(projectToDo);
//                 if (pTask == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     //1) to project manager
//                     string projectManager = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.ProjectManager).FirstOrDefault();

//                     //2)to project owner
//                     string owner = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.Owner).FirstOrDefault();

//                     //3)to project shareholders
//                     string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.AssignedTo).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(projectManager);
//                     all.Add(owner);
//                     all.AddRange(shareholders);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionProjectToDo).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionProjectToDo.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionProjectToDo) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedProjectToDoAvailable", projectToDo);
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

//         public async Task NotifyProjectToDoReOrdering(string TOMs, long projectId) // to owner, to manager, to other project shareholders
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 //long pTaskId = long.Parse(projectId);
//                 TaskOrderModel[] TOMsObject = JsonConvert.DeserializeObject<TaskOrderModel[]>(TOMs);
//                 if (TOMsObject == null)
//                     return;

//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     //1) to project manager
//                     string projectManager = context.Project.Where(p => p.ProjectId == projectId).Select(p => p.ProjectManager).FirstOrDefault();

//                     //2)to project owner
//                     string owner = context.Project.Where(p => p.ProjectId == projectId).Select(p => p.Owner).FirstOrDefault();

//                     //3)to project shareholders
//                     string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == projectId).Select(p => p.AssignedTo).ToArray();

//                     List<string> all = new List<string>();
//                     all.Add(projectManager);
//                     all.Add(owner);
//                     all.AddRange(shareholders);

//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionProjectToDo).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionProjectToDo.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionProjectToDo) // tablets, phones, PC's etc.. 
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("ProjectToDoReOrderingAvailable", TOMs, projectId);
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

