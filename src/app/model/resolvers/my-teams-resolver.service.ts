import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TeamsService } from '../services/teams.service';
import { catchError, take } from 'rxjs/operators';
import { empty, Observable } from 'rxjs';

@Injectable()
export class MyTeamsResolverService implements Resolve<any> {
  constructor(private service: TeamsService) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.service.myTeams().pipe(catchError((error) => {
      return empty();
    }), take(1))
  }
}
