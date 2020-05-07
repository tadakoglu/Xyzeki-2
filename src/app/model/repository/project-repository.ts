import { Injectable } from '@angular/core';
import { IProjectRepository } from '../abstract/i-project-repository';
import { Project } from '../project.model';
import { ProjectsService } from '../services/projects.service';
import { MemberShared } from '../member-shared.model';
import { PrivacyModes } from 'src/infrastructure/project-privacy-modes';
import { ProjectOrderModel } from '../project-order.model';
import { DataService } from '../services/shared/data.service';
import { XyzekiSignalrService } from '../signalr-services/xyzeki-signalr.service';

@Injectable()
export class ProjectRepository implements IProjectRepository {
    constructor(private service: ProjectsService, private signalService: XyzekiSignalrService, private memberShared: MemberShared, private dataService: DataService) { // signalr for selecting project manager

        this.loadProjects();

        this.signalService.deletedProjectAvailable.subscribe(project => {
            this.deleteProjectViaSignalR(project);
        })
        this.signalService.newProjectAvailable.subscribe(project => {
            this.saveProjectViaSignalR(project);
        })
        this.signalService.projectReOrderingAvailable.subscribe(POMs => {
            this.savePOMs(POMs);
        })
        this.dataService.reloadAllOnTeamDestroyEvent.subscribe(() => { this.loadProjects(); });
    }
    loadProjects() { // ## load this when team comp destroyed.
        this.service.myProjects().subscribe(projects => {
            let tempP = Object.assign([], projects.sort((pt1, pt2) => pt1.Order - pt2.Order));
            this.myProjects.splice(0, this.myProjects.length);
            this.myProjects.push(...tempP);
            //this.myProjects = projects.sort((pt1, pt2) => pt1.Order - pt2.Order);
            this.loading = false;
        }
        );

        this.service.myProjectsAssigned().subscribe(projectsAssigned => {
            let tempPTA = Object.assign([], projectsAssigned.sort((pt1, pt2) => pt1.Order - pt2.Order))
            this.myProjectsAssigned.splice(0, this.myProjectsAssigned.length);
            this.myProjectsAssigned.push(...tempPTA)
            //this.myProjectsAssigned = projectsAssigned.sort((pt1, pt2) => pt1.Order - pt2.Order)

        });
    }

    loadMyProjectsViaResolver(myProjects: Project[]) {
        let tempP = Object.assign([], myProjects.sort((pt1, pt2) => pt1.Order - pt2.Order));
        this.myProjects.splice(0, this.myProjects.length);
        this.myProjects.push(...tempP);
    }
    loadProjectsAssignedViaResolver(projectsAssigned: Project[]) {
        let tempPTA = Object.assign([], projectsAssigned.sort((pt1, pt2) => pt1.Order - pt2.Order))
        this.myProjectsAssigned.splice(0, this.myProjectsAssigned.length);
        this.myProjectsAssigned.push(...tempPTA)
    }

    private myProjects: Project[] = []
    private myProjectsAssigned: Project[] = []


    getProject(projectId): Project {
        return this.myProjects.find(p => p.ProjectId == projectId);
    }
    public loading = true;


    getProjectAssigned(projectId): Project {
        return this.getMyProjectsAssigned().find(p => p.ProjectId == projectId);
    }

    getMyProjects(): Project[] {
        return this.myProjects;
    }
    public reOrdering = false;
    reOrderAndSaveP() { //Reordering projects
        try {
            this.reOrdering = true;
            let order: number = 0;
            let POMs: ProjectOrderModel[] = []
            let projects: Project[] = []
            this.myProjects.forEach(p => {
                let POM: ProjectOrderModel = new ProjectOrderModel(order, p.ProjectId);
                let proj: Project = Object.assign({}, p); proj.Order = order;

                POMs.push(POM);
                projects.push(proj);
                order++
            })

            this.service.saveAllPOMs(POMs).subscribe(response => {
                if (response == true) {
                    this.myProjects = projects
                    this.reOrdering = false;
                    this.signalService.notifyProjectReOrdering(POMs);
                } else {
                    this.reOrdering = false;
                }
            })

        } catch (error) { this.reOrdering = false; }


    }
    savePOMs(POMs: ProjectOrderModel[]) {
        try {
            this.reOrdering = true;
            POMs.forEach(POM => {
                let projAssigned = this.myProjectsAssigned.find(pa => pa.ProjectId == POM.ProjectId)
                if (projAssigned)
                    projAssigned.Order = POM.Order;
                this.reOrdering = false;
            })

            let tempPTA = Object.assign([], this.myProjectsAssigned.sort((p1, p2) => p1.Order - p2.Order));
            this.myProjectsAssigned.splice(0, this.myProjectsAssigned.length);
            this.myProjectsAssigned.push(...tempPTA)

            //this.myProjectsAssigned = this.myProjectsAssigned.sort((p1, p2) => p1.Order - p2.Order);

        } catch (error) { this.reOrdering = false; }

    }

