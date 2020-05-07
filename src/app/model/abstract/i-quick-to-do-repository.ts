import { Injectable } from '@angular/core';
import { QuickTask } from '../quick-task.model';

@Injectable()
export abstract class IQuickToDoRepository {
    abstract getMyQuickToDos(): QuickTask[]
    abstract getAssignedToMe(): QuickTask[]
    abstract delete(quickToDoId: number)
    // abstract complete(quickToDoId:number)
    // abstract deComplete(quickToDoId:number)
    abstract saveQuickToDo(quickToDo: QuickTask)
    //abstract saveAssignedToMeFromSignalR(quickToDo: QuickTask)
    

}