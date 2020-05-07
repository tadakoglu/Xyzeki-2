import { Injectable, EventEmitter } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel, IHttpConnectionOptions } from '@aspnet/signalr';
import { MemberShared } from '../member-shared.model';
import { BehaviorSubject, ReplaySubject, interval } from 'rxjs';
import { QuickTaskComment } from '../quick-task-comment.model';
import { ProjectTaskComment } from '../project-task-comment.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
import { DataService } from '../services/shared/data.service';
import { TeamMember } from '../team-member.model.';
import { QuickTask } from '../quick-task.model';
import { TaskOrderModel } from '../task-order.model';
import { ProjectTask } from '../project-task.model';
import { Project } from '../project.model';
import { ProjectOrderModel } from '../project-order.model';
import { PrivateTalk } from '../private-talk.model';
import { PrivateTalkReceiver } from '../private-talk-receiver.model';
import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
import { PrivateTalkMessage } from '../private-talk-message.model';
import { CloudContainer } from '../azure-models/cloud-container.model';
import { CloudFile } from '../azure-models/cloud-file.model';
import { NotificationService } from '../notification-services/notification.service';

@Injectable()
export class XyzekiSignalrService {

  private hubConnection: HubConnection;

  constructor(private memberShared: MemberShared, private dataService: DataService, private pushService: NotificationService) {
    this.memberShared.token.subscribe(async token => {
      if (token == '0') {
        //this.hubConnection.stop();
      } else {
        let baseURL = BackEndWebServer + '/'
        let builder = new HubConnectionBuilder();
        this.hubConnection = builder.withUrl(baseURL + 'api/hubs/XyzekiNotificationHub',
          {
            accessTokenFactory: () => { return token }, skipNegotiation:false
          }).build();

        this.hubConnection.serverTimeoutInMilliseconds = 15000;
        this.hubConnection.keepAliveIntervalInMilliseconds = 5000;
        // TeamMember Area
        this.hubConnection.on("NewTeamMemberAvailable", async (teamMember: string, mode: string) => {
          if (mode == 'new') { // Gelen kutusu
            let tm: TeamMember = JSON.parse(teamMember)
            await this.newTeamMemberJoinedAvailable.next(tm)
            this.pushService.pushNotifyNewTeamMember(tm);
          }
          else if (mode == 'update') { // Daveti kabul ettiğinde takım sahibi ve takım arkadaşlarının sayfasını güncelle.
            await this.newTeamMemberAvailable.next(JSON.parse(teamMember))
          }
        });
        this.hubConnection.on("DeletedTeamMemberAvailable", async (teamMember: string) => {
          await this.deletedTeamMemberAvailable.next(JSON.parse(teamMember)) // communicates with id
        });

        // QuickToDo Area
        this.hubConnection.on("NewQuickToDoAvailable", async (quickToDo: string, to: string, mode: string) => {
          let qt: QuickTask = JSON.parse(quickToDo)
          await this.newQuickToDoAvailable.next(qt) // same for both adding and update
          this.pushService.pushNotifyNewQuickTask(qt);
        });
        this.hubConnection.on("DeletedQuickToDoAvailable", async (quickToDo: string, to: string) => {
          await this.deletedQuickToDoAvailable.next(JSON.parse(quickToDo))
        });
        this.hubConnection.on("QuickToDoReOrderingAvailable", async (TOMs: string) => {
          await this.quickToDoReOrderingAvailable.next(JSON.parse(TOMs))
        });


        // ProjectToDo Area
        this.hubConnection.on("NewProjectToDoAvailable", async (projectToDo: string) => {
          await this.newProjectToDoAvailable.next(JSON.parse(projectToDo))
        });
        this.hubConnection.on("DeletedProjectToDoAvailable", async (projectToDo: string) => {
          await this.deletedProjectToDoAvailable.next(JSON.parse(projectToDo))
        });
        this.hubConnection.on("ProjectToDoReOrderingAvailable", async (TOMs: string, projectId: number) => {
          await this.projectToDoReOrderingAvailable.next([JSON.parse(TOMs), projectId])
        });

        // Project Area
        this.hubConnection.on("NewProjectAvailable", async (project: string, extra: string) => {
          let p: Project = JSON.parse(project)
          await this.newProjectAvailable.next(p)
          this.pushService.pushNotifyNewProject(p);
        });
        this.hubConnection.on("DeletedProjectAvailable", async (project: string) => {
          await this.deletedProjectAvailable.next(JSON.parse(project))
        });
        this.hubConnection.on("ProjectReOrderingAvailable", async (POMs: string) => {
          await this.projectReOrderingAvailable.next(JSON.parse(POMs))
        });

        // PrivateTalk Area
        this.hubConnection.on("DeletedPrivateTalkAvailable", async (privateTalk: string, receivers: string, teamReceivers: string) => {
          await this.deletedPrivateTalkJoinedAvailable.next(JSON.parse(privateTalk))
        });

        this.hubConnection.on("NewPrivateTalkAvailable", async (privateTalk: string, receivers: string, teamReceivers: string) => {
          await this.newPrivateTalkJoinedAvailable.next(JSON.parse(privateTalk))
        });

        // PrivateTalkMessage Area
        this.hubConnection.on("NewPrivateTalkMessageAvailable", async (privateTalkMessage: string, isTypingSignal: boolean) => {
          let ptm: PrivateTalkMessage = JSON.parse(privateTalkMessage)
          await this.newPrivateTalkMessageAvailable.next([ptm, isTypingSignal])
          if (!isTypingSignal) {
            this.pushService.pushNotifyNewMessage(ptm);
          }
        });

        // Container Area
        this.hubConnection.on("NewContainerAvailable", async (container: string) => {
          await this.newContainerAvailable.next(JSON.parse(container))
        });
        this.hubConnection.on("DeletedContainerAvailable", async (container: string) => {
          await this.deletedContainerAvailable.next(JSON.parse(container))
        });

        // Container Blob Area
        this.hubConnection.on("NewContainerBlobAvailable", async (containerBlob: string) => {
          let cf: CloudFile = JSON.parse(containerBlob)
          await this.newContainerBlobAvailable.next(cf)
          this.pushService.pushNotifyNewBlob(cf);
        });
        this.hubConnection.on("DeletedContainerBlobAvailable", async (containerBlob: string) => {
          await this.deletedContainerBlobAvailable.next(JSON.parse(containerBlob))
        });


        //Comment Area
        this.hubConnection.on("NewQuickToDoCommentAvailable", async (comment: string, mode: string) => {
          let qtc: QuickTaskComment = JSON.parse(comment)
          await this.newQuickToDoCommentAvailable.next([qtc, mode])
          this.pushService.pushNotifyNewQTComment(qtc)
        });

        this.hubConnection.on("DeletedQuickToDoCommentAvailable", async (comment: string) => {
          await this.deletedQuickToDoCommentAvailable.next(JSON.parse(comment))
        });

        this.hubConnection.on("NewProjectToDoCommentAvailable", async (comment: string, mode: string) => {
          let ptc: ProjectTaskComment = JSON.parse(comment)
          await this.newProjectToDoCommentAvailable.next([ptc, mode])
          this.pushService.pushNotifyNewPTComment(ptc)
        });
        this.hubConnection.on("DeletedProjectToDoCommentAvailable", async (comment: string) => {
          await this.deletedProjectToDoCommentAvailable.next(JSON.parse(comment))
        });

        // Start Area
        await this.hubConnection.start().catch(error => { // ilk defa bağlanamadı ise
          //console.error(error)
          clearTimeout(this.timeOutId); // clearTimeout here
          this.dataService.signalConnectionSeconds.next(undefined) // clearInterval in "second" counttimer
          this.tryConnection();
        });

        this.hubConnection.onclose(() => { // bağlandıkdan sonra bir süre sonra bağlantı koptu ise
          clearTimeout(this.timeOutId); // clearTimeout here
          this.dataService.signalConnectionSeconds.next(undefined) // clearInterval in "second" counttimer
          this.tryConnection();
        });

        this.dataService.startSignalConnection.subscribe(async () => {
          clearTimeout(this.timeOutId); // clearTimeout here
          this.dataService.signalConnectionSeconds.next(undefined) // clearInterval in "second" counttimer
          await this.startConnection();
        })
      }
    })
  }

