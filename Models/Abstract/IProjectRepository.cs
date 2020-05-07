using System;
using System.Linq;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Abstract
{
    public interface IProjectRepository
    {
        IQueryable<Project> Projects { get; } // Project query api

        /*Project Operations */
        //Viewing methods  will return NULL there is/are not such object/objects otherwise object/objects
        Project[] GetProjects(string username); // Projects where(owner=>owner==username)
        Project[] GetProjectsAssigned(string username);

        bool isProjectAssignedGuard(long projectId, string thisMember);
        bool isMyProjectGuard(long projectId, string thisMember);


        bool isShareholder(long projectId, string username);

        Project FindProject(long projectId);

        ReturnModel NewProject(Project project); // Return -1 if error has occured, otherwise ProjectId
        ReturnModel UpdateProject(Project project);
        Project DeleteProject(long projectId);  //Return null if error has occurred, otherwise Project(deleted)

        ReturnModel SaveAllPOMs(ProjectOrderModel[] POMs);  // Return -1 if error has occured, otherwise TaskID

        /*Project Operations End*/


    }
}
