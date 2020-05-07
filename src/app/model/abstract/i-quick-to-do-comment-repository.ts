import { Injectable } from '@angular/core';
import { QuickTaskComment } from '../quick-task-comment.model';

@Injectable()
export abstract class IQuickToDoCommentRepository {
    abstract getQuickToDoComments(): QuickTaskComment[]
    
    abstract saveQuickToDoComment(quickToDoComment: QuickTaskComment)
    abstract deleteQuickToDoComment(messageId: number)

    // save or delete methods doesn't return anything.
}
