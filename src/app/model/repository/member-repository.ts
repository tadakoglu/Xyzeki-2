import { Injectable, OnInit } from '@angular/core';
import { ITeamRepository } from '../abstract/i-team-repository';
import { Team } from '../team.model';
import { TeamsService } from '../services/teams.service';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { refreshDescendantViews } from '@angular/core/src/render3/instructions';
import { switchMap } from 'rxjs/operators';
import { IMemberRepository } from '../abstract/i-member-repository';
import { Member } from '../member.model';
import { MembersService } from '../services/members.service';
import { isNullOrUndefined } from 'util';
import { MemberShared } from '../member-shared.model';
import { RegisterModel } from '../register.model';
import { ReturnModel } from '../return.model';

@Injectable()
export class MemberRepository implements IMemberRepository { 
    
    constructor(private service: MembersService, private memberShared: MemberShared) { }

    getMember(username: string): Observable<Member> {
        return this.service.getMember(username);
    }
    updateMember(member: RegisterModel) : Observable<ReturnModel<object>> {
        return this.service.updateMember(member)
    }
}