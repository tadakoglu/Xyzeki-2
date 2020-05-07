import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { MyTeamsComponent } from 'src/app/team/teams/my-teams/my-teams.component';

@Injectable()
export class TeamsFirstGuardService implements CanActivate {

  private firstNavigation = true;

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (this.firstNavigation) {
          this.firstNavigation = false;
          if (route.component != MyTeamsComponent) {
              this.router.navigateByUrl("/takimlar");
              return false;
          }
      }
      return true;
  }

}