  async startConnection() {
    if (this.hubConnection && this.hubConnection.state == HubConnectionState.Disconnected) {
      await this.hubConnection.start().then(() => {
        clearTimeout(this.timeOutId); // clearTimeout here
        this.dataService.signalConnectionSeconds.next(undefined)

        this.dataService.reloadAllOnTeamDestroyEvent.next();  //İçerikleri yeniden yükle
      }).catch(error => { // ilk defa bağlanamadı ise
        //console.error(error)      
        clearTimeout(this.timeOutId); // clearTimeout here
        this.dataService.signalConnectionSeconds.next(undefined) // clearInterval in "second" counttimer

        this.tryConnection();
      });
    }
  }
  private timeOutId;
  tryConnection(seconds = 10) {
    let secondsToTryAfter = seconds;
    this.dataService.signalConnectionSeconds.next(secondsToTryAfter);

    this.timeOutId = setTimeout(async () => {
      await this.hubConnection.start().then(() => {
        this.dataService.reloadAllOnTeamDestroyEvent.next();  //İçerikleri yeniden yükle
        this.dataService.signalConnectionSeconds.next(undefined);


      }).catch(() => this.tryConnection(2 * secondsToTryAfter));
    }, secondsToTryAfter * 1000);
  }

  // TeamMember Area
  public newTeamMemberAvailable: ReplaySubject<TeamMember> = new ReplaySubject<TeamMember>(1);
  public newTeamMemberJoinedAvailable: ReplaySubject<TeamMember> = new ReplaySubject<TeamMember>(1);

