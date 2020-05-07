// import { Injectable, EventEmitter } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
// import { PrivateTalkMessage } from '../private-talk-message.model';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class PrivateTalkMessageSignalrService {

//     private hubConnection: HubConnection;

//     constructor(private memberShared: MemberShared) {
//         this.memberShared.token.subscribe(async token => {
//             if (token == '0') {
//                 //this.hubConnection.stop();
//             } else {
//                 let baseURL = BackEndWebServer + '/'
//                 let builder = new HubConnectionBuilder();
//                 this.hubConnection = builder.withUrl(baseURL + 'api/hubs/PrivateTalkMessageNotificationHub', { 
//                     //transport: HttpTransportType.WebSockets, skipNegotiation:true, 
//                     accessTokenFactory: () => { return token },    
//                 }).configureLogging(LogLevel.Information).build();
//                 this.hubConnection.on("NewPrivateTalkMessageAvailable",async (privateTalkMessage: string, isTypingSignal:boolean) => {
//                     await this.newPrivateTalkMessageAvailable.next([JSON.parse(privateTalkMessage),isTypingSignal])
//                 });
//                 await this.hubConnection.start().catch(error => console.error(error));

//                 this.hubConnection.onclose(() => {
//                     setTimeout(async function () {
//                       await this.hubConnection.start();
//                     }, 5000);
//                   });
//             }
//         })
//     }

//     public newPrivateTalkMessageAvailable: EventEmitter<[PrivateTalkMessage,boolean]>  = new EventEmitter();

//     public async notifyNewPrivateTalkMessage(privateTalkMessage: PrivateTalkMessage, isTypingSignal: boolean = false) {
//         if (this.hubConnection.state == HubConnectionState.Connected)
//            await this.hubConnection.invoke("NotifyNewPrivateTalkMessage", JSON.stringify(privateTalkMessage),isTypingSignal).catch(error => console.log(error))
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
