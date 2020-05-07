// import { Injectable, OnDestroy } from '@angular/core';
// import { HubConnection, HubConnectionBuilder, HubConnectionState, HttpTransportType, LogLevel } from '@aspnet/signalr';
// import { MemberShared } from '../member-shared.model';
// import { BehaviorSubject, ReplaySubject } from 'rxjs';
// import { QuickTask } from '../quick-task.model';
// import { TeamMember } from '../team-member.model.';
// import { BackEndWebServer } from 'src/infrastructure/back-end-server';

// @Injectable()
// export class TeamMemberSignalrService {


//   private hubConnection: HubConnection;

//   constructor(private memberShared: MemberShared) {
//     // #TODO, END CONNECTION WHEN LOGGED OUT. CHECK TOKEN
//     this.memberShared.token.subscribe((async token => {
//       if (token == '0') {
//         //this.hubConnection.stop();
//       } else {
//         let baseURL = BackEndWebServer + '/'
//         let builder = new HubConnectionBuilder();
//         this.hubConnection = builder.withUrl(baseURL + 'api/hubs/TeamMemberNotificationHub', {
//           //transport: HttpTransportType.WebSockets, skipNegotiation: true,
//           accessTokenFactory: () => { return token },
//         }).configureLogging(LogLevel.Information).build();

//         this.hubConnection.on("NewTeamMemberAvailable", async (teamMember: string, mode: string) => {
//           if (mode == 'new') { // Gelen kutusu
//             await this.newTeamMemberJoinedAvailable.next(JSON.parse(teamMember))
//           }
//           else if (mode == 'update') { // Daveti kabul ettiğinde takım sahibi ve takım arkadaşlarının sayfasını güncelle.
//             await this.newTeamMemberAvailable.next(JSON.parse(teamMember))
//           }
//         });
//         this.hubConnection.on("DeletedTeamMemberAvailable", async (teamMember: string) => {
//           await this.deletedTeamMemberAvailable.next(JSON.parse(teamMember)) // communicates with id
//         });
//         await this.hubConnection.start().catch(error => console.error(error));

//         this.hubConnection.onclose(() => {
//           setTimeout(async function () {
//             await this.hubConnection.start();
//           }, 5000);
//         });
//       }
//     }))

//   }

//   public newTeamMemberAvailable: ReplaySubject<TeamMember> = new ReplaySubject<TeamMember>(1);
//   public newTeamMemberJoinedAvailable: ReplaySubject<TeamMember> = new ReplaySubject<TeamMember>(1);

//   public deletedTeamMemberAvailable: ReplaySubject<TeamMember> = new ReplaySubject<TeamMember>(1);

//   public async notifyNewTeamMember(teamMember: TeamMember, mode: string = 'new') {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyNewTeamMember", JSON.stringify(teamMember), mode).catch(error => console.log(error))
//   }

//   public async notifyDeletedTeamMember(teamMember: TeamMember) {
//     if (this.hubConnection.state == HubConnectionState.Connected)
//       await this.hubConnection.invoke("NotifyDeletedTeamMember", JSON.stringify(teamMember)).catch(error => console.log(error))
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
