import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, take } from 'rxjs/operators';
import { empty } from 'rxjs';
import { TeamMembersService } from '../services/team-members.service';

@Injectable()
export class TeamMemberResolverService implements Resolve<any> {
    constructor(private service: TeamMembersService) { }
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let teamId = Number.parseInt(route.paramMap.get('TeamId'))
        return this.service.teamMembers(teamId).pipe(catchError((error) => {
            return empty();
        }), take(1))
    }
}
