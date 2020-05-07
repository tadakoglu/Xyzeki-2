import { Injectable } from '@angular/core';
import { ProjectTaskComment } from '../project-task-comment.model';

@Injectable()
export abstract class IProjectToDoCommentRepository {
    abstract getProjectToDoComments(): ProjectTaskComment[]
    
    abstract saveProjectToDoComment(projectToDoComment: ProjectTaskComment)
    abstract deleteProjectToDoComment(messageId: number)

    // save or delete methods doesn't return anything.
}
