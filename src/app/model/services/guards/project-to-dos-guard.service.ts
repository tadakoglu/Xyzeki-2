import { Injectable, ReflectiveInjector, Injector } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { from, of, Observable, BehaviorSubject, forkJoin, combineLatest } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { ProjectsService } from '../projects.service';

@Injectable()
export class ProjectToDosGuardService implements CanActivate {

  constructor(private router: Router, private service: ProjectsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    let projectId: number = Number.parseInt(route.params['ProjectId'])
    let isShared: boolean = route.fragment == 'shared'

    if (isShared) {
      return this.service.isProjectAssigned(projectId).pipe(map(response => {
        if (response)
          return true;
        else {
          this.router.navigate(['/projeler']);
          return false;
        }
      }), catchError((err) => {
        this.router.navigate(['/giris']); // is member doesn't logged in, so service will throw an error, then run catch error function.
        return of(false);
      }))
    } else {
      return this.service.isMyProject(projectId).pipe(map(response => {
        if (response)
          return true;
        else {
          this.router.navigate(['/projeler']);
          return false;
        }
      }), catchError((err) => {
        this.router.navigate(['/giris']); // is member doesn't logged in, so service will throw an error, then run catch error function.
        return of(false);
      }))
    }

  }

}

//ref https://stackoverflow.com/questions/37948068/angular-2-routing-canactivate-work-with-observable



    // let projectId: number = Number.parseInt(route.params['ProjectId'])
    // return combineLatest([this.service.myProjects(), this.service.myProjectsAssigned()]).pipe(map((projects) => {
    //   let index = projects[0].findIndex((val, index, arr) => val.ProjectId == projectId);
    //   let index2 = projects[1].findIndex((val, index, arr) => val.ProjectId == projectId);
    //   if (-1 != index || -1 != index2) // there exists
    //     return true;
    //   else {
    //     this.router.navigate(['/projeler']);
    //     return false;
    //   }

    // }), catchError((err) => {
    //   this.router.navigate(['/giris']); // is member doesn't logged in, so service will throw an error, then run catch error function.
    //   return of(false);
    // }))
