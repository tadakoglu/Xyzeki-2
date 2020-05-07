using System;
using System.Linq;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace XYZToDo.Models.Repository
{
    public class ProjectToDoRepository : IProjectToDoRepository
    {
        XYZToDoSQLDbContext context;
        public ProjectToDoRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }
        public IQueryable<ProjectTaskComment> ProjectToDoComments => context.ProjectTaskComment;
        public IQueryable<ProjectTask> ProjectToDos => context.ProjectTask;

        public ProjectTask Complete(long toDoId)
        {
            ProjectTask pTask = ProjectToDos.Where(pt => pt.TaskId == toDoId).FirstOrDefault();

            if (pTask != null)
            {
                try
                {
                    pTask.IsCompleted = true; // Set as done
                    pTask.Finish = DateTimeOffset.Now;
                    context.Entry(pTask).State = EntityState.Modified;
                    context.SaveChanges();
                    return pTask;
                }
                catch { }
            }
            return null;


        }
        public ProjectTask[] AssignedProjectToDos(string username, string searchValue) // Returns null or objects
        {
            return ProjectToDos.Where(pt => pt.AssignedTo == username).Where(pt => searchValue == "undefined" || (pt.TaskTitle.Contains(searchValue) || pt.AssignedTo.Contains(searchValue))).ToArray();
        }

        public ProjectTask[] GetProjectToDos(long projectId) // Returns null or objects
        {
            return ProjectToDos.Where(pt => pt.ProjectId == projectId)?.ToArray();
        }
        public CommentCountModel[] GetProjectToDoAssignedCommentsCount(string username, string searchValue)
        {
            long[] projectTodosAssigned = this.ProjectToDos.Where(pt => pt.AssignedTo == username).Where(pt => searchValue == "undefined" || (pt.TaskTitle.Contains(searchValue) || pt.AssignedTo.Contains(searchValue))).Select(pt => pt.TaskId).ToArray();
            if (projectTodosAssigned != null)
            {
                IList<CommentCountModel> commentCounts = new List<CommentCountModel>();
                foreach (long taskId in projectTodosAssigned)
                {
                    int commentCount = this.ProjectToDoComments.Where(ptc => ptc.TaskId == taskId).Select(pt => pt.MessageId).Count();
                    commentCounts.Add(new CommentCountModel { TaskId = taskId, CommentsCount = commentCount });
                }
                return commentCounts.ToArray();
            }
            else
            {
                return null;
            }

        }

        public CommentCountModel[] GetProjectToDoCommentsCount(long projectId)
        {

            long[] projectTodos = this.ProjectToDos.Where(pt => pt.ProjectId == projectId).Select(pt => pt.TaskId).ToArray();
            if (projectTodos != null)
            {
                IList<CommentCountModel> commentCounts = new List<CommentCountModel>();
                foreach (long taskId in projectTodos)
                {
                    int commentCount = this.ProjectToDoComments.Where(ptc => ptc.TaskId == taskId).Select(pt => pt.MessageId).Count();
                    commentCounts.Add(new CommentCountModel { TaskId = taskId, CommentsCount = commentCount });
                }
                return commentCounts.ToArray();
            }
            else
            {
                return null;
            }
        }

        public ProjectTask FindProjectToDo(long toDoId) // Returns null or object
        {
            return ProjectToDos.Where(pt => pt.TaskId == toDoId).FirstOrDefault();
        }

        public ReturnModel NewProjectTask(ProjectTask projectTask)// Return -1 for any errors otherwise TaskId
        {
            try
            {
                context.ProjectTask.Add(projectTask);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }

            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = projectTask.TaskId };  // Return TaskId(autoset from identity)
        }

        public ReturnModel UpdateProjectTask(ProjectTask projectTask)
        {
            if (projectTask.TaskId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                context.Entry(projectTask).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }
        public ProjectTask RemoveProjectTask(long taskId) // Return null for any errors otherwise ProjectTask
        {
            ProjectTask pTask = ProjectToDos.Where(pt => pt.TaskId == taskId).FirstOrDefault();
            if (pTask != null)
            {
                context.ProjectTask.Remove(pTask);
                context.SaveChanges();
            }
            return pTask;
        }

        public ReturnModel SaveAllTOMs(TaskOrderModel[] TOMs, long projectId)
        {
            try
            {
                ProjectTask projectTask = null;
                foreach (var TOM in TOMs)
                {
                    projectTask = ProjectToDos.Where(pt => pt.TaskId == TOM.TaskId).FirstOrDefault();
                    if (projectTask == null)
                       continue;

                    projectTask.Order = TOM.Order;
                    context.Entry(projectTask).State = EntityState.Modified;
                }
                context.SaveChanges();
                return new ReturnModel { ErrorCode = ErrorCodes.OK };
            }
            catch (System.Exception)
            {
                return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError };
            }
        }
    }
}
