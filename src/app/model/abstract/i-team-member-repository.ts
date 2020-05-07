import { Injectable } from '@angular/core';
import { Member } from '../member.model';
import { TeamMember } from '../team-member.model.';
import { Subscription, Observable } from 'rxjs';
import { Team } from '../team.model';

@Injectable()
export abstract class ITeamMemberRepository { // Include only public members here.
    
    abstract getTeamMembers(): TeamMember[]

    abstract getTeamMembersOwned(): TeamMember[]
    abstract getTeamMembersJoined(): TeamMember[]
    abstract getTeamJoined(teamId):Team // accompanying to team members joined

    abstract saveTeamMember(teamMember: TeamMember) // For add and update
    abstract deleteTeamMember(teamMemberId: number)

    abstract removeTMJFromRepo(teamMemberId: number) // for leaving the the tmJoined
    // save or delete methods doesn't return anything.
}
