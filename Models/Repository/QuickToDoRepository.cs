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
    public class QuickTodoRepository : IQuickTodoRepository
    {
        XYZToDoSQLDbContext context;
        public QuickTodoRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }
        public IQueryable<QuickTaskComment> QuickTodoComments => context.QuickTaskComment;
        public IQueryable<QuickTask> QuickToDos => context.QuickTask;

        public QuickTask Complete(long quickTaskId, string username)
        {
            QuickTask qTask = QuickToDos.Where(qT => qT.TaskId == quickTaskId).FirstOrDefault();
            if (qTask != null)
            {
                try
                {
                    qTask.Completedby = username;
                    context.Entry(qTask).State = EntityState.Modified;
                    context.SaveChanges();
                    return qTask;
                }
                catch { }

            }
            return null;
        }

        public QuickTask DeComplete(long quickTaskId)
        {
            QuickTask qTask = QuickToDos.Where(qT => qT.TaskId == quickTaskId).FirstOrDefault();
            if (qTask != null)
            {
                try
                {
                    qTask.Completedby = null;
                    context.Entry(qTask).State = EntityState.Modified;
                    context.SaveChanges();
                    return qTask;
                }
                catch { }

            }
            return null;
        }


        public QuickTask[] MyQuickTodos(string username, int pageNo, string searchValue, int pageSize = 50)
        {
            //int pageSize = 20;
            // sayfa 1 : arşiv sayfa 1'i al, geri kalan tümü
            // sayfa 2 : arşiv sayfa 2'i al, boş
            // sayfa 3 : arşiv sayfa 3'ü al, boş
            if (pageNo == 1)
            {
                QuickTask[] qts = this.context.QuickTask.Where(qt => qt.Owner == username && (qt.Archived == false || qt.Archived == null)).OrderBy(qt => qt.Order).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).ToArray();

                //bunun sayfa 1'ini al.
                QuickTask[] qtsArc1 = this.context.QuickTask.Where(qt => qt.Owner == username && qt.Archived == true).OrderByDescending(qt => qt.ArchivedDate).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).Skip((pageNo - 1) * pageSize).Take(pageSize).ToArray();
                // toplamını dön
                return qts.Concat(qtsArc1).ToArray();
            }
            else
            {
                // bunun sayfa x'ini al.
                QuickTask[] qtsArcMore = this.context.QuickTask.Where(qt => qt.Owner == username && qt.Archived == true).OrderByDescending(qt => qt.ArchivedDate).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).Skip((pageNo - 1) * pageSize).Take(pageSize).ToArray();
                return qtsArcMore;
            }
        }
        public QuickTask[] AssignedToMe(string username, string searchValue)
        {
            return this.context.QuickTask.Where(qt => qt.AssignedTo == username && (qt.Archived == false || qt.Archived == null)).OrderBy(qt => qt.Order).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).ToArray();
        }
        public CommentCountModel[] GetQuickTodoCommentsCount(string username, int pageNo, string searchValue, int pageSize = 50) //assigned and owner both equals to this member.
        {
            IList<CommentCountModel> commentCounts = new List<CommentCountModel>();
            //int pageSize = 20;
            if (pageNo == 1)
            {
                long[] qts = this.context.QuickTask.Where(qt => qt.Owner == username && (qt.Archived == false || qt.Archived == null)).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).Select(qt => qt.TaskId).ToArray();
                long[] qtsA = this.context.QuickTask.Where(qt => qt.AssignedTo == username && (qt.Archived == false || qt.Archived == null)).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).Select(qt => qt.TaskId).ToArray();
                long[] qtsArc1 = this.context.QuickTask.Where(qt => qt.Owner == username && qt.Archived == true).OrderByDescending(qt => qt.ArchivedDate).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).Skip((pageNo - 1) * pageSize).Take(pageSize).Select(qt => qt.TaskId).ToArray();
                // toplamını dön
                long[] total = qts.Concat(qtsA).Concat(qtsArc1).ToArray();

                if (total != null)
                {

                    foreach (long taskId in total)
                    {
                        int commentCount = this.QuickTodoComments.Where(qtc => qtc.TaskId == taskId).Select(qt => qt.MessageId).Count();
                        commentCounts.Add(new CommentCountModel { TaskId = taskId, CommentsCount = commentCount });
                    }
                }
            }
            else
            {
                // bunun sayfa x'ini al.
                long[] qtsArcMore = this.context.QuickTask.Where(qt => qt.Owner == username && qt.Archived == true).OrderByDescending(qt => qt.ArchivedDate).Where(qt => searchValue == "undefined" || (qt.TaskTitle.Contains(searchValue) || qt.AssignedTo.Contains(searchValue))).Skip((pageNo - 1) * pageSize).Take(pageSize).Select(qt => qt.TaskId).ToArray();

                if (qtsArcMore != null)
                {

                    foreach (long taskId in qtsArcMore)
                    {
                        int commentCount = this.QuickTodoComments.Where(qtc => qtc.TaskId == taskId).Select(qt => qt.MessageId).Count();
                        commentCounts.Add(new CommentCountModel { TaskId = taskId, CommentsCount = commentCount });
                    }
                }
            }
            return commentCounts.ToArray();
        }
        public ReturnModel NewQuickTodo(QuickTask quickTask)
        {
            try
            {
                context.QuickTask.Add(quickTask);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            // try
            // {
            //     long lastIndex = MyQuickTodos(quickTask.Owner).Select(qt => qt.Order).Max() ?? 0;
            //     // quickTask.Order = quickTask.TaskId;
            //     quickTask.Order = ++lastIndex;
            //     context.Entry(quickTask).State = EntityState.Modified;
            //     context.SaveChanges();
            // }
            // catch { }

            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = quickTask.TaskId };  // Return TaskId(autoset from identity)

        }

        public ReturnModel UpdateQuickTodo(QuickTask quickTask)
        {
            if (quickTask.TaskId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                context.Entry(quickTask).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            // try{
            //     int order=0;
            //     foreach (QuickTask qt in this.MyQuickTodos(quickTask.Owner))
            //     {
            //         qt.Order  = order++;
            //         context.Entry(qt).State = EntityState.Modified;
            //         context.SaveChanges();
            //     }


            // }
            // catch{

            // }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }
        public QuickTask DeleteQuickTodo(long quickTaskId)
        {
            QuickTask quickToDo = context.QuickTask.Where(qt => qt.TaskId == quickTaskId).FirstOrDefault();
            if (quickToDo != null)
            {
                context.Remove(quickToDo);
                context.SaveChanges();
            }
            return quickToDo;

        }
         public QuickTask FindQuickToDo(long toDoId) // Returns null or object
        {
            return QuickToDos.Where(qt => qt.TaskId == toDoId).FirstOrDefault();
        }

        public ReturnModel SaveAllTOMs(TaskOrderModel[] TOMs)
        {
            try
            {
                QuickTask quickTask = null;
                foreach (var TOM in TOMs)
                {
                    quickTask = QuickToDos.Where(pt => pt.TaskId == TOM.TaskId).FirstOrDefault();
                    if (quickTask == null)
                        continue;

                    quickTask.Order = TOM.Order;
                    context.Entry(quickTask).State = EntityState.Modified;
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