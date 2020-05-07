import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { MemberShared } from '../../member-shared.model';
import { PrivateTalkMessage } from '../../private-talk-message.model';

@Injectable()
export class SaveLastSeenGuardService implements CanDeactivate<PrivateTalkMessage> {
  canDeactivate(
    component: PrivateTalkMessage,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
  /**
   *
   */
  constructor(private memberShared: MemberShared) {


  }
}

