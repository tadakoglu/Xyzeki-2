import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot } from '@angular/router';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { TeamMember } from 'src/app/model/team-member.model.';
import { NgForm } from '@angular/forms';
import { MemberShared } from 'src/app/model/member-shared.model';
import { DataService } from 'src/app/model/services/shared/data.service';
import { TeamRepository } from 'src/app/model/repository/team-repository';
import { MemberRepository } from 'src/app/model/repository/member-repository';
import { Subscription } from 'rxjs';
import { Member } from 'src/app/model/member.model';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})
export class TeamMembersComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    //this.repository.closeHubConnection();
    if (this.subscriptionForDel)
      this.subscriptionForDel.unsubscribe();
  }
  public loaded=false;
  ngOnInit(): void {
    //this.repository.openHubConnection();
    // this.route.paramMap.subscribe(params => {
    //   this.teamId = Number.parseInt(params.get('TeamId'));
    //   this.repository.loadTeamMembers(this.teamId);
    //   Object.assign(this.teamMemberModel, new TeamMember("", this.teamId, null))
    //   // this.teamMemberModel = new TeamMember("", this.teamId, null);
    // })


    this.route.data.subscribe((resolvedData: { teamMembers: TeamMember[], kind: string }) => {
      this.teamId = Number.parseInt(this.route.snapshot.paramMap.get('TeamId'))

      if (resolvedData.kind == 'limited') {
        this.isLimited = true;
      }

      this.repository.loadTeamMembersViaResolver(resolvedData.teamMembers, this.teamId);
      Object.assign(this.teamMemberModel, new TeamMember("", this.teamId, null))
      this.loaded = true;
    })

    // this.route.data.subscribe(data => {
    //   if (data.kind == 'limited')
    //     this.isLimited = true;
    // })

  }
  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocusTM'))
        document.getElementById('textForFocusTM').focus();
    }, 10);
  }

  public teamMemberModel: TeamMember = new TeamMember("", 0, null);
  public teamId: number = 0

  //teamExistingRepo is injected from Module module. That instance will be same with Team components' because of related repo provider with 'existing' keyword  in Model Module
  //only also team owner can use that repo, not for joined teams section.
  constructor(private repository: TeamMemberRepository, private permissions: MemberLicenseRepository,
    public memberRepository: MemberRepository, private teamExistingRepo: TeamRepository, private dataService: DataService,
    private router: Router, private route: ActivatedRoute,
    public memberShared: MemberShared,
  ) {



  }
  public getError(): string {
    return this.repository.getError();
  }

  public isLimited: boolean = false;
  newTeamMemberPanelWROpen: boolean = false;
  toggleTeamMemberWRPanel() {
    if (this.newTeamMemberPanelWROpen == false) {
      this.newTeamMemberPanelWROpen = true;
      this.focusOnInput();
    }
    else
      this.newTeamMemberPanelWROpen = false;
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  addTeamMemberWR(teamMemberForm: NgForm) {
    if (this.permissions.getPrimaryAccessGranted()) {
      if (this.isLimited) // there not exists any adding support for showing team members in joined teams table of incoming invitations
        return;
      this.modelSubmitted = true;
      if (teamMemberForm.valid) {
        this.repository.saveTeamMember(this.teamMemberModel)
        this.modelSent = true;
        this.modelSubmitted = false;
        this.teamMemberModel = new TeamMember("", this.teamId, null);
        this.focusOnInput();
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }
  invalidLicensePanelOpen: boolean = false;
  // public getMember(username): Member {
  //   return this.repository.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
  // }
  public getMemberJoined(username): Member {
    return this.repository.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
  }
  public getMember(username): Member {
    let member: Member = this.repository.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repository.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }


  // teamMembersResolved: TeamMember[]
  // get teamMembers(): TeamMember[] {
  //   return this.teamMembersResolved.filter(val => val.Status == true);
  // }

  public teamMembers(): TeamMember[] {
    return this.repository.getTeamMembers().filter(val => val.Status == true);
  }

  public teamMembersWaitingOrRejected(): TeamMember[] {
    return this.repository.getTeamMembers().filter(val => val.Status != true);
  }

  // get teamMembers(): TeamMember[] {
  //   return this.repository.getTeamMembers().filter(val => val.Status == true);
  // }

  // get teamMembersWaitingOrRejected(): TeamMember[] {
  //   return this.repository.getTeamMembers().filter(val => val.Status != true);
  // }


  deleteTeamMember(teamMemberId, isJoined: boolean = false) {
    if (!isJoined) {
      if (this.permissions.getAccessGranted()) {
        this.repository.deleteTeamMember(teamMemberId)
      }
      else {
        this.invalidLicensePanelOpen = true;
        setTimeout(() => {
          this.invalidLicensePanelOpen = false;
        }, 4000);
      }
    }

    else if (isJoined) { // takımdan ayrıl
      let teamMember: TeamMember = this.repository.getTeamMembersJoined().find(tm => tm.TeamMemberId == teamMemberId)
      let teamId = teamMember ? teamMember.TeamId : 0;

      this.repository.deleteTeamMember(teamMemberId)


      // let index = this.repository.getMyTeamsJoined().findIndex(val => val.TeamId == teamId);
      // if (-1 != index) {
      //   this.repository.getMyTeamsJoined().splice(index, 1)

      //   if (this.repository.getMyTeamsJoined().length == 0) { // no team joined left.. remove license or deauth
      //     this.permissions.removeMemberLicenseForJoinedTeamMember();
      //   }
      // }



      this.subscriptionForDel = this.dataService.removeTeamMemberEvent.subscribe(teamMemberId => {
        this.router.navigate(['/takimlar', 'gelen-takim-davetiyeleri'])
      })

      this.dataService.removeTeamMemberEvent.next(teamMemberId);

    }
  }
  subscriptionForDel: Subscription
  updateTeamMember(teamMemberWR: TeamMember, answer: boolean) {
    let tmWR: TeamMember = Object.assign({}, teamMemberWR);
    tmWR.Status = answer;
    this.repository.saveTeamMember(tmWR)
    // kabul et ve reddet fonksiyonları
  }
  deleteTeam(teamId) {
    if (this.permissions.getAccessGranted()) {
      this.teamExistingRepo.deleteTeam(teamId);
      this.router.navigate(['/takimlar'])
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }

}
