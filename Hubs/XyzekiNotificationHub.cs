using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Models;
using XYZToDo.Models.Abstract;
using XYZToDo.Infrastructure;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System.Collections.Generic;
using XYZToDo.Models.ViewModels;
using XYZToDo.Models.AzureModels;

namespace XYZToDo.Hubs
{
    [Authorize]
    public class XyzekiNotificationHub : Hub /* All in One Single Hub */
    {
        public override async Task OnConnectedAsync()
        {
            // DB SYSTEM FOR MULTI SERVER SYSTEM
            string name = Context.User.Identity.Name;
            using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
            {
                Member member = db.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == name);
                if (member == null)
                    return;

                // foreach (var p in db.Set<ConnectionXyzeki>().Where(cx => cx.Username == name))
                // {
                //     db.Entry(p).State = EntityState.Deleted;
                // }
                // db.SaveChanges();


                member.ConnectionXyzeki.Add(new ConnectionXyzeki
                {
                    ConnectionId = Context.ConnectionId,
                    UserAgent = Context.GetHttpContext().Request.Headers["User-Agent"],
                    Connected = true
                });

                db.SaveChanges();

            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string name = Context.User.Identity.Name;
            using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
            {
                ConnectionXyzeki connection = db.ConnectionXyzeki.Find(Context.ConnectionId);
                //connection.Connected = false;

                if (connection != null)
                {
                    db.Remove(connection);
                    db.SaveChanges();
                }

            }

            await base.OnDisconnectedAsync(exception);
        }


