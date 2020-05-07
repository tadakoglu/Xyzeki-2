// import { Injectable, OnDestroy } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { BehaviorSubject, ReplaySubject } from 'rxjs';
// import { QuickTask } from '../quick-task.model';
// import { CommentCountModel } from '../comment-count.model';
// import { TaskOrderModel } from '../task-order.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class QuickToDoSignalrService {


//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {

//     this.memberShared.token.subscribe(async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/QuickToDoNotificationHub', {
//           //transport: HttpTransportType.WebSockets, skipNegotiation:true, 
//           accessTokenFactory: () => { return token },
//         }).configureLogging(LogLevel.Information).build();
//         this.hubConnection.on("NewQuickToDoAvailable", async (quickToDo: string, to: string, mode: string) => {
//           await this.newQuickToDoAvailable.next(JSON.parse(quickToDo)) // same for both adding and update
//         });
//         this.hubConnection.on("DeletedQuickToDoAvailable", async (quickToDo: string, to: string) => {
//           await this.deletedQuickToDoAvailable.next(JSON.parse(quickToDo))
//         });
//         this.hubConnection.on("QuickToDoReOrderingAvailable", async (TOMs: string) => {
//           await this.quickToDoReOrderingAvailable.next(JSON.parse(TOMs))
//         });
//         await this.hubConnection.start().catch(error => console.error(error));

//         this.hubConnection.onclose(() => {
//           setTimeout(async function () {
//             await this.hubConnection.start();
//           }, 5000);
//         });
//       }
//     }
//     )
//   }


//   public newQuickToDoAvailable: ReplaySubject<QuickTask> = new ReplaySubject<QuickTask>(1);
//   public deletedQuickToDoAvailable: ReplaySubject<QuickTask> = new ReplaySubject<QuickTask>(1);
//   public quickToDoReOrderingAvailable: ReplaySubject<TaskOrderModel[]> = new ReplaySubject<TaskOrderModel[]>(1);

//   public async notifyNewQuickToDo(quickToDo: QuickTask, to: string, mode: string = 'new') {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewQuickToDo", JSON.stringify(quickToDo), to, mode).catch(error => console.log(error))
//   }
//   public async notifyDeletedQuickToDo(quickToDo: QuickTask, to: string) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedQuickToDo", JSON.stringify(quickToDo), to).catch(error => console.log(error))
//   }
//   public async notifyQuickToDoReOrdering(TOMs: TaskOrderModel[]) {      // to owner, project manager, project insiders(signalR service will not send to this user.)
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyQuickToDoReOrdering", JSON.stringify(TOMs)).catch(error => console.log(error))
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
