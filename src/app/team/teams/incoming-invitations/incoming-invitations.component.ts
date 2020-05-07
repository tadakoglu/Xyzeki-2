import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { TeamMember } from 'src/app/model/team-member.model.';
import { MemberShared } from 'src/app/model/member-shared.model';
import { DataService } from 'src/app/model/services/shared/data.service';
import { Team } from 'src/app/model/team.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-incoming-invitations',
  templateUrl: './incoming-invitations.component.html',
  styleUrls: ['./incoming-invitations.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})
export class IncomingInvitationsComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    //this.repository.closeHubConnection();
    if (this.subscription)
      this.subscription.unsubscribe();
  }
  subscription: Subscription;
  ngOnInit() {
    // this.repository.openHubConnection();
    // this.subscription = this.dataService.removeTeamMemberEvent.subscribe(teamMemberId => {
    //   this.repository.removeTMJFromRepo(teamMemberId);

    // })

  }
  public getError(): string {
    return this.repository.getError();
  }

  public teamMemberModel: TeamMember;

  constructor(private repository: TeamMemberRepository, private dataService: DataService, public memberShared: MemberShared) {
  }

  get teamMembersJoinedWR(): TeamMember[] { // gelen davetiye istekleriniz, you can't receieve invitation from your own team.(your own teams' teammember status always True)
    return this.repository.getTeamMembersJoined().filter(val => val.Status != true);
  }
  get teamMembersJoined(): TeamMember[] { //katıldığınız takımlar, API will filter out your own teams.
    return this.repository.getTeamMembersJoined().filter(val => val.Status == true);
  }

  doubleTeamTeamMemberCanceled = false;
  updateTeamMember(teamMemberWR: TeamMember, answer: boolean) {
    let tmWR: TeamMember = Object.assign({}, teamMemberWR);
    tmWR.Status = answer;
    this.repository.saveTeamMember(tmWR)
  }
  delete(teamMemberWRId) { //waiting or rejected
    this.repository.deleteTeamMember(teamMemberWRId);
  }
  getTeam(teamId: number): Team {
    return this.repository.getTeamJoined(teamId);
  }

  //Both incoming invitations and team memberd I have joined will use the TeamMember repository. For that reason. They will be synchronized in local automatically.
}
