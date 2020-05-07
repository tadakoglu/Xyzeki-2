import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { from, of, Observable, BehaviorSubject, zip, combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PrivateTalksService } from '../private-talks.service';
import { PrivateTalkRepository } from '../../repository/private-talk-repository';

@Injectable()
export class PrivateTalkMessagesGuardService implements CanActivate {

  constructor(private repositoryPT: PrivateTalkRepository, private router: Router, private service: PrivateTalksService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

    let privateTalkId: number = Number.parseInt(route.params['PrivateTalkId'])

    return combineLatest([this.service.isMyPrivateTalk(privateTalkId), this.service.isPrivateTalkJoined(privateTalkId)]).pipe(map((responses) => {
      if (responses[0] || responses[1])
        return true;
      else {
        this.router.navigate(['/is-konusmalari']);
        return false;
      }

    }), catchError((err) => {
      this.router.navigate(['/giris']); // is member doesn't logged in, so service will throw an error, then run catch error function.
      return of(false);
    }))



  }
}

 // https://stackoverflow.com/questions/43462851/angular-2-canactivate-with-a-promise-hitting-a-remote-service