  public deletedTeamMemberAvailable: ReplaySubject<TeamMember> = new ReplaySubject<TeamMember>(1);

  public async notifyNewTeamMember(teamMember: TeamMember, mode: string = 'new') {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewTeamMember", JSON.stringify(teamMember), mode).catch(error => console.log(error))
  }

  public async notifyDeletedTeamMember(teamMember: TeamMember) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedTeamMember", JSON.stringify(teamMember)).catch(error => console.log(error))
  }

  // QuickToDo Area
  public newQuickToDoAvailable: ReplaySubject<QuickTask> = new ReplaySubject<QuickTask>(1);
  public deletedQuickToDoAvailable: ReplaySubject<QuickTask> = new ReplaySubject<QuickTask>(1);
  public quickToDoReOrderingAvailable: ReplaySubject<TaskOrderModel[]> = new ReplaySubject<TaskOrderModel[]>(1);

  public async notifyNewQuickToDo(quickToDo: QuickTask, to: string, mode: string = 'new') {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewQuickToDo", JSON.stringify(quickToDo), to, mode).catch(error => console.log(error))
  }
  public async notifyDeletedQuickToDo(quickToDo: QuickTask, to: string) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedQuickToDo", JSON.stringify(quickToDo), to).catch(error => console.log(error))
  }
  public async notifyQuickToDoReOrdering(TOMs: TaskOrderModel[]) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyQuickToDoReOrdering", JSON.stringify(TOMs)).catch(error => console.log(error))
  }

  //ProjectToDo Area
  public newProjectToDoAvailable: ReplaySubject<ProjectTask> = new ReplaySubject<ProjectTask>(1);
  public deletedProjectToDoAvailable: ReplaySubject<ProjectTask> = new ReplaySubject<ProjectTask>(1);
  public projectToDoReOrderingAvailable: ReplaySubject<[TaskOrderModel[], number]> = new ReplaySubject<[TaskOrderModel[], number]>(1);

  public async notifyNewProjectToDo(projectToDo: ProjectTask) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewProjectToDo", JSON.stringify(projectToDo)).catch(error => console.log(error))
  }
  public async notifyDeletedProjectToDo(projectToDo: ProjectTask) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedProjectToDo", JSON.stringify(projectToDo)).catch(error => console.log(error))
  }
  public async notifyProjectToDoReOrdering(TOMs: TaskOrderModel[], projectId: number) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyProjectToDoReOrdering", JSON.stringify(TOMs), projectId).catch(error => console.log(error))
  }

  //Project Area  
  public newProjectAvailable: ReplaySubject<Project> = new ReplaySubject<Project>(1);
  public deletedProjectAvailable: ReplaySubject<Project> = new ReplaySubject<Project>(1);
  public projectReOrderingAvailable: ReplaySubject<ProjectOrderModel[]> = new ReplaySubject<ProjectOrderModel[]>(1);

  public async notifyNewProject(project: Project) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected) // mode = to or mode=shareholders
      await this.hubConnection.invoke("NotifyNewProject", JSON.stringify(project)).catch(error => console.log(error))
  }
  public async notifyDeletedProject(project: Project, toAllCompany: boolean = false) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedProject", JSON.stringify(project), toAllCompany).catch(error => console.log(error))
  }
  public async notifyProjectReOrdering(POMs: ProjectOrderModel[]) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyProjectReOrdering", JSON.stringify(POMs)).catch(error => console.log(error))
  }

  //PrivateTalk Area
  public deletedPrivateTalkJoinedAvailable: ReplaySubject<PrivateTalk> = new ReplaySubject<PrivateTalk>(1);
  public newPrivateTalkJoinedAvailable: ReplaySubject<PrivateTalk> = new ReplaySubject<PrivateTalk>(1);

  public async notifyDeletedPrivateTalkJoined(privateTalkDeleted: PrivateTalk, receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedPrivateTalk", JSON.stringify(privateTalkDeleted), JSON.stringify(receivers), JSON.stringify(teamReceivers)).catch(error => console.log(error))
  }

  public async notifyNewPrivateTalk(privateTalk: PrivateTalk, receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewPrivateTalk", JSON.stringify(privateTalk), JSON.stringify(receivers), JSON.stringify(teamReceivers)).catch(error => console.log(error))
  }
  public notifyPrivateTalkLastSeen(privateTalkId: number) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      this.hubConnection.invoke("NotifyPrivateTalkLastSeen", privateTalkId).catch(error => console.log(error))
  }

  // PrivateTalkMessage Area
  public newPrivateTalkMessageAvailable: EventEmitter<[PrivateTalkMessage, boolean]> = new EventEmitter();

  public async notifyNewPrivateTalkMessage(privateTalkMessage: PrivateTalkMessage, isTypingSignal: boolean = false) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewPrivateTalkMessage", JSON.stringify(privateTalkMessage), isTypingSignal).catch(error => console.log(error))
  }


  // Container Area
  public newContainerAvailable: ReplaySubject<CloudContainer> = new ReplaySubject<CloudContainer>(1);
  public deletedContainerAvailable: ReplaySubject<CloudContainer> = new ReplaySubject<CloudContainer>(1);

  public async notifyNewContainer(container: CloudContainer) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewContainer", JSON.stringify(container)).catch(error => console.log(error))
  }
  public async notifyDeletedContainer(container: CloudContainer) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedContainer", JSON.stringify(container)).catch(error => console.log(error))
  }

  // ContainerBlob Area
  public newContainerBlobAvailable: ReplaySubject<CloudFile> = new ReplaySubject<CloudFile>(1);
  public deletedContainerBlobAvailable: ReplaySubject<CloudFile> = new ReplaySubject<CloudFile>(1);

  public async notifyNewContainerBlob(containerBlob: CloudFile) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewContainerBlob", JSON.stringify(containerBlob)).catch(error => console.log(error))
  }
  public async notifyDeletedContainerBlob(containerBlob: CloudFile) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedContainerBlob", JSON.stringify(containerBlob)).catch(error => console.log(error))
  }

  // Comment Area
  public newQuickToDoCommentAvailable: ReplaySubject<[QuickTaskComment, string]> = new ReplaySubject<[QuickTaskComment, string]>(1);
  public deletedQuickToDoCommentAvailable: ReplaySubject<QuickTaskComment> = new ReplaySubject<QuickTaskComment>(1);

  public newProjectToDoCommentAvailable: ReplaySubject<[ProjectTaskComment, string]> = new ReplaySubject<[ProjectTaskComment, string]>(1);
  public deletedProjectToDoCommentAvailable: ReplaySubject<ProjectTaskComment> = new ReplaySubject<ProjectTaskComment>(1);

  public async notifyQuickToDoComment(quickTaskComment: QuickTaskComment, mode: string) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewQuickToDoComment", JSON.stringify(quickTaskComment), mode).catch(error => console.log(error))
  }
  public async notifyDeletedQuickToDoComment(quickTaskComment: QuickTaskComment) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedQuickToDoComment", JSON.stringify(quickTaskComment)).catch(error => console.log(error))
  }

  public async notifyProjectToDoComment(projectTaskComment: ProjectTaskComment, mode: string) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyNewProjectToDoComment", JSON.stringify(projectTaskComment), mode).catch(error => console.log(error))
  }
  public async notifyDeletedProjectToDoComment(projectTaskComment: ProjectTaskComment) {
    if (this.hubConnection.state == HubConnectionState.Connected)
      await this.hubConnection.invoke("NotifyDeletedProjectToDoComment", JSON.stringify(projectTaskComment)).catch(error => console.log(error))
  }
}
