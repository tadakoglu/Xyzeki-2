using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IProjectToDoCommentRepository
    {
        IQueryable<ProjectTaskComment> ProjectToDoComments { get; }

        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        ProjectTaskComment[] GetProjectToDoComments(long taskId);
        ProjectTaskComment GetProjectToDoComment(long messageId); // Returns null or object

        ReturnModel AddProjectToDoComment(ProjectTaskComment projectTaskComment); // Return -1 if error has occured, otherwise 0(OK),
        ReturnModel UpdateProjectToDoComment(ProjectTaskComment projectTaskComment);
        ProjectTaskComment DeleteProjectToDoComment(long messageId); //Return -1 if error has occurred, otherwise 0(OK)

    }
}
