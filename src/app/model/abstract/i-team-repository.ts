import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Team } from '../team.model';

@Injectable()
export abstract class ITeamRepository { // Include only public members here.
    
    abstract getMyTeams(): Team[]    
    abstract getTeam(teamId:number):Observable<Team>
    abstract saveTeam(team: Team) // For add and update
    abstract deleteTeam(teamId: number)
    
    //abstract removeFromTeamJoined(teamId: number)
    // save or delete methods doesn't return anything.

     
}