        //TeamMember Area
        public async Task NotifyNewTeamMember(string teamMember, string mode)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                TeamMember tMember = JsonConvert.DeserializeObject<TeamMember>(teamMember);
                if (tMember == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    if (mode == "new") // ***sadece eklenen kişiye mesaj 
                    {
                        if (tMember.Username == thisUser) // dont sent to yourself.
                            return;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == tMember.Username);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewTeamMemberAvailable", teamMember, mode);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }
                    else if (mode == "update") // ***takım sahibi, takım arkadaşlarına, ve eklenen kişiye mesaj gönder.
                    {
                        // if (tMember.Username == thisUser) // dont sent to yourself.
                        //     return;
                        //1) to team owner(for accept/reject)
                        string teamOwner = context.TeamMember.Where(TM => TM.TeamMemberId == tMember.TeamMemberId).Select(t => t.Team.Owner).FirstOrDefault();

                        //2)to added person(for owner resent invitation)
                        string added = tMember.Username;

                        //3)to team friends(in invitations)

                        string[] friends = context.Team.Where(t => t.TeamId == tMember.TeamId).SelectMany(t => t.TeamMember).Select(tm => tm.Username).ToArray();

                        List<string> all = new List<string>();
                        all.Add(teamOwner);
                        all.Add(added);
                        all.AddRange(friends);

                        string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                        foreach (var to in allUnique)
                        {
                            if (to == thisUser) // dont sent to yourself.
                                continue;

                            Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                            if (member != null && member.ConnectionXyzeki.Count > 0)
                            {
                                foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                                {
                                    try
                                    {
                                        await Clients.Client(connection.ConnectionId).SendAsync("NewTeamMemberAvailable", teamMember, mode);
                                    }
                                    catch
                                    {
                                        //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                    }
                                }
                            }

                        }
                    }
                }
            }
            catch { }

        }
        public async Task NotifyDeletedTeamMember(string teamMember)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                TeamMember tMember = JsonConvert.DeserializeObject<TeamMember>(teamMember);
                if (tMember == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    //***takım sahibi(ayrılan kişi), takım arkadaşlarına(ayrılan kişi ve takım sahibi), ve eklenen kişiye(takım sahibi gönderir) mesaj gönder.

                    //1) to team owner(for accept/reject)
                    string teamOwner = context.TeamMember.Where(TM => TM.TeamMemberId == tMember.TeamMemberId).Select(t => t.Team.Owner).FirstOrDefault();

                    //2)to added person(for owner resent invitation)
                    string added = tMember.Username;

                    //3)to team friends(in invitations)

                    string[] friends = context.Team.Where(t => t.TeamId == tMember.TeamId).SelectMany(t => t.TeamMember).Select(tm => tm.Username).ToArray();

                    List<string> all = new List<string>();
                    all.Add(teamOwner);
                    all.Add(added);
                    all.AddRange(friends);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedTeamMemberAvailable", teamMember);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }
                }
            }
            catch { }
        }




        //QuickToDo Area

        public async Task NotifyNewQuickToDo(string quickToDo, string to, string mode)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                QuickTask qTask = JsonConvert.DeserializeObject<QuickTask>(quickToDo);
                if (qTask == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    if (mode == "new") // ***sadece eklenen kişiye mesaj 
                    {
                        if (qTask.AssignedTo == thisUser) // dont sent to yourself.
                            return;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == qTask.AssignedTo);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewQuickToDoAvailable", quickToDo, to, mode);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }
                    else if (mode == "update")
                    {
                        if (qTask.AssignedTo == qTask.Owner) // dont sent to yourself.
                            return;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewQuickToDoAvailable", quickToDo, to, mode);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }


        }
        public async Task NotifyDeletedQuickToDo(string quickToDo, string to)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                // QuickTask qTask = JsonConvert.DeserializeObject<QuickTask>(quickToDo);
                // if (qTask == null)
                //     return;

                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    if (to == thisUser) // dont sent to yourself.
                        return;

                    Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                    if (member != null && member.ConnectionXyzeki.Count > 0)
                    {
                        foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                        {
                            try
                            {
                                await Clients.Client(connection.ConnectionId).SendAsync("DeletedQuickToDoAvailable", quickToDo);
                            }
                            catch
                            {
                                //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                            }
                        }
                    }

                }
            }
            catch { }
        }

        public async Task NotifyQuickToDoReOrdering(string TOMs)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                TaskOrderModel[] TOMsObject = JsonConvert.DeserializeObject<TaskOrderModel[]>(TOMs);
                if (TOMsObject == null)
                    return;


                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    Dictionary<string, List<TaskOrderModel>> usernameTOMs = new Dictionary<string, List<TaskOrderModel>>();
                    foreach (var TOM in TOMsObject) // bir kişinin tüm pomları tek seferde gönderilmeli. TaskID, Order
                    {
                        QuickTask qTask = context.QuickTask.Where(qt => qt.TaskId == TOM.TaskId).FirstOrDefault();
                        if (qTask == null)
                            continue;

                        string assignedTo = qTask.AssignedTo;
                        if (string.IsNullOrEmpty(assignedTo))
                            continue;

                        if (assignedTo == thisUser)
                            continue;

                        List<TaskOrderModel> TOMsList;
                        if (!usernameTOMs.TryGetValue(assignedTo, out TOMsList))
                        {
                            TOMsList = new List<TaskOrderModel>();
                            usernameTOMs.Add(assignedTo, TOMsList);
                        }

                        TOMsList.Add(TOM);
                    }

                    foreach (var to in usernameTOMs.Keys)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            List<TaskOrderModel> toTOMs;
                            if (usernameTOMs.TryGetValue(to, out toTOMs))
                            {
                                foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                                {
                                    try
                                    {
                                        await Clients.Client(connection.ConnectionId).SendAsync("QuickToDoReOrderingAvailable", JsonConvert.SerializeObject(toTOMs.ToArray()));
                                    }
                                    catch
                                    {
                                        //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                    }
                                }
                            }

                        }
                    }

                }
            }
            catch { }


        }



        //ProjectToDo Area
        public async Task NotifyNewProjectToDo(string projectToDo) // to owner, to manager, to other project shareholders
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                ProjectTask pTask = JsonConvert.DeserializeObject<ProjectTask>(projectToDo);
                if (pTask == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    //1) to project manager
                    string projectManager = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.ProjectManager).FirstOrDefault();

                    //2)to project owner
                    string owner = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.Owner).FirstOrDefault();

                    //3)to project shareholders
                    string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.AssignedTo).ToArray();

                    List<string> all = new List<string>();
                    all.Add(projectManager);
                    all.Add(owner);
                    all.AddRange(shareholders);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewProjectToDoAvailable", projectToDo);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }

                }
            }
            catch { }
        }
        public async Task NotifyDeletedProjectToDo(string projectToDo) // to owner, to manager, to other project shareholders
        {

            try
            {
                string thisUser = Context.User.Identity.Name;
                ProjectTask pTask = JsonConvert.DeserializeObject<ProjectTask>(projectToDo);
                if (pTask == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    //1) to project manager
                    string projectManager = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.ProjectManager).FirstOrDefault();

                    //2)to project owner
                    string owner = context.Project.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.Owner).FirstOrDefault();

                    //3)to project shareholders
                    string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == pTask.ProjectId).Select(p => p.AssignedTo).ToArray();

                    List<string> all = new List<string>();
                    all.Add(projectManager);
                    all.Add(owner);
                    all.AddRange(shareholders);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedProjectToDoAvailable", projectToDo);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }

                }
            }
            catch { }
        }

        public async Task NotifyProjectToDoReOrdering(string TOMs, long projectId) // to owner, to manager, to other project shareholders
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                //long pTaskId = long.Parse(projectId);
                TaskOrderModel[] TOMsObject = JsonConvert.DeserializeObject<TaskOrderModel[]>(TOMs);
                if (TOMsObject == null)
                    return;

                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    //1) to project manager
                    string projectManager = context.Project.Where(p => p.ProjectId == projectId).Select(p => p.ProjectManager).FirstOrDefault();

                    //2)to project owner
                    string owner = context.Project.Where(p => p.ProjectId == projectId).Select(p => p.Owner).FirstOrDefault();

                    //3)to project shareholders
                    string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == projectId).Select(p => p.AssignedTo).ToArray();

                    List<string> all = new List<string>();
                    all.Add(projectManager);
                    all.Add(owner);
                    all.AddRange(shareholders);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc.. 
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("ProjectToDoReOrderingAvailable", TOMs, projectId);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }

                }
            }
            catch { }
        }



        //Project Area
        public async Task NotifyNewProject(string project) // Send to here. (Sending functionality)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                Project proj = JsonConvert.DeserializeObject<Project>(project);
                if (proj == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    List<string> all = new List<string>();

                    string owner = proj.Owner;
                    all.Add(owner);

                    if (proj.Privacy == (int)PrivacyModes.listMode
                    || proj.Privacy == (int)PrivacyModes.open
                    || (proj.Privacy == (int)PrivacyModes.onlyOwnerAndPM)
                    || proj.Privacy == (int)PrivacyModes.openOnlyTasks)
                    {
                        string pm = proj.ProjectManager;
                        if (!string.IsNullOrEmpty(pm))
                            all.Add(pm);

                    }


                    if (proj.Privacy == (int)PrivacyModes.listMode
                    || proj.Privacy == (int)PrivacyModes.open)
                    {

                        string[] shareholders = context.ProjectTask.Where(pt => pt.ProjectId == proj.ProjectId).Select(pt => pt.AssignedTo).ToArray();
                        all.AddRange(shareholders);

                    }

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewProjectAvailable", project);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }

        }

        public async Task NotifyDeletedProject(string project, bool toAllCompany = false)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                Project proj = JsonConvert.DeserializeObject<Project>(project);
                if (proj == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    List<string> all = new List<string>();

                    if (toAllCompany) // to all company
                    {
                        string[] company = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true).Select(tm => tm.Team.OwnerNavigation).SelectMany(m => m.Team).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();
                        all.AddRange(company);
                    }
                    else // to only shareholders...
                    {
                        string owner = proj.Owner;
                        all.Add(owner);

                        string pm = proj.ProjectManager;
                        if (!string.IsNullOrEmpty(pm))
                            all.Add(pm);

                        string[] shareholders = context.ProjectTask.Where(pt => pt.ProjectId == proj.ProjectId).Select(pt => pt.AssignedTo).ToArray();
                        all.AddRange(shareholders);
                    }



                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedProjectAvailable", project);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }

        }

        public async Task NotifyProjectReOrdering(string POMs) // to owner, to manager, to other project shareholders
        {
            try
            {
                string thisUser = Context.User.Identity.Name;

                ProjectOrderModel[] POMsObject = JsonConvert.DeserializeObject<ProjectOrderModel[]>(POMs);
                if (POMsObject == null)
                    return;

                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    Dictionary<string, List<ProjectOrderModel>> usernamePOMs = new Dictionary<string, List<ProjectOrderModel>>();

                    foreach (var POM in POMsObject) // bir kişinin tüm pomları tek seferde gönderilmeli. ProjectID, Order
                    {
                        Project proj = context.Project.Where(p => p.ProjectId == POM.ProjectId).FirstOrDefault();
                        if (proj == null)
                            continue;

                        List<string> all = new List<string>();

                        string owner = proj.Owner;
                        all.Add(owner);

                        string pm = proj.ProjectManager;
                        if (!string.IsNullOrEmpty(pm))
                            all.Add(pm);

                        string[] shareholders = context.ProjectTask.Where(pt => pt.ProjectId == proj.ProjectId).Select(pt => pt.AssignedTo).ToArray();
                        all.AddRange(shareholders);


                        string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).Where(str => str != null).ToArray();

                        foreach (var to in allUnique)
                        {
                            List<ProjectOrderModel> POMsList;
                            if (!usernamePOMs.TryGetValue(to, out POMsList))
                            {
                                POMsList = new List<ProjectOrderModel>();
                                usernamePOMs.Add(to, POMsList);
                            }

                            POMsList.Add(POM);


                        }
                    }

                    foreach (var to in usernamePOMs.Keys)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            List<ProjectOrderModel> toPOMs;
                            if (usernamePOMs.TryGetValue(to, out toPOMs))
                            {
                                foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                                {
                                    try
                                    {
                                        await Clients.Client(connection.ConnectionId).SendAsync("ProjectReOrderingAvailable", JsonConvert.SerializeObject(toPOMs.ToArray()));
                                    }
                                    catch
                                    {
                                        //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                    }
                                }
                            }

                        }
                    }


                }
            }
            catch { }
        }



        //PrivateTalk Area
        public async Task NotifyNewPrivateTalk(string privateTalk, string receivers, string teamReceivers)
        {
            try // async will help in perserving order or signals sent
            {
                //await Groups.AddToGroupAsync("connectionId", "sevval.xyzeki.com");
                //await Clients.Group("sevval.xyzeki.com").SendAsync("metot","arg1");

                string thisUser = Context.User.Identity.Name;
                //receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]
                PrivateTalkReceiver[] rs = JsonConvert.DeserializeObject<List<PrivateTalkReceiver>>(receivers).ToArray();
                PrivateTalkTeamReceiver[] trs = JsonConvert.DeserializeObject<List<PrivateTalkTeamReceiver>>(teamReceivers).ToArray();

                using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    foreach (PrivateTalkReceiver item in rs)
                    {
                        Member member = db.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == item.Receiver);
                        if (member == null)
                            continue; //return;

                        if (member.ConnectionXyzeki?.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }

                    foreach (PrivateTalkTeamReceiver item in trs)
                    {

                        ConnectionXyzeki[] connections = db.TeamMember.Where(tm => tm.TeamId == item.TeamId && tm.Username != thisUser && tm.Status == true)?.Select(t => t.UsernameNavigation).Include(m => m.ConnectionXyzeki).SelectMany(m => m.ConnectionXyzeki).ToArray();


                        if (connections == null)
                            continue;

                        if (connections.Count() > 0)
                        {
                            foreach (var connection in connections) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }


                }
            }
            catch { }
        }
        public async Task NotifyDeletedPrivateTalk(string privateTalk, string receivers, string teamReceivers)
        {
            try // async will help in preserving the order of signals with await on invoke method on Angular front end app.
            {
                string thisUser = Context.User.Identity.Name;
                //receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]
                PrivateTalkReceiver[] rs = JsonConvert.DeserializeObject<List<PrivateTalkReceiver>>(receivers).ToArray();
                PrivateTalkTeamReceiver[] trs = JsonConvert.DeserializeObject<List<PrivateTalkTeamReceiver>>(teamReceivers).ToArray();

                using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    foreach (PrivateTalkReceiver item in rs)
                    {
                        Member member = db.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == item.Receiver);
                        if (member == null)
                            continue;

                        if (member.ConnectionXyzeki?.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }

                    foreach (PrivateTalkTeamReceiver item in trs)
                    {

                        ConnectionXyzeki[] connections = db.TeamMember.Where(tm => tm.TeamId == item.TeamId && tm.Username != thisUser && tm.Status == true)?.Select(t => t.UsernameNavigation).Include(m => m.ConnectionXyzeki).SelectMany(m => m.ConnectionXyzeki).ToArray();


                        if (connections == null)
                            continue;

                        if (connections.Count() > 0)
                        {
                            foreach (var connection in connections) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedPrivateTalkAvailable", privateTalk, receivers, teamReceivers);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }


                }
            }
            catch { }
        }
        public void NotifyPrivateTalkLastSeen(long privateTalkId) // Send to here. (Sending functionality)
        {
            string member = Context.User.Identity.Name;

            using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
            {
                PrivateTalkLastSeen PTLastSeen = context.PrivateTalkLastSeen.Where(ptl => ptl.PrivateTalkId == privateTalkId && ptl.Visitor == member).FirstOrDefault();
                if (PTLastSeen != null) //IF EXISTS
                {
                    PTLastSeen.LastSeen = System.DateTimeOffset.Now;
                    try
                    {
                        context.Entry(PTLastSeen).State = EntityState.Modified;
                        context.SaveChanges();
                    }
                    catch { } // there is a problem in update operation.

                }
                else
                {
                    //Runs only once.
                    PrivateTalkLastSeen newPTLS = new PrivateTalkLastSeen { PrivateTalkId = privateTalkId, Visitor = member, LastSeen = System.DateTimeOffset.Now };
                    try
                    {
                        context.PrivateTalkLastSeen.Add(newPTLS);
                        context.SaveChanges();
                    }
                    catch { }
                }


            }


        }




        //PrivateTalkMessage Area
        public async Task NotifyNewPrivateTalkMessage(string privateTalkMessage, bool isTypingSignal) // Send to here. (Sending functionality)
        {

            try
            {
                string thisUser = Context.User.Identity.Name;
                PrivateTalkMessage ptm = JsonConvert.DeserializeObject<PrivateTalkMessage>(privateTalkMessage);
                if (ptm == null)
                    return;
                using (var db = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    string sender = db.PrivateTalk.Where(pt => pt.PrivateTalkId == ptm.PrivateTalkId).Select(pt => pt.Sender).FirstOrDefault();
                    string[] receivers = db.PrivateTalk.Where(pt => pt.PrivateTalkId == ptm.PrivateTalkId).SelectMany(t => t.PrivateTalkReceiver).Select(ptr => ptr.Receiver).ToArray();

                    string[] teamReceivers = db.PrivateTalk.Where(pt => pt.PrivateTalkId == ptm.PrivateTalkId).SelectMany(t => t.PrivateTalkTeamReceiver).Select(pttr => pttr.Team).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

                    List<string> all = new List<string>();
                    all.Add(sender);
                    all.AddRange(receivers);
                    all.AddRange(teamReceivers);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = db.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewPrivateTalkMessageAvailable", privateTalkMessage, isTypingSignal);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }

                    }

                }
            }
            catch { }
        }


        //Container Area
        public async Task NotifyNewContainer(string container) // Send to here. (Sending functionality)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                CloudContainer cContainer = JsonConvert.DeserializeObject<CloudContainer>(container);
                if (cContainer == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    List<string> all = new List<string>();


                    // access members license
                    MemberLicense validLic = null;

                    MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisUser && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true && tm.Team.Owner != thisUser).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    if (licenseJoined != null)
                        validLic = licenseJoined;
                    else if (myLicense != null)
                        validLic = myLicense;

                    if (validLic == null)
                        return;

                    string[] receivers = context.Team.Where(t => t.Owner == validLic.Username).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

                    all.AddRange(receivers);


                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewContainerAvailable", container);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }

        }
        public async Task NotifyDeletedContainer(string container)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                CloudContainer cContainer = JsonConvert.DeserializeObject<CloudContainer>(container);
                if (cContainer == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    List<string> all = new List<string>();


                    // access members license
                    MemberLicense validLic = null;

                    MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisUser && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true && tm.Team.Owner != thisUser).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    if (licenseJoined != null)
                        validLic = licenseJoined;
                    else if (myLicense != null)
                        validLic = myLicense;

                    if (validLic == null)
                        return;

                    string[] receivers = context.Team.Where(t => t.Owner == validLic.Username).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

                    all.AddRange(receivers);


                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedContainerAvailable", container);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }

        }



        //ContainerBlob Area

        public async Task NotifyNewContainerBlob(string containerBlob)         //Avoid async void // Send to here. (Sending functionality)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                CloudFile cBlob = JsonConvert.DeserializeObject<CloudFile>(containerBlob);
                if (cBlob == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    List<string> all = new List<string>();


                    // access members license
                    MemberLicense validLic = null;

                    MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisUser && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true && tm.Team.Owner != thisUser).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    if (licenseJoined != null)
                        validLic = licenseJoined;
                    else if (myLicense != null)
                        validLic = myLicense;

                    if (validLic == null)
                        return;

                    string[] receivers = context.Team.Where(t => t.Owner == validLic.Username).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

                    all.AddRange(receivers);


                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewContainerBlobAvailable", containerBlob);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }

        }
        public async Task NotifyDeletedContainerBlob(string containerBlob)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                CloudFile cBlob = JsonConvert.DeserializeObject<CloudFile>(containerBlob);
                if (cBlob == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    List<string> all = new List<string>();


                    // access members license
                    MemberLicense validLic = null;

                    MemberLicense myLicense = context.MemberLicense.Where(ml => ml.Username == thisUser && ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    MemberLicense licenseJoined = context.TeamMember.Where(tm => tm.Username == thisUser && tm.Status == true && tm.Team.Owner != thisUser).Select(tm => tm.Team.OwnerNavigation).Select(m => m.MemberLicense).Where(ml => ml.EndDate > DateTimeOffset.Now).FirstOrDefault();

                    if (licenseJoined != null)
                        validLic = licenseJoined;
                    else if (myLicense != null)
                        validLic = myLicense;

                    if (validLic == null)
                        return;

                    string[] receivers = context.Team.Where(t => t.Owner == validLic.Username).SelectMany(t => t.TeamMember).Where(tm => tm.Status == true).Select(tm => tm.Username).ToArray();

                    all.AddRange(receivers);


                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        if (to == thisUser) // dont sent to yourself.
                            continue;

                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedContainerBlobAvailable", containerBlob);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }

        }



        //Comment Area
        //mode='new' or 'update', that is for comments numbers service, it won't increase the number of comments when update operation happened.
        public async Task NotifyNewQuickToDoComment(string comment, string mode) // Send to here. (Sending functionality)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                QuickTaskComment qTaskComment = JsonConvert.DeserializeObject<QuickTaskComment>(comment);
                if (qTaskComment == null)
                    return;
                // to assignedTo and to owner
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    string owner = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.Owner).FirstOrDefault();
                    string assignedTo = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.AssignedTo).FirstOrDefault();

                    List<string> all = new List<string>();
                    all.Add(owner);
                    all.Add(assignedTo);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique) // That will also send a message to this user.
                    {
                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewQuickToDoCommentAvailable", comment, mode);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }

                            }
                        }
                    }
                }
            }
            catch { }

        }
        public async Task NotifyDeletedQuickToDoComment(string comment)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                QuickTaskComment qTaskComment = JsonConvert.DeserializeObject<QuickTaskComment>(comment);
                if (qTaskComment == null)
                    return;
                // to assignedTo and to owner including himself/herself
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    string owner = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.Owner).FirstOrDefault();
                    string assignedTo = context.QuickTask.Where(qt => qt.TaskId == qTaskComment.TaskId).Select(qt => qt.AssignedTo).FirstOrDefault();

                    List<string> all = new List<string>();
                    all.Add(owner);
                    all.Add(assignedTo);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique) // That will also send a message to this user.
                    {
                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedQuickToDoCommentAvailable", comment);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }


                        }
                    }
                }
            }
            catch { }
        }

        public async Task NotifyNewProjectToDoComment(string comment, string mode) // Send to here. (Sending functionality)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                ProjectTaskComment pTaskComment = JsonConvert.DeserializeObject<ProjectTaskComment>(comment);
                if (pTaskComment == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    //1) to project manager
                    string projectManager = context.ProjectTask.Where(pt => pt.TaskId == pTaskComment.TaskId).Select(pt => pt.Project).Select(p => p.ProjectManager).FirstOrDefault();

                    //2)to project owner
                    string owner = context.ProjectTask.Where(pt => pt.TaskId == pTaskComment.TaskId).Select(pt => pt.Project).Select(p => p.Owner).FirstOrDefault();

                    //3)to project shareholders
                    string[] shareholders = context.ProjectTask.Where(pt => pt.TaskId == pTaskComment.TaskId).Select(pt => pt.Project).SelectMany(pt => pt.ProjectTask).Select(pt => pt.AssignedTo).ToArray();

                    List<string> all = new List<string>();
                    all.Add(projectManager);
                    all.Add(owner);
                    all.AddRange(shareholders);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("NewProjectToDoCommentAvailable", comment, mode);

                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }

                            }
                        }
                    }

                }
            }
            catch { }

        }
        public async Task NotifyDeletedProjectToDoComment(string comment)
        {
            try
            {
                string thisUser = Context.User.Identity.Name;
                ProjectTaskComment pTaskComment = JsonConvert.DeserializeObject<ProjectTaskComment>(comment);
                if (pTaskComment == null)
                    return;
                using (var context = new XYZToDo.Models.DatabasePersistanceLayer.XYZToDoSQLDbContext())
                {
                    //1) to project manager
                    string projectManager = context.Project.Where(p => p.ProjectId == pTaskComment.TaskId).Select(p => p.ProjectManager).FirstOrDefault();

                    //2)to project owner
                    string owner = context.Project.Where(p => p.ProjectId == pTaskComment.TaskId).Select(p => p.Owner).FirstOrDefault();

                    //3)to project shareholders
                    string[] shareholders = context.ProjectTask.Where(p => p.ProjectId == pTaskComment.TaskId).Select(p => p.AssignedTo).ToArray();

                    List<string> all = new List<string>();
                    all.Add(projectManager);
                    all.Add(owner);
                    all.AddRange(shareholders);

                    string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

                    foreach (var to in allUnique)
                    {
                        Member member = context.Member.Include(u => u.ConnectionXyzeki).SingleOrDefault(u => u.Username == to);
                        if (member != null && member.ConnectionXyzeki.Count > 0)
                        {
                            foreach (var connection in member.ConnectionXyzeki) // tablets, phones, PC's etc..
                            {
                                try
                                {
                                    await Clients.Client(connection.ConnectionId).SendAsync("DeletedProjectToDoCommentAvailable", comment);
                                }
                                catch
                                {
                                    //throw new Exception("A problem occurred when sending a signal to a particular connection id");
                                }
                            }
                        }
                    }

                }
            }
            catch { }
        }



    }
}