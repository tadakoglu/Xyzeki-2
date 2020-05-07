// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { BehaviorSubject, ReplaySubject, interval } from 'rxjs';
// import { QuickTaskComment } from '../quick-task-comment.model';
// import { ProjectTaskComment } from '../project-task-comment.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class CommentSignalrService {

//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {
//     this.memberShared.token.subscribe(async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/CommentNotificationHub',
//           {
//             // transport: HttpTransportType.WebSockets, skipNegotiation:true, 
//             accessTokenFactory: () => { return token },

//           }).configureLogging(LogLevel.Information).build();
//         this.hubConnection.on("NewQuickToDoCommentAvailable", async (comment: string, mode: string) => {
//           await this.newQuickToDoCommentAvailable.next([JSON.parse(comment), mode])
//         });

//         this.hubConnection.on("DeletedQuickToDoCommentAvailable", async (comment: string) => {
//           await this.deletedQuickToDoCommentAvailable.next(JSON.parse(comment))
//         });

//         this.hubConnection.on("NewProjectToDoCommentAvailable", async (comment: string, mode: string) => {
//           await this.newProjectToDoCommentAvailable.next([JSON.parse(comment), mode])
//         });
//         this.hubConnection.on("DeletedProjectToDoCommentAvailable", async (comment: string) => {
//           await this.deletedProjectToDoCommentAvailable.next(JSON.parse(comment))
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

//   public newQuickToDoCommentAvailable: ReplaySubject<[QuickTaskComment, string]> = new ReplaySubject<[QuickTaskComment, string]>(1);
//   public deletedQuickToDoCommentAvailable: ReplaySubject<QuickTaskComment> = new ReplaySubject<QuickTaskComment>(1);

//   public newProjectToDoCommentAvailable: ReplaySubject<[ProjectTaskComment, string]> = new ReplaySubject<[ProjectTaskComment, string]>(1);
//   public deletedProjectToDoCommentAvailable: ReplaySubject<ProjectTaskComment> = new ReplaySubject<ProjectTaskComment>(1);

//   public async notifyQuickToDoComment(quickTaskComment: QuickTaskComment, mode: string) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewQuickToDoComment", JSON.stringify(quickTaskComment), mode).catch(error => console.log(error))
//   }
//   public async notifyDeletedQuickToDoComment(quickTaskComment: QuickTaskComment) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedQuickToDoComment", JSON.stringify(quickTaskComment)).catch(error => console.log(error))
//   }

//   public async notifyProjectToDoComment(projectTaskComment: ProjectTaskComment, mode: string) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewProjectToDoComment", JSON.stringify(projectTaskComment), mode).catch(error => console.log(error))
//   }
//   public async notifyDeletedProjectToDoComment(projectTaskComment: ProjectTaskComment) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedProjectToDoComment", JSON.stringify(projectTaskComment)).catch(error => console.log(error))
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
