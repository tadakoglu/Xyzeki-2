import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../../member-shared.model';

@Injectable()
export class AuthGuardAdminService implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url = route.url;
    if (this.memberShared.Username == 'tadakoglu')
      return true;
    this.router.navigateByUrl('/giris');
    return false;
  }

  constructor(private router: Router, private memberShared: MemberShared) { }



}
