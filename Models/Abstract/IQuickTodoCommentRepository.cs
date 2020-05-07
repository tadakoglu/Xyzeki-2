using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IQuickTodoCommentRepository
    {
        IQueryable<QuickTaskComment> QuickTodoComments{get;} 

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        QuickTaskComment[] GetQuickTodoComments(long taskId); 
        QuickTaskComment GetQuickTodoComment(long messageId); // Returns null or object
        
        ReturnModel AddQuickTodoComment(QuickTaskComment quickTaskComment); // Return -1 if error has occured, otherwise 0(OK),
        ReturnModel UpdateQuickTodoComment(QuickTaskComment quickTaskComment);
        QuickTaskComment DeleteQuickTodoComment(long messageId); //Return -1 if error has occurred, otherwise 0(OK)
       
    }
}
