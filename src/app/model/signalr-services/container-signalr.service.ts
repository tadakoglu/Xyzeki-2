// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { ReplaySubject } from 'rxjs';
// import { CloudContainer } from '../azure-models/cloud-container.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class ContainerSignalrService {

//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {
//     this.memberShared.token.subscribe(async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/ContainerNotificationHub', { 
//           //transport: HttpTransportType.WebSockets, skipNegotiation:true, 
//           accessTokenFactory: () => { return token },        
//          }).configureLogging(LogLevel.Information).build();
//         this.hubConnection.on("NewContainerAvailable", async (container: string) => {
//           await this.newContainerAvailable.next(JSON.parse(container))
//         });
//         this.hubConnection.on("DeletedContainerAvailable", async (container: string) => {
//           await this.deletedContainerAvailable.next(JSON.parse(container))
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

//   public newContainerAvailable: ReplaySubject<CloudContainer> = new ReplaySubject<CloudContainer>(1);
//   public deletedContainerAvailable: ReplaySubject<CloudContainer> = new ReplaySubject<CloudContainer>(1);

//   public async notifyNewContainer(container: CloudContainer) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewContainer", JSON.stringify(container)).catch(error => console.log(error))
//   }
//   public async notifyDeletedContainer(container: CloudContainer) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedContainer", JSON.stringify(container)).catch(error => console.log(error))
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
