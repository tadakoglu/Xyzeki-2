import { IQuickToDoRepository } from '../abstract/i-quick-to-do-repository';
import { QuickTask } from '../quick-task.model';
import { QuickToDosService } from '../services/quick-to-dos.service';
import { Injectable } from '@angular/core';

import { MemberShared } from '../member-shared.model';
import { CommentCountModel } from '../comment-count.model';
import { PageSizes } from 'src/infrastructure/page-sizes';
import { TaskOrderModel } from '../task-order.model';
import { DataService } from '../services/shared/data.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';
import { TimeService } from '../services/time.service';
import { concatMap } from 'rxjs/operators';


@Injectable()
export class QuickToDoRepository implements IQuickToDoRepository {

    constructor(private psz: PageSizes, private service: QuickToDosService,
        private memberShared: MemberShared, private signalService: XyzekiSignalrService,
        private commentSignalService: XyzekiSignalrService, private dataService: DataService, private timeService: TimeService) {

        this.loadAll();
        // end of comments count

        this.signalService.deletedQuickToDoAvailable.subscribe(quickToDo => {
            this.deleteQuickToDoViaSignalR(quickToDo);
        })
        this.signalService.newQuickToDoAvailable.subscribe(quickToDo => {
            this.saveQuickToDoViaSignalR(quickToDo);
        })
        this.signalService.quickToDoReOrderingAvailable.subscribe(TOMs => {
            this.saveTOMs(TOMs);
        })

        this.commentSignalService.newQuickToDoCommentAvailable.subscribe((qtComment) => {
            if (qtComment && "new" == qtComment[1]) {
                let qtComments: CommentCountModel = this.qtCommentsCount.find(commentCountModel => commentCountModel.TaskId == qtComment[0].TaskId);
                if (qtComments)
                    qtComments.CommentsCount++;
            }
        })

        this.commentSignalService.deletedQuickToDoCommentAvailable.subscribe(qtComment => {
            if (qtComment) {
                let qtComments: CommentCountModel = this.qtCommentsCount.find(commentCountModel => commentCountModel.TaskId == qtComment.TaskId);
                if (qtComments)
                    qtComments.CommentsCount--;
            }
        })

        this.dataService.reloadAllOnTeamDestroyEvent.subscribe(() => { this.loadAll(); });


    }
    public pageNo: number = 1;
    public searchValue: string;

    loadAll(pageNo?: number, searchValue?: string) { // ### Reload this when team component destroyed
        this.service.myQuickToDos(pageNo, searchValue, this.psz.QTPageSize).subscribe(qts => {
            this.myQuickToDos.splice(0, this.myQuickToDos.length);
            this.myQuickToDos.push(...qts);
            //this.myQuickToDos = qts;
        })
        this.service.assignedToMe(searchValue).subscribe(qts => {
            this.assignedToMe.splice(0, this.assignedToMe.length);
            this.assignedToMe.push(...qts)
            //this.assignedToMe = qts
        })

        //comments count
        this.service.myAndAssignedToMeQTCommentsCount(pageNo, searchValue, this.psz.QTPageSize).subscribe(qtCommentsCount => {
            this.qtCommentsCount.splice(0, this.qtCommentsCount.length);
            this.qtCommentsCount.push(...qtCommentsCount);
            //this.qtCommentsCount = qtCommentsCount;
        })
    }


    loadMoreMyQuickToDos(pageNo?: number, searchValue?: string, pageSize?: number) {
        this.service.myQuickToDos(pageNo, searchValue, this.psz.QTPageSize).subscribe(qts => {
            this.myQuickToDos.push(...qts);

            //eşsizlik ve order sıralaması
            //  this.myQuickToDos = this.myQuickToDos.filter((value, index, self) => self.indexOf(self.find(val => val.TaskId == value.TaskId)) === index);

            let tempQT = Object.assign([], this.myQuickToDos.filter((value, index, self) => self.indexOf(self.find(val => val.TaskId == value.TaskId)) === index));
            this.myQuickToDos.splice(0, this.myQuickToDos.length);
            this.myQuickToDos.push(...tempQT);
        });

        this.service.myAndAssignedToMeQTCommentsCount(pageNo, searchValue, this.psz.QTPageSize).subscribe(qtCommentsCount => {
            this.qtCommentsCount.push(...qtCommentsCount);
            // 
        })

    }

