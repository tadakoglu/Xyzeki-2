using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class QuickTodoCommentRepository : IQuickTodoCommentRepository
    {
        XYZToDoSQLDbContext context;
        public QuickTodoCommentRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<QuickTaskComment> QuickTodoComments => context.QuickTaskComment;


        public QuickTaskComment[] GetQuickTodoComments(long taskId) // Get comments of a task(taskId)
        {
            return QuickTodoComments.Where(qtc => qtc.TaskId == taskId)?.ToArray();
        }
        public QuickTaskComment GetQuickTodoComment(long messageId)
        {
            return QuickTodoComments.Where(qtc => qtc.MessageId == messageId).FirstOrDefault();
        }


        public ReturnModel AddQuickTodoComment(QuickTaskComment quickTaskComment)
        {
            try
            {
                context.QuickTaskComment.Add(quickTaskComment);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = quickTaskComment.MessageId }; // Autoset in DB
        }

        public QuickTaskComment DeleteQuickTodoComment(long messageId)
        {
            QuickTaskComment qtComment = context.QuickTaskComment.Where(qtc => qtc.MessageId == messageId).FirstOrDefault();
            if (qtComment != null)
            {
                context.QuickTaskComment.Remove(qtComment);
                context.SaveChanges();
            }
            return qtComment;
        }

        public ReturnModel UpdateQuickTodoComment(QuickTaskComment quickTaskComment)
        {
            if (quickTaskComment.MessageId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                context.Entry(quickTaskComment).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };

        }
    }
}