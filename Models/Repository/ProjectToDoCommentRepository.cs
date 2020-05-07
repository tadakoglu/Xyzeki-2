using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class ProjectToDoCommentRepository : IProjectToDoCommentRepository
    {
        XYZToDoSQLDbContext context;
        public ProjectToDoCommentRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }
        public IQueryable<ProjectTaskComment> ProjectToDoComments => context.ProjectTaskComment;

        public ProjectTaskComment[] GetProjectToDoComments(long taskId)  // Get comments of a ptask(taskId)
        {
            return ProjectToDoComments.Where(ptc => ptc.TaskId == taskId)?.ToArray();
        }
        public ProjectTaskComment GetProjectToDoComment(long messageId)
        {
            return ProjectToDoComments.Where(ptc => ptc.MessageId == messageId).FirstOrDefault();
        }

        public ReturnModel AddProjectToDoComment(ProjectTaskComment projectTaskComment)
        {
            try
            {
                context.ProjectTaskComment.Add(projectTaskComment);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = projectTaskComment.MessageId }; // Autoset in DB
        }

        public ProjectTaskComment DeleteProjectToDoComment(long messageId)
        {
            ProjectTaskComment ptComment = context.ProjectTaskComment.Where(ptc => ptc.MessageId == messageId).FirstOrDefault();
            if (ptComment != null)
            {
                context.ProjectTaskComment.Remove(ptComment);
                context.SaveChanges();
            }
            return ptComment;
        }

       public ReturnModel UpdateProjectToDoComment(ProjectTaskComment projectTaskComment)
        {
            if (projectTaskComment.MessageId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                context.Entry(projectTaskComment).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };

        }
    }
}