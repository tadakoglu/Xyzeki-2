import { IProjectToDoRepository } from '../abstract/i-project-to-do-repository';
import { ProjectTask } from '../project-task.model';
import { ProjectToDosService } from '../services/project-to-dos.service';
import { MemberShared } from '../member-shared.model';
import { CommentCountModel } from '../comment-count.model';
import { Project } from '../project.model';
import { ProjectRepository } from './project-repository';
import { PrivacyModes } from 'src/infrastructure/project-privacy-modes';
import { TaskOrderModel } from '../task-order.model';
import { DataService } from '../services/shared/data.service';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { TimeService } from '../services/time.service';
import { concatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';


@Injectable()
export class ProjectToDoRepository implements IProjectToDoRepository {


    constructor(private service: ProjectToDosService, private signalService: XyzekiSignalrService, private memberShared: MemberShared,
        private commentSignalService: XyzekiSignalrService, private projectSignalService: XyzekiSignalrService,
        private projectRepository: ProjectRepository, private dataService: DataService, private timeService: TimeService) {

        this.loadAll();

        this.signalService.deletedProjectToDoAvailable.subscribe(projectToDo => {
            this.deleteProjectToDoViaSignalR(projectToDo);
        })
        this.signalService.newProjectToDoAvailable.subscribe(projectToDo => {
            this.saveProjectToDoViaSignalR(projectToDo);
        })
        this.signalService.projectToDoReOrderingAvailable.subscribe(([TOMs, projectId]) => {
            this.saveTOMs(TOMs, projectId);
        })

        this.commentSignalService.newProjectToDoCommentAvailable.subscribe(ptComment => {
            if (ptComment && "new" == ptComment[1]) {
                let ptComments: CommentCountModel = this.ptCommentsCount.find(commentCountModel => commentCountModel.TaskId == ptComment[0].TaskId);
                if (ptComments)
                    ptComments.CommentsCount++;

                let ptAssignedComments: CommentCountModel = this.ptAssignedCommentsCount.find(commentCountModel => commentCountModel.TaskId == ptComment[0].TaskId);
                if (ptAssignedComments)
                    ptAssignedComments.CommentsCount++;

            }

        })
        this.commentSignalService.deletedProjectToDoCommentAvailable.subscribe(ptComment => {
            if (ptComment) {
                let ptComments: CommentCountModel = this.ptCommentsCount.find(commentCountModel => commentCountModel.TaskId == ptComment.TaskId);
                if (ptComments)
                    ptComments.CommentsCount--;

                let ptAssignedComments: CommentCountModel = this.ptAssignedCommentsCount.find(commentCountModel => commentCountModel.TaskId == ptComment.TaskId);
                if (ptAssignedComments)
                    ptAssignedComments.CommentsCount--;
            }
        })

        this.dataService.reloadAllOnTeamDestroyEvent.subscribe(() => { this.loadAll(); });

    }

    loadProjectsToDosViaResolver(projectToDos: ProjectTask[], projectId: number) {
        this.projectId = projectId;
        let tempPT = Object.assign([], projectToDos.sort((pt1, pt2) => pt1.Order - pt2.Order));
        this.projectToDos.splice(0, this.projectToDos.length);
        this.projectToDos.push(...tempPT);
    }
    loadProjectsToDosCommentsCountViaResolver(ptCommentsCount: CommentCountModel[]) {
        this.ptCommentsCount.splice(0, this.ptCommentsCount.length);
        this.ptCommentsCount.push(...ptCommentsCount);
    }

    loadProject(projectId: number) {
        this.projectId = projectId;
        this.service.projectToDos(projectId).subscribe(projectTodos => {
            let tempPT = Object.assign([], projectTodos.sort((pt1, pt2) => pt1.Order - pt2.Order));
            this.projectToDos.splice(0, this.projectToDos.length);
            this.projectToDos.push(...tempPT);
            //this.projectToDos = projectTodos.sort((pt1, pt2) => pt1.Order - pt2.Order);

        });
        this.service.projectToDosCommentsCount(projectId).subscribe(ptCommentsCount => {
            this.ptCommentsCount.splice(0, this.ptCommentsCount.length);
            this.ptCommentsCount.push(...ptCommentsCount);
            //this.ptCommentsCount = ptCommentsCount;
        })
    }

    private projectId: number

    deepSearch(searchValue?: string) {
        this.loadAll(searchValue)
    }

    loadAll(searchValue?: string) { // ### Reload this when team component destroyed
        this.service.projectToDosAssignedToMe(searchValue).subscribe(assignedToMe => {
            let PTA = Object.assign([], assignedToMe.sort((qt1, qt2) => qt1.Order - qt2.Order))

            this.projectToDosAssignedToMe.splice(0, this.projectToDosAssignedToMe.length)
            this.projectToDosAssignedToMe.push(...PTA);

            //this.projectToDosAssignedToMe = assignedToMe.sort((qt1, qt2) => qt1.Order - qt2.Order);
        })

        this.service.assignedToMePTCommentsCount(searchValue).subscribe(ptAssignedCommentsCount => {
            this.ptAssignedCommentsCount.splice(0, this.ptAssignedCommentsCount.length);
            this.ptAssignedCommentsCount.push(...ptAssignedCommentsCount);

            //this.ptAssignedCommentsCount = ptAssignedCommentsCount;
        })
    }
    private projectToDos: ProjectTask[] = []
    private projectToDosAssignedToMe: ProjectTask[] = []

    private ptAssignedCommentsCount: CommentCountModel[] = [];
    private ptCommentsCount: CommentCountModel[] = [];

    public reOrdering = false;
    reOrderAndSavePT(projectId) { //Reordering project to-dos      
        try {
            this.reOrdering = true;
            let order: number = 0;
            let TOMs: TaskOrderModel[] = []
            let pTasks: ProjectTask[] = []
            this.projectToDos.forEach(pt => {
                let TOM: TaskOrderModel = new TaskOrderModel(order, pt.TaskId);
                let pTask: ProjectTask = Object.assign({}, pt); pTask.Order = order;

                TOMs.push(TOM);
                pTasks.push(pTask);
                order++
            })

            this.service.saveAllTOMs(TOMs, projectId).subscribe(response => {
                if (response == true) {
                    //this.projectToDos = pTasks
                    pTasks.forEach(pt => {
                        let t = this.projectToDos.find(val => val.TaskId == pt.TaskId);
                        if (t) {
                            t.Order = pt.Order;
                        }
                        // let t2 = this.projectToDosAssignedToMe.find(val => val.TaskId == pt.TaskId);
                        // if (t2) {
                        //     t2.Order = pt.Order;
                        // }
                    })
                    this.reOrdering = false;
                    this.signalService.notifyProjectToDoReOrdering(TOMs, projectId);
                } else {
                    this.reOrdering = false;
                }
            })

        } catch (error) { this.reOrdering = false; }


    }
    saveTOMs(TOMs: TaskOrderModel[], projectId: number) {
        if (this.projectId != projectId)
            return;

        try {
            this.reOrdering = true;
            let pTask: ProjectTask = null;
            //let pTaskAss: ProjectTask = null;
            TOMs.forEach(TOM => {
                pTask = this.projectToDos.find(pt => pt.TaskId == TOM.TaskId);
                if (pTask)
                    pTask.Order = TOM.Order;

                // pTaskAss = this.projectToDosAssignedToMe.find(pt => pt.TaskId == TOM.TaskId);
                // if (pTaskAss)
                //     pTaskAss.Order = TOM.Order;
            })

            let tempPT = Object.assign([], this.projectToDos.sort((pt1, pt2) => pt1.Order - pt2.Order));
            this.projectToDos.splice(0, this.projectToDos.length);
            this.projectToDos.push(...tempPT);
            //this.projectToDos = this.projectToDos.sort((pt1, pt2) => pt1.Order - pt2.Order);

            this.reOrdering = false;

        } catch (error) { this.reOrdering = false; }

    }

    getProjectToDos(): ProjectTask[] {
        return this.projectToDos;
    }
    getProjectSpecial(projectId): Project {
        let proj: Project = this.projectRepository.getProject(projectId);
        if (proj == undefined)
            proj = this.projectRepository.getMyProjectsAssignedWithoutPrivacyFilter().find(p => p.ProjectId == projectId)
        return proj;

    }


    filterBasedOnProject = (pt: ProjectTask) => {
        if (this.getProjectSpecial(pt.ProjectId) && this.getProjectSpecial(pt.ProjectId).Privacy != PrivacyModes.listMode && ((this.getProjectSpecial(pt.ProjectId).Privacy == PrivacyModes.onlyOwner && this.getProjectSpecial(pt.ProjectId).Owner == this.memberShared.Username) ||
            (this.getProjectSpecial(pt.ProjectId).Privacy == PrivacyModes.onlyOwnerAndPM && (this.getProjectSpecial(pt.ProjectId).ProjectManager == this.memberShared.Username || this.getProjectSpecial(pt.ProjectId).Owner == this.memberShared.Username))
            || (this.getProjectSpecial(pt.ProjectId).Privacy == PrivacyModes.open) || (this.getProjectSpecial(pt.ProjectId).Privacy == PrivacyModes.openOnlyTasks)))
            return pt;
    }

    getProjectToDosAssignedToMe(): ProjectTask[] { // openOnlyTasks olunda proje boş oluyor halile
        return this.projectToDosAssignedToMe.filter(this.filterBasedOnProject)
    }
    //comments count.
    getPTAssignedCommentsCount(): CommentCountModel[] {
        return this.ptAssignedCommentsCount;
    }
    getPTCommentsCount(): CommentCountModel[] {
        return this.ptCommentsCount;
    }
    getProject(projectId): Project {
        let p = this.projectRepository.getProject(projectId)
        if (p == undefined)
            p = this.projectRepository.getProjectAssigned(projectId);
        return p;
    }

    getNext(): number {
        let pts = this.projectToDos
        if (pts.length >= 1) {
            let nextIndex = Math.max(...pts.map(pt => pt.Order)) + 1
            //let nextIndex = pts.sort((pt1, pt2) => pt2.Order - pt1.Order).find((val, index, obj) => index == 0).Order + 1;
            //let nextIndex = qts[qts.length - 1].Order + 1;
            return nextIndex;
        } else {
            return 0;
        }
    }
    checkOwnerOrProjectManager(taskId) {
        let pTask = this.projectToDos.find(val => val.TaskId == taskId);

        let isOwner: boolean = this.getProject(pTask.ProjectId).Owner == this.memberShared.Username;
        if (isOwner)
            return true;

        // proje yöneticisi izin ver
        let isProjectManager: boolean = this.getProject(pTask.ProjectId).ProjectManager == this.memberShared.Username;
        if (isProjectManager)
            return true;

        return false;
    }
    checkPrivilege(pTask: ProjectTask): boolean {
        // sahip ise izin ver
        let isOwner: boolean = this.getProject(pTask.ProjectId).Owner == this.memberShared.Username;
        if (isOwner)
            return true;

        // proje yöneticisi izin ver
        let isProjectManager: boolean = this.getProject(pTask.ProjectId).ProjectManager == this.memberShared.Username;
        if (isProjectManager)
            return true;


        // sahip değilse ve de proje yöneticisi değilse, eğer sadece state, isCompleted,finished değişmişsse ve de ona atanmış ise izin ver.
        let pTaskOld: ProjectTask = Object.assign({}, this.projectToDos.find(val => val.TaskId == pTask.TaskId));
        let assignedToMe: boolean = pTask.AssignedTo == this.memberShared.Username;
        let isNotAndOnlyStateAndCompletedChanged: boolean = !isOwner && !isProjectManager && assignedToMe && (
            pTaskOld.Archived == pTask.Archived && pTaskOld.AssignedTo == pTask.AssignedTo
            && pTaskOld.Deadline == pTask.Deadline
            && pTaskOld.Order == pTask.Order && pTaskOld.ProjectId == pTask.ProjectId
            && pTaskOld.ShowSubTasks == pTask.ShowSubTasks && pTaskOld.Start == pTask.Start
            && pTaskOld.TaskDescription == pTask.TaskDescription && pTaskOld.TaskId == pTask.TaskId
            && pTaskOld.TaskTitle == pTask.TaskTitle && pTaskOld.Zindex == pTask.Zindex);

        if (isNotAndOnlyStateAndCompletedChanged)
            return true;


        return false;

    }



    saveProjectToDo(projectTask: ProjectTask, fromHomePage: boolean = false, finish = undefined) {
        if (!this.checkPrivilege(projectTask) && !fromHomePage)
            return;

        if (projectTask.TaskId == 0 || projectTask.TaskId == null) {
            projectTask.Order = this.getNext();

            this.timeService.getNow().pipe(concatMap(now => {
                if (finish === 0) {
                    projectTask.Finish = null;
                }
                else if (finish === 1) {
                    projectTask.Finish = now;
                }

                return this.service.saveProjectToDo(projectTask)
            })).subscribe(projectToDoId => {

                projectTask.TaskId = projectToDoId;
                this.projectToDos.push(projectTask);

                if (projectTask.AssignedTo == this.memberShared.Username) // if assigned to me and not exists in assignedTo repo.
                    this.projectToDosAssignedToMe.push(projectTask);

                this.ptCommentsCount.push(new CommentCountModel(0, projectToDoId))

                // to owner, project manager, project insiders(signalR service will not send to this user.)
                this.signalService.notifyNewProjectToDo(projectTask);
            });


        }
        else {
            this.timeService.getNow().pipe(concatMap(now => {
                if (finish === 0) {
                    projectTask.Finish = null;
                }
                else if (finish === 1) {
                    projectTask.Finish = now;
                }

                return this.service.updateProjectToDo(projectTask)
            })).subscribe(() => {

                let index = this.projectToDos.findIndex(value => value.TaskId == projectTask.TaskId)
                if (index != -1)
                    this.projectToDos.splice(index, 1, projectTask);

                let index2 = this.projectToDosAssignedToMe.findIndex(value => value.TaskId == projectTask.TaskId)
                if (index2 != -1)
                    this.projectToDosAssignedToMe.splice(index2, 1, projectTask);

                this.signalService.notifyDeletedProjectToDo(projectTask);
                this.signalService.notifyNewProjectToDo(projectTask);


            })

        }
    }
    saveProjectToDoViaSignalR(projectToDo: ProjectTask) {

        let index = this.projectToDosAssignedToMe.findIndex(val => val.TaskId == projectToDo.TaskId)
        if (-1 == index) // Assigned task is not founded on repository
        {
            if (this.memberShared.Username == projectToDo.AssignedTo) {
                this.projectToDosAssignedToMe.push(projectToDo);
                //comment count 
                this.service.assignedToMePTCommentsCount().subscribe((ccm: CommentCountModel[]) => {
                    if (ccm) {
                        let commentsCount = ccm.find(ccm => ccm.TaskId == projectToDo.TaskId)
                        if (commentsCount) {
                            let indexC = this.ptAssignedCommentsCount.findIndex(val => val.TaskId == projectToDo.TaskId);
                            if (indexC == -1)
                                this.ptAssignedCommentsCount.push(new CommentCountModel(commentsCount.CommentsCount, projectToDo.TaskId))
                            else {
                                this.ptAssignedCommentsCount.splice(indexC, 1, new CommentCountModel(commentsCount.CommentsCount, projectToDo.TaskId));
                            }
                        }
                    }
                })
                //end of comment count 
            }

        }
        else { // Founded on repository, just changes with what's sent( update mechanism), can be used for Complete, Add and Update events at all at the same time easily.
            this.projectToDosAssignedToMe.splice(index, 1, projectToDo); //change appearance    
        }

        let tempA = Object.assign([], this.projectToDosAssignedToMe.sort((pt1, pt2) => pt1.Order - pt2.Order))
        this.projectToDosAssignedToMe.splice(0, this.projectToDosAssignedToMe.length);
        this.projectToDosAssignedToMe.push(...tempA);
        //this.projectToDosAssignedToMe = this.projectToDosAssignedToMe.sort((pt1, pt2) => pt1.Order - pt2.Order);

        if (this.projectId != projectToDo.ProjectId)
            return;

        let index2 = this.projectToDos.findIndex(value => value.TaskId == projectToDo.TaskId)
        if (-1 == index2) {
            this.projectToDos.push(projectToDo);

            //comment count 
            this.service.projectToDosCommentsCount(this.projectId).subscribe((ccm: CommentCountModel[]) => {
                if (ccm) {
                    let commentsCount = ccm.find(ccm => ccm.TaskId == projectToDo.TaskId)
                    if (commentsCount) {
                        let indexC = this.ptCommentsCount.findIndex(val => val.TaskId == projectToDo.TaskId);
                        if (indexC == -1)
                            this.ptCommentsCount.push(new CommentCountModel(commentsCount.CommentsCount, projectToDo.TaskId))
                        else {
                            this.ptCommentsCount.splice(indexC, 1, new CommentCountModel(commentsCount.CommentsCount, projectToDo.TaskId));
                        }
                    }
                }
            })
            //end of comment count 
        }
        if (-1 != index2)
            this.projectToDos.splice(index2, 1, projectToDo);


        let tempPT = Object.assign([], this.projectToDos.sort((pt1, pt2) => pt1.Order - pt2.Order))
        this.projectToDos.splice(0, this.projectToDos.length);
        this.projectToDos.push(...tempPT);
        //this.projectToDos = this.projectToDos.sort((pt1, pt2) => pt1.Order - pt2.Order);
    }
    deleteProjectToDoViaSignalR(projectToDo: ProjectTask) {
        let index: number = this.projectToDosAssignedToMe.findIndex(value => value.TaskId == projectToDo.TaskId)
        if (-1 != index) {
            this.projectToDosAssignedToMe.splice(index, 1);

            //comment count 
            let indexC = this.ptAssignedCommentsCount.findIndex(val => val.TaskId == projectToDo.TaskId);
            if (indexC != -1)
                this.ptAssignedCommentsCount.splice(indexC, 1);
        }

        let index2: number = this.projectToDos.findIndex(value => value.TaskId == projectToDo.TaskId);
        if (-1 != index2) {
            this.projectToDos.splice(index2, 1);

            //comment count 
            let indexC = this.ptCommentsCount.findIndex(val => val.TaskId == projectToDo.TaskId);
            if (indexC != -1)
                this.ptCommentsCount.splice(indexC, 1);
        }

    }
    deleteProjectToDo(taskId: number) { // to owner, to manager, to other project shareholders
        let pTask: ProjectTask = this.projectToDos.find(value => value.TaskId == taskId);

        if ((this.getProject(pTask.ProjectId).Owner != this.memberShared.Username) && (this.getProject(pTask.ProjectId).ProjectManager != this.memberShared.Username))
            return;

        if (pTask)
            this.signalService.notifyDeletedProjectToDo(pTask);

        this.service.deleteProjectToDo(taskId).subscribe(projectTask => {
            let index: number = this.projectToDos.findIndex(value => value.TaskId == projectTask.TaskId);
            if (-1 != index)
                this.projectToDos.splice(index, 1);



            //comment count 
            let indexC = this.ptCommentsCount.findIndex(val => val.TaskId == taskId);
            if (indexC != -1)
                this.ptCommentsCount.splice(indexC, 1);
        })
    }



}
