import { Injectable, HostListener, Optional } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { QuickTask } from '../quick-task.model';
import { PrivateTalkMessage } from '../private-talk-message.model';
import { PrivateTalk } from '../private-talk.model';
import { Project } from '../project.model';
import { CloudFile } from '../azure-models/cloud-file.model';
import { CloudContainer } from '../azure-models/cloud-container.model';
import { BackEndWebServer } from 'src/infrastructure/back-end-server';
import { ProjectTaskComment } from '../project-task-comment.model';
import { ProjectTask } from '../project-task.model';
import { QuickTaskComment } from '../quick-task-comment.model';
import { TeamMember } from '../team-member.model.';
import { TeamsService } from '../services/teams.service';
import { PrivateTalksService } from '../services/private-talks.service';
import { QuickToDoCommentsService } from '../services/quick-to-do-comments.service';
import { ProjectToDoCommentsService } from '../services/project-to-do-comments.service';
import { combineLatest, concatMap, switchMap } from 'rxjs/operators';
import { QuickToDosService } from '../services/quick-to-dos.service';
import { ProjectToDosService } from '../services/project-to-dos.service';
import { ProjectsService } from '../services/projects.service';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { MemberShared } from '../member-shared.model';

@Injectable()
export class NotificationService {

  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  constructor(private memberShared: MemberShared, @Optional() private swUpdate: SwUpdate, @Optional() private swPush: SwPush, private teamService: TeamsService, private privateTalkService: PrivateTalksService, private quickToDoService: QuickToDosService, private projectToDoService: ProjectToDosService, private projectService: ProjectsService) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    // Notification.requestPermission().then(() => {
    // });