    public reOrdering = false;
    reOrderAndSaveQT() { //Reordering project to-dos      
        try {
            this.reOrdering = true;
            let order: number = 0;
            let TOMs: TaskOrderModel[] = []
            let qTasks: QuickTask[] = []
            this.myQuickToDos.filter(qt => !qt.Archived).forEach(qt => {
                let TOM: TaskOrderModel = new TaskOrderModel(order, qt.TaskId);
                let qTask: QuickTask = Object.assign({}, qt); qTask.Order = order;

                TOMs.push(TOM);
                qTasks.push(qTask);
                order++
            })

            this.service.saveAllTOMs(TOMs).subscribe(response => {
                if (response == true) {
                    //this.myQuickToDos = qTasks // Can be applied faster solution but new array instance will run angular change detecting and will cause to flickering
                    qTasks.forEach(qt => {
                        let t = this.myQuickToDos.find(val => val.TaskId == qt.TaskId);
                        if (t) {
                            t.Order = qt.Order;
                        }
                        let t2 = this.assignedToMe.find(val => val.TaskId == qt.TaskId);
                        if (t2) {
                            t2.Order = qt.Order;
                        }
                    })
                    this.reOrdering = false;
                    this.signalService.notifyQuickToDoReOrdering(TOMs);
                } else {
                    this.reOrdering = false;
                }
            })

        } catch (error) { this.reOrdering = false; }


    }
    saveTOMs(TOMs: TaskOrderModel[]) {
        try {
            this.reOrdering = true;
            let qTask: QuickTask = null;
            let qTaskAss: QuickTask = null;
            TOMs.forEach(TOM => {
                qTask = this.myQuickToDos.find(qt => qt.TaskId == TOM.TaskId);
                if (qTask)
                    qTask.Order = TOM.Order;
                qTaskAss = this.assignedToMe.find(qt => qt.TaskId == TOM.TaskId);
                if (qTaskAss)
                    qTaskAss.Order = TOM.Order;

            })

            let tempMyQt = Object.assign([], this.myQuickToDos.sort((qt1, qt2) => qt1.Order - qt2.Order))
            this.myQuickToDos.splice(0, this.myQuickToDos.length);
            this.myQuickToDos.push(...tempMyQt)

            let tempQtA = Object.assign([], this.assignedToMe.sort((qt1, qt2) => qt1.Order - qt2.Order))
            this.assignedToMe.splice(0, this.assignedToMe.length);
            this.assignedToMe.push(...tempQtA)

            // this.myQuickToDos = this.myQuickToDos.sort((qt1, qt2) => qt1.Order - qt2.Order);
            // this.assignedToMe = this.assignedToMe.sort((qt1, qt2) => qt1.Order - qt2.Order);
            this.reOrdering = false;

        } catch (error) { this.reOrdering = false; }

    }
    private myQuickToDos: QuickTask[] = []
    private assignedToMe: QuickTask[] = []
    private qtCommentsCount: CommentCountModel[] = [];


    getMyQuickToDos(): QuickTask[] {
        return this.myQuickToDos;
    }
    getAssignedToMe(): QuickTask[] {
        return this.assignedToMe
    }
    getQTCommentsCount(): CommentCountModel[] {
        return this.qtCommentsCount;
    }

    delete(quickToDoId: number) {
        this.service.deleteQuickTodo(quickToDoId).subscribe(qt => {
            let index = this.myQuickToDos.findIndex(val => val.TaskId == quickToDoId)
            let quickTask: QuickTask = this.myQuickToDos.find((val, valIndex, obj) => valIndex == index);
            this.signalService.notifyDeletedQuickToDo(quickTask, quickTask.AssignedTo);

            if (-1 != index) // if exists
                this.myQuickToDos.splice(index, 1);

            let index2 = this.assignedToMe.findIndex(val => val.TaskId == quickToDoId)
            if (-1 != index2) { }
            this.assignedToMe.splice(index2, 1);

            //comment count 
            let indexC = this.qtCommentsCount.findIndex(val => val.TaskId == quickToDoId);
            if (indexC != -1)
                this.qtCommentsCount.splice(indexC, 1);
        })
    }

