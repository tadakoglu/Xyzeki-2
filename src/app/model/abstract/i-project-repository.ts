import { Injectable } from '@angular/core';
import { Project } from '../project.model';

@Injectable()
export abstract class IProjectRepository {
    abstract getMyProjects(): Project[]  
    abstract getMyProjectsAssigned(): Project[]  
    abstract getProject(projectId): Project
    abstract saveProject(project: Project)
    abstract deleteProject(projectId: number)
}