    // getMyProjectsAssigned(): Project[] { // Privacy filtreleme işini front endde yapıyorum yoksa sorunlar çıkıyor.
    //     return this.myProjectsAssigned.filter(p => p.Privacy != PrivacyModes.onlyOwner && (
    //         p.Privacy == PrivacyModes.open // ve eğer içinde bulunuyorsa
    //         || p.Privacy == PrivacyModes.listMode // ve eğer içinde bulunuyorsa
    //         || (p.Privacy == PrivacyModes.onlyOwnerAndPM && p.ProjectManager == this.memberShared.Username)
    //         || (p.Privacy == PrivacyModes.openOnlyTasks && p.ProjectManager == this.memberShared.Username)))
    // }
    getMyProjectsAssigned(): Project[] { // Privacy filtreleme işini front endde yapıyorum yoksa sorunlar çıkıyor.
        return this.myProjectsAssigned
    }

    getMyProjectsAssignedWithoutPrivacyFilter() {
        return this.myProjectsAssigned;
    }
    // getMyProjectsAssignedIncludingOpenOnlyTasks(): Project[] {
    //     return this.myProjectsAssigned;
    // }

    // getNext(): number {
    //     let projects = this.myProjects;
    //     if (projects.length >= 1) {
    //         let nextIndex = projects[projects.length - 1].Order + 1;
    //         return nextIndex;
    //     } else {
    //         return 0;
    //     }
    // }
    getNext(): number {
        let pts = this.myProjects
        if (pts.length >= 1) {
            let nextIndex = Math.min(...pts.map(pt => pt.Order)) - 1
            //let nextIndex = pts.sort((pt1, pt2) => pt1.Order - pt2.Order).find((val, index, obj) => index == 0).Order - 1;
            return nextIndex;
        } else {
            return 0;
        }
    }
    saveProject(project: Project) {

        if (project.ProjectId == 0 || project.ProjectId == null) {
            project.Order = this.getNext();
            // project.Order = 0;
            this.service.saveProject(project).subscribe((projectId) => {
                project.ProjectId = projectId;
                this.myProjects.unshift(project);
            })
        }
        else {
            this.service.updateProject(project).subscribe(() => {

                this.signalService.notifyDeletedProject(project, true); // remove old from all company. we use this because it's hard to keep the list of old assignees and old project todos to delete the project from.
                this.signalService.notifyNewProject(project)// all receivers + oldPM                

                let index = this.myProjects.findIndex(val => val.ProjectId == project.ProjectId);
                if (-1 != index)
                    this.myProjects.splice(index, 1, project);
            })
        }
    }
    deleteProject(projectId: number) {

        let proj: Project = this.myProjects.find(val => val.ProjectId == projectId);
        if (proj != undefined)
            this.signalService.notifyDeletedProject(proj)
        // We need to wait for result and then start delete from server. Use "then" on SignalR Angular invoke method.

        this.service.deleteProject(projectId).subscribe(project => {


            let index: number = this.myProjects.findIndex(value => value.ProjectId == projectId)
            if (-1 != index)
                this.myProjects.splice(index, 1);
        })
    }


    saveProjectViaSignalR(project: Project) {

        let index = this.myProjectsAssigned.findIndex(val => val.ProjectId == project.ProjectId)
        if (-1 == index) {
            this.myProjectsAssigned.push(project);
        }
        else { // Founded on repository, just changes with what's sent( update mechanism), can be used for Complete, Add and Update events at all at the same time easily.

            this.myProjectsAssigned.splice(index, 1, project); //change appearance    

        }

        let tempPTA = Object.assign([], this.myProjectsAssigned.sort((p1, p2) => p1.Order - p2.Order));
        this.myProjectsAssigned.splice(0, this.myProjectsAssigned.length);
        this.myProjectsAssigned.push(...tempPTA);
        //this.myProjectsAssigned = this.myProjectsAssigned.sort((p1, p2) => p1.Order - p2.Order);

        let index2 = this.myProjects.findIndex(val => val.ProjectId == project.ProjectId)
        if (-1 != index2) { // Founded on repository, just changes with what's sent( update mechanism), can be used for Complete, Add and Update events at all at the same time easily.
            this.myProjects.splice(index2, 1, project); //change appearance    
        }


    }
    deleteProjectViaSignalR(project: Project) {
        let index = this.myProjectsAssigned.findIndex(val => val.ProjectId == project.ProjectId)
        if (-1 != index) {
            this.myProjectsAssigned.splice(index, 1);
        }
    }


}
