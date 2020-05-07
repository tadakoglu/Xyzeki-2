import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, take } from 'rxjs/operators';
import { empty, Observable } from 'rxjs';
import { ProjectsService } from '../services/projects.service';

@Injectable()
export class ProjectsAssignedResolverService implements Resolve<any> {
  constructor(private service: ProjectsService) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.service.myProjectsAssigned().pipe(catchError((error) => {
      return empty();
    }), take(1))
  }
}