    getNext(): number {
        let qts = this.myQuickToDos.filter(qt => !qt.Archived);
        if (qts.length >= 1) {
            let nextIndex = Math.max(...qts.map(qt => qt.Order)) + 1
            //let nextIndex = qts.sort((qt1, qt2) => qt2.Order - qt1.Order).find((val, index, obj) => index == 0).Order + 1;
            //let nextIndex = qts[qts.length - 1].Order + 1;
            return nextIndex;
        } else {
            return 0;
        }
    }
    saveQuickToDo(quickToDo: QuickTask, getNext = false, finish = undefined, archievedDate = undefined) { // For saving to the db
        if (quickToDo.TaskId == 0 || quickToDo.TaskId == null || quickToDo.TaskId == undefined) {
            if (!quickToDo.Archived) {
                quickToDo.Order = this.getNext();
            }
            this.timeService.getNow().pipe(concatMap(now => {
                if (finish === 0) {
                    quickToDo.Finish = null;
                }
                else if (finish === 1) {
                    quickToDo.Finish = now;
                }

                if (archievedDate === 0) {
                    quickToDo.ArchivedDate = null;
                }
                else if (archievedDate === 1) {
                    quickToDo.ArchivedDate = now;
                }
                return this.service.saveQuickTodo(quickToDo)
            })).subscribe((qtId) => {
                quickToDo.TaskId = qtId;
                quickToDo.Owner = this.memberShared.Username
                if (quickToDo.Archived)
                    this.myQuickToDos.unshift(quickToDo);
                else
                    this.myQuickToDos.push(quickToDo);

                if (quickToDo.AssignedTo == this.memberShared.Username)
                    this.assignedToMe.push(quickToDo);

                this.qtCommentsCount.push(new CommentCountModel(0, qtId))

                //Signalling via SignalR
                if (quickToDo.AssignedTo != null && quickToDo.AssignedTo != this.memberShared.Username) // disable signalr for free members, or take information from memberShared.
                    this.signalService.notifyNewQuickToDo(quickToDo, quickToDo.AssignedTo); // that doesnt send messages to this member. only newCommments send...

            });

        } else {
            this.timeService.getNow().pipe(concatMap(now => {
                if (finish === 0) {
                    quickToDo.Finish = null;
                }
                else if (finish === 1) {
                    quickToDo.Finish = now;
                }

                if (archievedDate === 0) {
                    quickToDo.ArchivedDate = null;
                }
                else if (archievedDate === 1) {
                    quickToDo.ArchivedDate = now;
                }

                return this.service.updateQuickTodo(quickToDo)
            })).subscribe(() => {
                let index = this.myQuickToDos.findIndex(val => val.TaskId == quickToDo.TaskId);
                let oldTodo = this.myQuickToDos.find((val, valIndex, obj) => valIndex == index)
                
                let oldAssignedTo;
                if (oldTodo)
                    oldAssignedTo = oldTodo.AssignedTo;
                else {
                    let oldTodo2 = this.assignedToMe.find(val => val.TaskId == quickToDo.TaskId);
                    if(oldTodo2)
                    oldAssignedTo = oldTodo2.AssignedTo;
                }


                if (-1 != index) // index --> my
                    this.myQuickToDos.splice(index, 1, quickToDo);

                let index2 = this.assignedToMe.findIndex(val => val.TaskId == quickToDo.TaskId);
                if (-1 != index2) // index --> assignedToMe
                    this.assignedToMe.splice(index2, 1, quickToDo);

                let me = this.memberShared.Username;
                let other = (assigned): boolean => { // other = null ve de ben olmayan
                    if (assigned != null && assigned != me)
                        return true;
                    else
                        return false;
                }

                if (oldAssignedTo == quickToDo.AssignedTo) {
                    //assignedTo ve owner değerlerine sadece güncelleme mesajı gönder, hangisinde bulunuyor ise o güncellensin.
                    // null - null X
                    // me - me X
                    //other(same) -other(same)
                    if (other(oldAssignedTo)) // or other(quickToDo.AssignedTo), same..; this will be true for owner
                        this.signalService.notifyNewQuickToDo(quickToDo, quickToDo.AssignedTo, 'update');
                    else // this will be true for task assigned person 
                        this.signalService.notifyNewQuickToDo(quickToDo, quickToDo.Owner, 'update');

                }
                else { // this is a manager area.
                    // oldAssignedTo - assignedTo  // null, me, ,other ;permutations
                    if (oldAssignedTo == null && quickToDo.AssignedTo == me) {
                        this.assignedToMe.push(quickToDo); //#1 add to me, only step.
                    }
                    else if (oldAssignedTo == null && other(quickToDo.AssignedTo)) {
                        this.signalService.notifyNewQuickToDo(quickToDo, quickToDo.AssignedTo, 'new'); //#1 add to other, only step
                    }
                    // null - null permutation belongs to oldAssignedTo == quickToDo.AssignedTo condition

                    else if (oldAssignedTo == me && quickToDo.AssignedTo == null) {
                        this.assignedToMe.splice(index2, 1); // #1 remove from me, only step
                    }
                    else if (oldAssignedTo == me && other(quickToDo.AssignedTo)) {
                        this.assignedToMe.splice(index2, 1);  // #1 remove from me
                        this.signalService.notifyNewQuickToDo(quickToDo, quickToDo.AssignedTo, 'new'); //#2 add to other
                    }
                    // me - me permutation belongs to oldAssignedTo == quickToDo.AssignedTo condition

                    else if (other(oldAssignedTo) && quickToDo.AssignedTo == null) {
                        this.signalService.notifyDeletedQuickToDo(quickToDo, oldAssignedTo);    //#1 remove from oldAssignedTo, only step
                    }
                    else if (other(oldAssignedTo) && quickToDo.AssignedTo == me) {
                        this.signalService.notifyDeletedQuickToDo(quickToDo, oldAssignedTo);    //#1 remove from oldAssignedTo
                        this.assignedToMe.push(quickToDo); //#2 add to me
                    }

                    else if (other(oldAssignedTo) && other(quickToDo.AssignedTo)) {
                        this.signalService.notifyDeletedQuickToDo(quickToDo, oldAssignedTo);    //#1 remove from oldAssignedTo
                        this.signalService.notifyNewQuickToDo(quickToDo, quickToDo.AssignedTo, 'new'); //#2 add to other
                    }
                    // any other permutations belongs to oldAssignedTo == quickToDo.AssignedTo condition

                }


                if (getNext == true) {
                    quickToDo.Order = this.getNext();
                    //quickToDo.Order  = 0;
                    this.saveQuickToDo(quickToDo);
                }
            });

        }
    }
    saveQuickToDoViaSignalR(quickToDo: QuickTask) { // Other person can assign task asyncly, but no need to do the same for myQuickToDos because others can not add into this area(my quick to dos(created)).

        let index = this.assignedToMe.findIndex(val => val.TaskId == quickToDo.TaskId)
        if (-1 == index) // Assigned task is not founded on repository
        {
            if (this.memberShared.Username == quickToDo.AssignedTo) {
                this.assignedToMe.push(quickToDo);

                //comment count 
                this.service.myAndAssignedToMeQTCommentsCount().subscribe((ccm: CommentCountModel[]) => {
                    if (ccm) {
                        let commentsCount = ccm.find(ccm => ccm.TaskId == quickToDo.TaskId)
                        if (commentsCount) {
                            let indexC = this.qtCommentsCount.findIndex(val => val.TaskId == quickToDo.TaskId);
                            if (indexC == -1)
                                this.qtCommentsCount.push(new CommentCountModel(commentsCount.CommentsCount, quickToDo.TaskId))  // <<< problem is here in update operations.
                            else {
                                this.qtCommentsCount.splice(indexC, 1, new CommentCountModel(commentsCount.CommentsCount, quickToDo.TaskId));
                            }
                        }
                    }
                })
                //end of comment count 

            }

        }
        else { // Founded on repository, just changes with what's sent( update mechanism), can be used for Complete, Add and Update events at all at the same time easily.
            this.assignedToMe.splice(index, 1, quickToDo); //change appearance   
        }
        let index2 = this.myQuickToDos.findIndex(val => val.TaskId == quickToDo.TaskId);
        if (-1 != index2) {
            this.myQuickToDos.splice(index2, 1, quickToDo);
        }

        let tempMyQt = Object.assign([], this.myQuickToDos.sort((qt1, qt2) => qt1.Order - qt2.Order))
        this.myQuickToDos.splice(0, this.myQuickToDos.length);
        this.myQuickToDos.push(...tempMyQt)

        let tempQtA = Object.assign([], this.assignedToMe.sort((qt1, qt2) => qt1.Order - qt2.Order))
        this.assignedToMe.splice(0, this.assignedToMe.length);
        this.assignedToMe.push(...tempQtA);

        // this.myQuickToDos = this.myQuickToDos.sort((qt1, qt2) => qt1.Order - qt2.Order);
        // this.assignedToMe = this.assignedToMe.sort((qt1, qt2) => qt1.Order - qt2.Order);
    }
    deleteQuickToDoViaSignalR(quickToDo: QuickTask) {
        let index: number = this.assignedToMe.findIndex(value => value.TaskId == quickToDo.TaskId)
        if (-1 != index) {
            this.assignedToMe.splice(index, 1);

            //comment count 
            let indexC = this.qtCommentsCount.findIndex(val => val.TaskId == quickToDo.TaskId);
            if (indexC != -1)
                this.qtCommentsCount.splice(indexC, 1);
        }

    }
    // public closeHubConnection() {
    //     this.signalService.closeHubConnection();
    //     this.commentSignalService.closeHubConnection();
    // }
    // public openHubConnection() {
    //     this.signalService.openHubConnection();
    //     this.commentSignalService.openHubConnection();
    // }



}