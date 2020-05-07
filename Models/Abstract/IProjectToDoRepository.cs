using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IProjectToDoRepository
    {
        IQueryable<ProjectTask> ProjectToDos {get;} //Project to-do's query api
        /*Project Task Operations*/
        
        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        ProjectTask Complete(long toDoId);
        ProjectTask[] GetProjectToDos(long projectId);
        ProjectTask FindProjectToDo(long toDoId);
        
        ProjectTask[] AssignedProjectToDos(string username,string searchValue);
        CommentCountModel[] GetProjectToDoAssignedCommentsCount(string username,string searchValue);
        CommentCountModel[] GetProjectToDoCommentsCount(long projectId);

        ReturnModel NewProjectTask(ProjectTask projectTask);  // Return -1 if error has occured, otherwise TaskID
        ReturnModel UpdateProjectTask(ProjectTask projectTask);
        ProjectTask RemoveProjectTask(long TaskId); // Return null if error has occured, otherwise ProjectTask(deleted)

        
        ReturnModel SaveAllTOMs(TaskOrderModel[] TOMs,long projectId);  // Return -1 if error has occured, otherwise TaskID

        /*Project Task Operations*/
    }
}
