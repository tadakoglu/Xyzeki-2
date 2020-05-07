// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { BehaviorSubject, ReplaySubject } from 'rxjs';
// import { PrivateTalk } from '../private-talk.model';
// import { PrivateTalkReceiver } from '../private-talk-receiver.model';
// import { PrivateTalkTeamReceiver } from '../private-talk-team-receiver.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class PrivateTalkSignalrService {

//     private hubConnection: HubConnection;

//     constructor(private memberShared: MemberShared) {
//         this.memberShared.token.subscribe(async token => {
//             if (token == '0') {
//                 //this.hubConnection.stop();
//             } else {
//                 let baseURL = BackEndWebServer + '/'
//                 let builder = new HubConnectionBuilder();
//                 this.hubConnection = builder.withUrl(baseURL + 'api/hubs/PrivateTalkNotificationHub', {
//                     //transport: HttpTransportType.WebSockets, skipNegotiation: true,
//                     accessTokenFactory: () => { return token },
//                 }).configureLogging(LogLevel.Information).build();

//                 this.hubConnection.on("DeletedPrivateTalkAvailable", async (privateTalk: string, receivers: string, teamReceivers: string) => {
//                     await this.deletedPrivateTalkJoinedAvailable.next(JSON.parse(privateTalk))
//                 });

//                 this.hubConnection.on("NewPrivateTalkAvailable", async (privateTalk: string, receivers: string, teamReceivers: string) => {
//                     await this.newPrivateTalkJoinedAvailable.next(JSON.parse(privateTalk))
//                 });

//                 await this.hubConnection.start().catch(error => console.error(error));

//                 this.hubConnection.onclose(() => {
//                     setTimeout(async function () {
//                         await this.hubConnection.start();
//                     }, 5000);
//                 });
//             }
//         })
//     }



//     public deletedPrivateTalkJoinedAvailable: ReplaySubject<PrivateTalk> = new ReplaySubject<PrivateTalk>(1);
//     public newPrivateTalkJoinedAvailable: ReplaySubject<PrivateTalk> = new ReplaySubject<PrivateTalk>(1);

//     public async notifyDeletedPrivateTalkJoined(privateTalkDeleted: PrivateTalk, receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]) {
//         if (this.hubConnection.state == HubConnectionState.Connected)
//             await this.hubConnection.invoke("NotifyDeletedPrivateTalk", JSON.stringify(privateTalkDeleted), JSON.stringify(receivers), JSON.stringify(teamReceivers)).catch(error => console.log(error))
//     }

//     public async notifyNewPrivateTalk(privateTalk: PrivateTalk, receivers: PrivateTalkReceiver[], teamReceivers: PrivateTalkTeamReceiver[]) {
//         if (this.hubConnection.state == HubConnectionState.Connected)
//             await this.hubConnection.invoke("NotifyNewPrivateTalk", JSON.stringify(privateTalk), JSON.stringify(receivers), JSON.stringify(teamReceivers)).catch(error => console.log(error))
//     }
//     public notifyPrivateTalkLastSeen(privateTalkId: number) {
//         if (this.hubConnection.state == HubConnectionState.Connected)
//             this.hubConnection.invoke("NotifyPrivateTalkLastSeen", privateTalkId).catch(error => console.log(error))
//     }

//     // public async closeHubConnection() {
//     //     if (this.hubConnection && this.hubConnection.state == HubConnectionState.Connected) {
//     //       await this.hubConnection.stop();
//     //     }
//     //   }
//     //   public async  openHubConnection() {
//     //     if (this.hubConnection && this.hubConnection.state == HubConnectionState.Disconnected) {
//     //       await this.hubConnection.start();
//     //     }
//     //   }
// }


