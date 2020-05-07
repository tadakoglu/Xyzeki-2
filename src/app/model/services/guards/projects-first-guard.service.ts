import { Injectable } from '@angular/core';
import { MyProjectsComponent } from 'src/app/project/projects/my-projects/my-projects.component';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';

@Injectable()
export class ProjectsFirstGuardService implements CanActivate {

  private firstNavigation = true;

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if (this.firstNavigation) {
          this.firstNavigation = false;
          if (route.component != MyProjectsComponent) {
              this.router.navigateByUrl("/projeler");
              return false;
          }
      }
      return true;
  }

}
