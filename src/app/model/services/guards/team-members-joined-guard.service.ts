import { Injectable, ReflectiveInjector, Injector } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { TeamRepository } from '../../repository/team-repository';
import { TeamsService } from '../teams.service';
import { from, of, Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MemberShared } from '../../member-shared.model';

@Injectable()
export class TeamMembersJoinedGuardService implements CanActivate {

  constructor(private router: Router, private service: TeamsService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    let teamId: number = Number.parseInt(route.params['TeamId'])

    return this.service.isTeamJoined(teamId).pipe(map(response => {
      if(response)
        return true;
      else {
        this.router.navigate(['/takimlar/gelen-takim-davetiyeleri']);
        return false;
      }

    }), catchError((err) => {
      this.router.navigate(['/giris']); // is member doesn't logged in, so service will throw an error, then run catch error function.
      return of(false);
    }))

  }

}

//ref https://stackoverflow.com/questions/37948068/angular-2-routing-canactivate-work-with-observable