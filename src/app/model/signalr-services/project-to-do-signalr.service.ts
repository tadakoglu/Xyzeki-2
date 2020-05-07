// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { BehaviorSubject, ReplaySubject } from 'rxjs';
// import { ProjectTask } from '../project-task.model';
// import { TaskOrderModel } from '../task-order.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class ProjectToDoSignalrService {

//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {
//     this.memberShared.token.subscribe(async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/ProjectToDoNotificationHub', {
//           //transport: HttpTransportType.WebSockets, skipNegotiation: true,
//           accessTokenFactory: () => { return token },
//         }).configureLogging(LogLevel.Information).build();
//         this.hubConnection.on("NewProjectToDoAvailable", async (projectToDo: string) => {
//           await this.newProjectToDoAvailable.next(JSON.parse(projectToDo))
//         });
//         this.hubConnection.on("DeletedProjectToDoAvailable", async (projectToDo: string) => {
//           await this.deletedProjectToDoAvailable.next(JSON.parse(projectToDo))
//         });
//         this.hubConnection.on("ProjectToDoReOrderingAvailable", async (TOMs: string, projectId: number) => {
//           await this.projectToDoReOrderingAvailable.next([JSON.parse(TOMs), projectId])
//         });
//         await this.hubConnection.start().catch(error => console.error(error));

//         this.hubConnection.onclose(() => {
//           setTimeout(async function () {
//             await this.hubConnection.start();
//           }, 5000);
//         });
//       }
//     })
//   }

//   public newProjectToDoAvailable: ReplaySubject<ProjectTask> = new ReplaySubject<ProjectTask>(1);
//   public deletedProjectToDoAvailable: ReplaySubject<ProjectTask> = new ReplaySubject<ProjectTask>(1);
//   public projectToDoReOrderingAvailable: ReplaySubject<[TaskOrderModel[], number]> = new ReplaySubject<[TaskOrderModel[], number]>(1);

//   public async notifyNewProjectToDo(projectToDo: ProjectTask) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewProjectToDo", JSON.stringify(projectToDo)).catch(error => console.log(error))
//   }
//   public async notifyDeletedProjectToDo(projectToDo: ProjectTask) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedProjectToDo", JSON.stringify(projectToDo)).catch(error => console.log(error))
//   }
//   public async notifyProjectToDoReOrdering(TOMs: TaskOrderModel[], projectId: number) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyProjectToDoReOrdering", JSON.stringify(TOMs), projectId).catch(error => console.log(error))
//   }


//   // public async closeHubConnection() {
//   //   if (this.hubConnection && this.hubConnection.state == HubConnectionState.Connected) {
//   //     await this.hubConnection.stop();
//   //   }
//   // }
//   // public async  openHubConnection() {
//   //   if (this.hubConnection && this.hubConnection.state == HubConnectionState.Disconnected) {
//   //     await this.hubConnection.start();
//   //   }
//   // }
// }
