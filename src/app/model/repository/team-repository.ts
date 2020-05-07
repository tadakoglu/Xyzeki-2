import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { ITeamRepository } from '../abstract/i-team-repository';
import { Team } from '../team.model';
import { TeamsService } from '../services/teams.service';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { refreshDescendantViews } from '@angular/core/src/render3/instructions';
import { switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from '../services/shared/data.service';

@Injectable()
export class TeamRepository implements ITeamRepository {
    // Note: C# auto-properties return attributes with lowercase letters  !!! TS models should be start with lowercase or same, unless, Angular won't model bind!
    constructor(private service: TeamsService, private dataService: DataService) {
        this.loadMYRelateds();
        this.loadPTRelateds();

        this.dataService.reloadAllOnTeamDestroyEvent.subscribe(() => { this.loadMYRelateds(false); this.loadPTRelateds() });

    }
    loadMYRelateds(teamToOpen = true) { // ##load this when team comp destroyed.
        this.service.myTeams().subscribe(teams => {
            this.myTeams.splice(0, this.myTeams.length);
            this.myTeams.push(...teams);
            //this.myTeams = teams;

            if (teams[0] && teamToOpen)
                this.teamToOpen.next(teams[0])
        })
        this.service.teamsJoined().subscribe(teamsJoined => {
            this.myTeamsJoined.splice(0, this.myTeamsJoined.length);
            this.myTeamsJoined.push(...teamsJoined);
            //this.myTeamsJoined = teamsJoined
        })
    }
    loadPTRelateds() { // ##load this when team comp destroyed.
        this.service.allTeamsPT().subscribe(teams => {
            this.allTeamsPT.splice(0, this.allTeamsPT.length);
            this.allTeamsPT.push(...teams);
            //this.allTeamsPT = teams;
        })
    }
    loadMyTeamsViaResolver(myTeams: Team[]) {
        this.myTeams.splice(0, this.myTeams.length);
        this.myTeams.push(...myTeams);
        
        if (myTeams[0])
        this.teamToOpen.next(myTeams[0])
    }
    private myTeams: Team[] = []
    private myTeamsJoined: Team[] = []

    private allTeamsPT: Team[] = [];

    public teamToOpen = new EventEmitter<Team>();
    getMyTeams(): Team[] {
        return this.myTeams;
    }
    getMyTeamsJoined(): Team[] {
        return this.myTeamsJoined;
    }
    getAllTeamsPT(): Team[] {
        return this.allTeamsPT;
    }
    getTeam(teamId: number): Observable<Team> {
        return this.service.findTeam(teamId);
    }
    getError(): string {
        return this.informUser;
    }
    private informUser;
    saveTeam(team: Team) {
        if (team.TeamId == 0 || team.TeamId == null) { // Add a new team
            this.service.saveTeam(team).subscribe(teamId => {
                team.TeamId = teamId;
                this.myTeams.push(team); // myTeams is initialized in constructor so in ng zone, Angular will invoke update on UI after saving.
                this.teamToOpen.next(team)
            }, (error: HttpErrorResponse) => {
                switch (error.status) {
                    case 403: //forbidden
                        this.informUser = "Üzgünüz, bu işlemi gerçekleştiremiyoruz. Başka birilerinin takımında yer alıyorken, takım sahibi olamazsınız."
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 4000);
                        break;
                    case 503: ; case 0:
                        this.informUser = "Servis şu anda ulaşılabilir değildir.  "
                        setTimeout(() => {
                            this.informUser = undefined;
                        }, 4000);
                        break;
                }

            })
        }
        else {
            this.service.updateTeam(team).subscribe(() => { // Update an existing team
                let index = this.myTeams.findIndex((value) => value.TeamId == team.TeamId);
                if (-1 != index)
                    this.myTeams.splice(index, 1, team);
            });
        }
    }
    deleteTeam(teamId: number) {
        this.service.deleteTeam(teamId).subscribe(team => {
            let index = this.myTeams.findIndex((value) => value.TeamId == team.TeamId);
            if (-1 != index) {
                this.myTeams.splice(index, 1);
            }

        })
    }
}
