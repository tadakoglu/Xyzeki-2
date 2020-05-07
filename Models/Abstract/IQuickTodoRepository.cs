using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IQuickTodoRepository
    {
        IQueryable<QuickTask> QuickToDos { get; } //Quick to-do's query api


        QuickTask[] MyQuickTodos(string username, int pageNo, string searchValue, int pageSize); // owner
        QuickTask[] AssignedToMe(string username, string searchValue);  // assignedto
        CommentCountModel[] GetQuickTodoCommentsCount(string username, int pageNo, string searchValue, int pageSize);
        QuickTask Complete(long quickToDoId, string username);
        QuickTask DeComplete(long quickToDoId);

        ReturnModel NewQuickTodo(QuickTask projectTask);
        ReturnModel UpdateQuickTodo(QuickTask quickTask);
        QuickTask DeleteQuickTodo(long quickTaskId);
        QuickTask FindQuickToDo(long toDoId); // Returns null or object

        ReturnModel SaveAllTOMs(TaskOrderModel[] TOMs);  // Return -1 if error has occured, otherwise TaskID

    }
}