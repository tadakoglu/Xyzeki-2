import { Injectable } from '@angular/core';
import { ProjectTask } from '../project-task.model';

@Injectable()
export abstract class IProjectToDoRepository {
    abstract getProjectToDos(): ProjectTask[]
    //abstract getProjectToDo(projectToDoId:number): ProjectTask
    abstract getProjectToDosAssignedToMe(): ProjectTask[] 
    // abstract complete(projectTodoId:number)

    abstract saveProjectToDo(projectTask: ProjectTask)
    abstract deleteProjectToDo(taskId: number)
    
    // save or delete methods doesn't return anything.
}