    if (swPush && swUpdate && this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe((evt) => {
        console.log('service worker updated');
        var update = confirm('Xyzeki\'inin yeni bir sürümü mevcut hemen şimdi sayfanızı güncellemek ister misiniz? Şu an doldurduğunuz bir form var ise daha sonra yapmanız önerilir.');
        if (!update)
          return;

        swUpdate.activateUpdate().then(() => document.location.reload());
      });

      // this.swUpdate.checkForUpdate().then(() => { //checks periodically for update
      //   // noop
      // }).catch((err) => {
      //   console.error('error when checking for update', err);
      // });

      this.swPush.notificationClicks.subscribe(event => {
        this.openXyzeki();
        // switch (event.action) {
        //   case 'xyzekiyiAc':
        //     this.openXyzeki(); break;
        // }

      });

    }



  }
  openXyzeki = () => {
    // event.preventDefault(); // prevent the browser from focusing the Notification's tab
    window.open(BackEndWebServer, '_self');
  }
  get isNotificationGranted(): boolean {
    return Notification.permission == 'granted'
  }
  //Takımlar 
  pushNotifyNewTeamMember(teamMember: TeamMember) {
    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;

    this.teamService.findTeam(teamMember.TeamId).subscribe(team => {
      let title = "1 Yeni Takım Davetiyeniz Var, " + team.TeamName
      let options: NotificationOptions = {
        icon: '../../../assets/logo/notificationLogo.jpg',
        requireInteraction: false,
        tag: 'Xyzeki',
        body: 'Takımlar ve daha sonra davetiyelerinize giderek davetiyenizi yanıtlayabilirsiniz.',
        image: '../../../assets/logo/notificationImage.jpg',
        vibrate: [200, 100, 200],
        silent: false,
        badge: '../../../assets/logo/logo.png',
        // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
      };
      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          reg.showNotification(title, options);
        });
    })

  }

  //Görevler
  pushNotifyNewQuickTask(quickTask: QuickTask) {
    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;

    if (isNullOrUndefined(quickTask.AssignedTo) || quickTask.AssignedTo == quickTask.Owner) { // find better solution later.
      return;
    }



    let titleX = "1 Yeni Göreviniz Var";
    if (quickTask.Owner == this.memberShared.Username) {
      if (isNullOrUndefined(quickTask.Status)) {
        quickTask.Status = 'Bekliyor';
      }
      titleX = `Verdiğiniz Görev ${quickTask.Status}`
    }
    let options: NotificationOptions = {
      icon: '../../../assets/logo/notificationLogo.jpg',
      requireInteraction: false,
      tag: 'Xyzeki',
      body: quickTask.TaskTitle,
      image: '../../../assets/logo/notificationImage.jpg',
      vibrate: [200, 100, 200],
      silent: false,
      badge: '../../../assets/logo/logo.png',
      // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
    };

    navigator.serviceWorker.getRegistration()
      .then((reg) => {
        reg.showNotification(titleX, options);
      });

  }

  //İş Konuşmaları  
  pushNotifyNewMessage(privateTalkMessage: PrivateTalkMessage) {
    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;

    this.privateTalkService.findPrivateTalk(privateTalkMessage.PrivateTalkId).subscribe(privateTalk => {
      let title = "1 Yeni Mesajınız Var, " + privateTalk.Thread;
      let options: NotificationOptions = {
        icon: '../../../assets/logo/notificationLogo.jpg',
        requireInteraction: false,
        tag: 'Xyzeki',
        body: privateTalkMessage.Message,
        image: '../../../assets/logo/notificationImage.jpg',
        vibrate: [200, 100, 200],
        silent: false,
        badge: '../../../assets/logo/logo.png',
        // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
      };

      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          reg.showNotification(title, options);
        });

    })


  }

  //Projeler
  pushNotifyNewProject(project: Project) {
    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;

    if(project.Owner == this.memberShared.Username){ // only single way signal
      return;
    }

    this.projectService.isProjectAssigned(project.ProjectId).subscribe(answer => {
      if (!answer)
        return;

      let title = "1 Yeni Projeniz Var, " + project.ProjectName;
      let options: NotificationOptions = {
        icon: '../../../assets/logo/notificationLogo.jpg',
        requireInteraction: false,
        tag: 'Xyzeki',
        body: project.ProjectName + ' isimli proje veya listeye atandınız.',
        image: '../../../assets/logo/notificationImage.jpg',
        vibrate: [200, 100, 200],
        silent: false,
        badge: '../../../assets/logo/logo.png',
        // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
      };
      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          reg.showNotification(title, options);
        });
    })


  }

  //Dosyalar // #todo
  pushNotifyNewBlob(file: CloudFile) {
    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;

    let title = "1 Yeni Dosya Yüklendi, " // + container.ContainerName;
    let options: NotificationOptions = {
      icon: '../../../assets/logo/notificationLogo.jpg',
      requireInteraction: false,
      tag: 'Xyzeki',
      body: file.FileName + ' isimli dosya yüklendi >> ' + file.ContainerName,
      image: '../../../assets/logo/notificationImage.jpg',
      vibrate: [200, 100, 200],
      silent: false,
      badge: '../../../assets/logo/logo.png',
      // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
    };
    navigator.serviceWorker.getRegistration()
      .then((reg) => {
        reg.showNotification(title, options);
      });
  }


  //Yorumlar 
  pushNotifyNewPTComment(projectTaskComment: ProjectTaskComment) {
    if (projectTaskComment.Sender == this.memberShared.Username) // it sends itself too
      return;

    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;

    let projectTask: ProjectTask = new ProjectTask(0, null);
    this.projectToDoService.projectToDo(projectTaskComment.TaskId).pipe(concatMap(projectToDo => {
      projectTask = projectToDo;
      return this.projectService.findProject(projectToDo.ProjectId)
    })).subscribe(project => {
      let title = project.ProjectName + " Projenize 1 Yeni Not/Yorum Bırakıldı"
      let options: NotificationOptions = {
        icon: '../../../assets/logo/notificationLogo.jpg',
        requireInteraction: false,
        tag: 'Xyzeki',
        body: projectTaskComment.Message + " >> " + projectTask.TaskTitle,
        image: '../../../assets/logo/notificationImage.jpg',
        vibrate: [200, 100, 200],
        silent: false,
        badge: '../../../assets/logo/logo.png',
        // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
      };
      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          reg.showNotification(title, options);
        });
    })


  }

  // #todo
  pushNotifyNewQTComment(quickTaskComment: QuickTaskComment) {
    if (quickTaskComment.Sender == this.memberShared.Username)  // it sends itself too
      return;

    if (!this.isNotificationGranted)
      return;

    if (!this.swPush)
      return;

    if (!this.swPush.isEnabled)
      return;



    this.quickToDoService.findQuickToDo(quickTaskComment.TaskId).subscribe(quickTask => {
      let title = "1 Yeni Not/Yorum Bırakıldı"
      let options: NotificationOptions = {
        icon: '../../../assets/logo/notificationLogo.jpg',
        requireInteraction: false,
        tag: 'Xyzeki',
        body: quickTaskComment.Message + " >> " + quickTask.TaskTitle,
        image: '../../../assets/logo/notificationImage.jpg',
        vibrate: [200, 100, 200],
        silent: false,
        badge: '../../../assets/logo/logo.png',
        // actions: [{ action: 'xyzekiyiAc', title: 'Xyzeki\'yi aç', icon: '../../../assets/logo/logo.png' }]
      };
      // if ('actions' in Notification.prototype) {
      //   // Action buttons are supported.
      // } else {
      //   // Action buttons are NOT supported.
      // }

      // navigator.serviceWorker.register('sw.js');
      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          reg.showNotification(title, options);
        });
    })


  }
}
