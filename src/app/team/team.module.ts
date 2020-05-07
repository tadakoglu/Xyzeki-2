import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsComponent } from './teams/teams.component';
import { MyTeamsComponent } from './teams/my-teams/my-teams.component';
import { TeamMembersComponent } from './teams/team-members/team-members.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IncomingInvitationsComponent } from './teams/incoming-invitations/incoming-invitations.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [TeamsComponent, MyTeamsComponent, TeamMembersComponent, IncomingInvitationsComponent],
  imports: [
    CommonModule, FormsModule,NgbModule,
    RouterModule
  ],
  exports:[TeamsComponent]
})
export class TeamModule { }
