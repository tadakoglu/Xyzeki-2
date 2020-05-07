import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, take } from 'rxjs/operators';
import { empty, Observable } from 'rxjs';
import { ProjectToDosService } from '../services/project-to-dos.service';

@Injectable()
export class ProjectToDosCommentsCountResolverService implements Resolve<any> {
  constructor(private service: ProjectToDosService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    let projectId = Number.parseInt(route.paramMap.get('ProjectId'))
    return this.service.projectToDosCommentsCount(projectId).pipe(catchError((error) => {
      return empty();
    }), take(1))
  }
}
