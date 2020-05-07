import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/guards/auth-guard.service';
import { MemberShared } from './member-shared.model';

import { MemberLicenseRepository } from './repository/member-license-repository';
import { MemberLicenseService } from './services/member-license.service';

import { TeamsService } from './services/teams.service';
import { TeamMembersService } from './services/team-members.service';
import { AuthRepository } from './repository/auth-repository';
import { TeamRepository } from './repository/team-repository';
import { TeamMemberRepository } from './repository/team-member-repository';
import { ProjectsService } from './services/projects.service';
import { ProjectToDosService } from './services/project-to-dos.service';
import { ProjectRepository } from './repository/project-repository';
import { DataService } from './services/shared/data.service';
import { MembersService } from './services/members.service';
import { QuickToDoRepository } from './repository/quick-to-do-repository';
import { MemberRepository } from './repository/member-repository';
import { QuickToDosService } from './services/quick-to-dos.service';
import { MemberSettingService } from './services/member-setting.service';
import { QuickToDoCommentsService } from './services/quick-to-do-comments.service';
import { ProjectToDoCommentsService } from './services/project-to-do-comments.service';
import { PrivateTalksService } from './services/private-talks.service';
import { PrivateTalkMessagesService } from './services/private-talk-messages.service';
import { PrivateTalkRepository } from './repository/private-talk-repository';
import { PrivateTalkReceiversService } from './services/private-talk-receivers.service';
import { PrivateTalkTeamReceiversService } from './services/private-talk-team-receivers.service';
import { PrivateTalkReceiverRepository } from './repository/private-talk-receiver-repository';
import { AuthGuardAdminService } from './services/guards/auth-guard-admin.service';
import { AdminRepository } from './repository/admin-repository';
import { FilesService } from './services/files.service';
import { ContainerRepository } from './repository/container-repository';

import { XyzekiDateTimeInfra } from 'src/infrastructure/xyzeki-datetime-infra';
import { SwitchHourDataService } from './services/shared/switch-hour-data.service';
import { PageSizes } from 'src/infrastructure/page-sizes';
import { CryptoHelpersService } from './services/crypto-helpers.service';
import { XyzekiSignalrService } from './signalr-services/xyzeki-signalr.service';
import { NotificationService } from './notification-services/notification.service';
import { TimeService } from './services/time.service';
import { FileRepository } from './repository/file-repository';
import { ProjectToDoRepository } from './repository/project-to-do-repository';
import { PrivateTalkMessageRepository } from './repository/private-talk-message-repository';
import { QuickToDoCommentRepository } from './repository/quick-to-do-comment-repository';
import { ProjectToDoCommentRepository } from './repository/project-to-do-comment-repository';
import { TeamMemberResolverService } from './resolvers/team-member-resolver.service';
import { MyTeamsResolverService } from './resolvers/my-teams-resolver.service';
import { MyProjectsResolverService } from './resolvers/my-projects-resolver.service';
import { ProjectsAssignedResolverService } from './resolvers/projects-assigned-resolver.service';
import { ProjectToDosResolverService } from './resolvers/project-to-dos-resolver.service';
import { ContainersResolverService } from './resolvers/containers-resolver.service';
import { ContainerFilesResolverService } from './resolvers/container-files-resolver.service';


@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ],
  providers: [
    XyzekiDateTimeInfra,
    MemberShared,
    DataService,
    SwitchHourDataService,
    PageSizes,
    CryptoHelpersService,

    XyzekiSignalrService,
    NotificationService,
    TimeService,
    
    { provide: AuthService, useClass: AuthService },// This module's components/services and its tree of child components/services receive new AuthService "instance"
    { provide: AuthGuardService, useClass: AuthGuardService },
    { provide: AuthGuardAdminService, useClass: AuthGuardAdminService },
    { provide: MemberLicenseService, useClass: MemberLicenseService },
    { provide: MembersService, useClass: MembersService },
    { provide: MemberSettingService, useClass: MemberSettingService },
    { provide: TeamsService, useClass: TeamsService },
    { provide: TeamMembersService, useClass: TeamMembersService },
    { provide: ProjectsService, useClass: ProjectsService },
    { provide: QuickToDosService, useClass: QuickToDosService },
    { provide: QuickToDoCommentsService, useClass: QuickToDoCommentsService },
    { provide: ProjectToDosService, useClass: ProjectToDosService },
    { provide: ProjectToDoCommentsService, useClass: ProjectToDoCommentsService },

    { provide: PrivateTalksService, useClass: PrivateTalksService },
    { provide: PrivateTalkReceiversService, useClass: PrivateTalkReceiversService },
    { provide: PrivateTalkTeamReceiversService, useClass: PrivateTalkTeamReceiversService },
    { provide: PrivateTalkMessagesService, useClass: PrivateTalkMessagesService },

    { provide: FilesService, useClass: FilesService },

    MyTeamsResolverService,
    TeamMemberResolverService,
    MyProjectsResolverService,
    ProjectsAssignedResolverService,
    ProjectToDosResolverService,
    ContainersResolverService,
    ContainerFilesResolverService,

    AuthRepository,
    MemberLicenseRepository,
    MemberRepository,
    TeamRepository,
    TeamMemberRepository,
    QuickToDoRepository,
    QuickToDoCommentRepository,
    ProjectRepository,
    ProjectToDoRepository,
    ProjectToDoCommentRepository,
    PrivateTalkRepository,
    PrivateTalkMessageRepository,
    PrivateTalkReceiverRepository,
    AdminRepository,
    ContainerRepository,
    FileRepository,

   
  ]
})
export class ModelModule { } // This module will be used only for dependency injection, therefore doesn't include any components.
