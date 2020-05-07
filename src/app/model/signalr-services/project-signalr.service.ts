// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { ReplaySubject } from 'rxjs';
// import { Project } from '../project.model';
// import { ProjectOrderModel } from '../project-order.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class ProjectSignalrService {

//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {
//     this.memberShared.token.subscribe(async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/ProjectNotificationHub', {
//           //transport: HttpTransportType.WebSockets, skipNegotiation: true,
//           accessTokenFactory: () => { return token },
//         }).configureLogging(LogLevel.Information).build();
//         this.hubConnection.on("NewProjectAvailable", async (project: string, extra: string) => {
//           await this.newProjectAvailable.next(JSON.parse(project))
//         });
//         this.hubConnection.on("DeletedProjectAvailable", async (project: string) => {
//           await this.deletedProjectAvailable.next(JSON.parse(project))
//         });
//         this.hubConnection.on("ProjectReOrderingAvailable", async (POMs: string) => {
//           await this.projectReOrderingAvailable.next(JSON.parse(POMs))
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

//   public newProjectAvailable: ReplaySubject<Project> = new ReplaySubject<Project>(1);
//   public deletedProjectAvailable: ReplaySubject<Project> = new ReplaySubject<Project>(1);
//   public projectReOrderingAvailable: ReplaySubject<ProjectOrderModel[]> = new ReplaySubject<ProjectOrderModel[]>(1);

//   public async notifyNewProject(project: Project) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected) // mode = to or mode=shareholders
//       await this.hubConnection.invoke("NotifyNewProject", JSON.stringify(project)).catch(error => console.log(error))
//   }
//   public async notifyDeletedProject(project: Project, toAllCompany: boolean = false) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedProject", JSON.stringify(project), toAllCompany).catch(error => console.log(error))
//   }
//   public async notifyProjectReOrdering(POMs: ProjectOrderModel[]) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyProjectReOrdering", JSON.stringify(POMs)).catch(error => console.log(error))
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
