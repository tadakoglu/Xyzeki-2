// // alıcılar: proje yöneticisi, proje paydaşları sadece
// // proje sahibi gereksiz çünkü zaten sahibi olduğundan sahibin paylaşılanlarında bu proje görünmez.

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
//     public class ProjectNotificationHub : Hub
//     {
//         public override async Task OnConnectedAsync()
//         {
//             // DB SYSTEM FOR MULTI SERVER SYSTEM
//             string name = Context.User.Identity.Name;
//             using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//             {
//                 Member member = db.Member.Include(u => u.ConnectionProject).SingleOrDefault(u => u.Username == name);
//                 if (member == null)
//                     return;

//                 member.ConnectionProject.Add(new ConnectionProject
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
//                 ConnectionProject connection = db.ConnectionProject.Find(Context.ConnectionId);
//                 //connection.Connected = false;

//                 if (connection != null)
//                 {
//                     db.Remove(connection);
//                     db.SaveChanges();
//                 }

//             }

//             await base.OnDisconnectedAsync(exception);
//         }
//         // şu an ki sorun şu şekilde çözülebilir, ilgili paydaşlara proje gönderilmeden önce tüm şirketten önce bi temizlenir...
//         // bu işlemden önce tüm şirkete projeyi silme talebi gönderilir. müşteri(client) eğer proje mevcut ise bunu siler. yoksa işlem yapmaz..
//         public async Task NotifyNewProject(string project) // Send to here. (Sending functionality)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 Project proj = JsonConvert.DeserializeObject<Project>(project);
//                 if (proj == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     List<string> all = new List<string>();

//                     string owner = proj.Owner;
//                     all.Add(owner);

//                     string pm = proj.ProjectManager;
//                     if (!string.IsNullOrEmpty(pm))
//                         all.Add(pm);

//                     string[] shareholders = context.ProjectTask.Where(pt => pt.ProjectId == proj.ProjectId).Select(pt => pt.AssignedTo).ToArray();
//                     all.AddRange(shareholders);


//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionProject).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionProject.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionProject) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("NewProjectAvailable", project);
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

//         //proje paydaşları değişeceğinden bu kişilerden silme isteği bazen yetersiz olabilir bu durumda tüm şirkete silme isteği gönderilir.
//         public async Task NotifyDeletedProject(string project, bool toAllCompany = false)
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;
//                 Project proj = JsonConvert.DeserializeObject<Project>(project);
//                 if (proj == null)
//                     return;
//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     List<string> all = new List<string>();

//                     if (toAllCompany) // to all company
//                     {
//                         string[] company = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true).Select(tm => tm.Team.OwnerNavigation).SelectMany(m => m.Team).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();
//                         all.AddRange(company);
//                     }
//                     else // to only shareholders...
//                     {
//                         string owner = proj.Owner;
//                         all.Add(owner);

//                         string pm = proj.ProjectManager;
//                         if (!string.IsNullOrEmpty(pm))
//                             all.Add(pm);

//                         string[] shareholders = context.ProjectTask.Where(pt => pt.ProjectId == proj.ProjectId).Select(pt => pt.AssignedTo).ToArray();
//                         all.AddRange(shareholders);
//                     }



//                     string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

//                     foreach (var to in allUnique)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionProject).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionProject.Count > 0)
//                         {
//                             foreach (var connection in member.ConnectionProject) // tablets, phones, PC's etc..
//                             {
//                                 try
//                                 {
//                                     await Clients.Client(connection.ConnectionId).SendAsync("DeletedProjectAvailable", project);
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

//         public async Task NotifyProjectReOrdering(string POMs) // to owner, to manager, to other project shareholders
//         {
//             try
//             {
//                 string thisUser = Context.User.Identity.Name;

//                 ProjectOrderModel[] POMsObject = JsonConvert.DeserializeObject<ProjectOrderModel[]>(POMs);
//                 if (POMsObject == null)
//                     return;

//                 using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
//                 {
//                     Dictionary<string, List<ProjectOrderModel>> usernamePOMs = new Dictionary<string, List<ProjectOrderModel>>();

//                     foreach (var POM in POMsObject) // bir kişinin tüm pomları tek seferde gönderilmeli. ProjectID, Order
//                     {
//                         Project proj = context.Project.Where(p => p.ProjectId == POM.ProjectId).FirstOrDefault();
//                         if (proj == null)
//                             continue;

//                         List<string> all = new List<string>();

//                         string owner = proj.Owner;
//                         all.Add(owner);

//                         string pm = proj.ProjectManager;
//                         if (!string.IsNullOrEmpty(pm))
//                             all.Add(pm);

//                         string[] shareholders = context.ProjectTask.Where(pt => pt.ProjectId == proj.ProjectId).Select(pt => pt.AssignedTo).ToArray();
//                         all.AddRange(shareholders);


//                         string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).Where(str => str != null).ToArray();

//                         foreach (var to in allUnique)
//                         {
//                             List<ProjectOrderModel> POMsList;
//                             if (!usernamePOMs.TryGetValue(to, out POMsList))
//                             {
//                                 POMsList = new List<ProjectOrderModel>();
//                                 usernamePOMs.Add(to, POMsList);
//                             }

//                             POMsList.Add(POM);


//                         }
//                     }

//                     foreach (var to in usernamePOMs.Keys)
//                     {
//                         if (to == thisUser) // dont sent to yourself.
//                             continue;

//                         Member member = context.Member.Include(u => u.ConnectionProject).SingleOrDefault(u => u.Username == to);
//                         if (member != null && member.ConnectionProject.Count > 0)
//                         {
//                             List<ProjectOrderModel> toPOMs;
//                             if (usernamePOMs.TryGetValue(to, out toPOMs))
//                             {
//                                 foreach (var connection in member.ConnectionProject) // tablets, phones, PC's etc..
//                                 {
//                                     try
//                                     {
//                                         await Clients.Client(connection.ConnectionId).SendAsync("ProjectReOrderingAvailable", JsonConvert.SerializeObject(toPOMs.ToArray()));
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