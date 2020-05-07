import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MemberShared } from '../../member-shared.model';
import { resolve } from 'q';
import { isNullOrUndefined } from 'util';

@Injectable()
export class AuthGuardService implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    ///let url = route.url;

    if (this.memberShared.isValidToken() && this.memberShared.LoggedIn) {
      return true;
    }
    else {
      // localStorage.removeItem("Xyzeki_JWTToken");
      this.memberShared.LoggedIn = false;
      this.memberShared.tokenStr=undefined;
      this.router.navigateByUrl('/giris');
      return false;
    }

    // return new Promise((resolve) => {
    //   if (this.memberShared.LoggedIn)
    //     resolve(true);
    //   else
    //     resolve(false);
    // })
  }


  constructor(private router: Router, private memberShared: MemberShared) { }



}
