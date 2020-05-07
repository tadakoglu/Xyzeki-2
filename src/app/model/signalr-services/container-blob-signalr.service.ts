// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { ReplaySubject } from 'rxjs';
// import { CloudFile } from '../azure-models/cloud-file.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class ContainerBlobSignalrService {

//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {
//     this.memberShared.token.subscribe(async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/ContainerBlobNotificationHub', {
//           //transport: HttpTransportType.WebSockets, skipNegotiation:true, 
//           accessTokenFactory: () => { return token },
//         }).configureLogging(LogLevel.Information).build();
//         this.hubConnection.on("NewContainerBlobAvailable", async (containerBlob: string) => {
//           await this.newContainerBlobAvailable.next(JSON.parse(containerBlob))
//         });
//         this.hubConnection.on("DeletedContainerBlobAvailable", async (containerBlob: string) => {
//           await this.deletedContainerBlobAvailable.next(JSON.parse(containerBlob))
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

//   public newContainerBlobAvailable: ReplaySubject<CloudFile> = new ReplaySubject<CloudFile>(1);
//   public deletedContainerBlobAvailable: ReplaySubject<CloudFile> = new ReplaySubject<CloudFile>(1);

//   public async notifyNewContainerBlob(containerBlob: CloudFile) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewContainerBlob", JSON.stringify(containerBlob)).catch(error => console.log(error))
//   }
//   public async notifyDeletedContainerBlob(containerBlob: CloudFile) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedContainerBlob", JSON.stringify(containerBlob)).catch(error => console.log(error))
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
