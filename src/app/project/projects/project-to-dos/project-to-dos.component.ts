import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectToDosService } from 'src/app/model/services/project-to-dos.service';
import { NgbDateStruct, NgbDate, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { ProjectTask } from 'src/app/model/project-task.model';
import { ProjectToDoRepository } from 'src/app/model/repository/project-to-do-repository';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/model/services/shared/data.service';
import { ProjectRepository } from 'src/app/model/repository/project-repository';
import { Project } from 'src/app/model/project.model';
import { MemberShared } from 'src/app/model/member-shared.model';
import { DatePipe } from '@angular/common';
import { AssignAutocompleteComponent } from 'src/app/ui-tools/assign-autocomplete/assign-autocomplete.component';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { MembersService } from 'src/app/model/services/members.service';
import { moveItemInArray, CdkDragDrop, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { TaskCommentsComponent } from 'src/app/comment/task-comments/task-comments.component';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { XyzekiDateTimeInfra } from 'src/infrastructure/xyzeki-datetime-infra';
import { SwitchHourDataService } from 'src/app/model/services/shared/switch-hour-data.service';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { TimeService } from 'src/app/model/services/time.service';
import { CommentCountModel } from 'src/app/model/comment-count.model';

@Component({
  selector: 'app-project-to-dos',
  templateUrl: './project-to-dos.component.html',
  styleUrls: ['./project-to-dos.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})
export class ProjectToDosComponent implements OnInit, OnDestroy, AfterViewInit {

  // hourAreaDropList;
  ngAfterViewInit(): void {
    this.switchDaySubscription = this.dataService.newSwitchDayEvent.subscribe(dayDateStr => {
      this.switchDay(dayDateStr);
    })
    this.searchSubscription = this.dataService.newDeepSearchEvent.subscribe(searchValue => {
      this.normalSearchPT(searchValue);
    })
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'hidden', Left: 0 + 'px', Top: 0 + 'px' })
    // this.hourAreaDropList = this.switchHourDataService.hourAreaDropListRef
  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
    this.switchDaySubscription ? this.switchDaySubscription.unsubscribe() : () => { };

    this.switchHourDataService.setupStyle.next({ isOpen: false, Visibility: 'hidden', Left: 0 + 'px', Top: 0 + 'px' })

  }


  private searchSubscription: Subscription
  private switchDaySubscription: Subscription
  ngOnInit(): void {
    // this.repository.openHubConnection();
    // this.repositoryTM.openHubConnection();
    // this.route.paramMap.subscribe(params => {
    //   this.projectId = Number.parseInt(params.get('ProjectId'))
    //   this.repository.loadProject(this.projectId);

    //   //this.repository = new ProjectToDoRepository(projectToDosService, this.projectId, projectToDoSignalrService, memberShared, commentSignalService, projectSignalService, repositoryProject, dataService, timeService)
    //   // this.switchHourDataService.projectToDoRepository = this.repository;
    //   Object.assign(this.projectToDoModel, new ProjectTask(this.projectId, null))
    //   //this.projectToDoModel = new ProjectTask(this.projectId, null)
    //   // 
    // })

    this.route.data.subscribe((resolvedData: { projectToDos: ProjectTask[], ptCommentsCount: CommentCountModel[] }) => {
      this.projectId = Number.parseInt(this.route.snapshot.paramMap.get('ProjectId'))
      this.repository.loadProjectsToDosViaResolver(resolvedData.projectToDos, this.projectId);
      this.repository.loadProjectsToDosCommentsCountViaResolver(resolvedData.ptCommentsCount);
      Object.assign(this.projectToDoModel, new ProjectTask(this.projectId, null))
    })


    this.setAsToday('Deadline');
  }

  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  public projectToDoModel: ProjectTask = new ProjectTask(0, undefined, undefined, undefined, undefined, undefined, undefined, false, 0, 0, false, 0, false, undefined);
  public projectId: number;

  normalSearchPT(searchValue) { // connect to 'input' event with fromEvent observable
    this.searchValue = searchValue;
  }
  public searchValue;

  private searchFilter: any = (pt: ProjectTask) => { return this.searchValue ? pt.TaskTitle.includes(this.searchValue) : pt };

  constructor(public repository: ProjectToDoRepository, public switchHourDataService: SwitchHourDataService, private dateTimeInfra: XyzekiDateTimeInfra, private repositoryTM: TeamMemberRepository, private permissions: MemberLicenseRepository, public repositoryProject: ProjectRepository, private dataService: DataService, private route: ActivatedRoute,
    private router: Router, private projectToDosService: ProjectToDosService,
    private projectToDoSignalrService: XyzekiSignalrService,
    public memberShared: MemberShared, private memberServ: MembersService,
    private dialog: MatDialog, private commentSignalService: XyzekiSignalrService,
    private projectSignalService: XyzekiSignalrService, private changeDetection: ChangeDetectorRef, private timeService: TimeService) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    //this.toggleProjectToDoPanel();
  }
  public taskStatus: string[] = ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
  setStatus(taskId) {
    if (this.permissions.getAccessGranted()) {
      let pTask: ProjectTask = Object.assign({}, this.repository.getProjectToDos().find((val, index, obj) => val.TaskId == taskId)) // object assign doesnt allow undefined values to be assigned, checking them.

      if (!pTask)
        return;

      let currentStatus = pTask.Status;
      if (currentStatus) {
        let statusIndex = this.taskStatus.findIndex((stat) => stat == currentStatus);
        let nextIndex = (++statusIndex % 4);
        pTask.Status = this.taskStatus[nextIndex];
        if (nextIndex == 3) { // only in completed form, there will be finish and iscompleted values,.. not in pending, getting done, about to finish: these are all uncompleted
          pTask.IsCompleted = true;
          // let date = new Date();
          // date.setHours(0, 0, 0, 0);
          // pTask.Finish = date.toISOString();
          this.repository.saveProjectToDo(pTask, false, 1); // 1 means now
        } else {
          pTask.IsCompleted = false;
          // pTask.Finish = null;
          this.repository.saveProjectToDo(pTask, false, 0); // 0 means null
        }

      } else { // so null ( cevap bekleniyor)
        pTask.Status = this.taskStatus[1]; // set to 'Yapılıyor'
        this.repository.saveProjectToDo(pTask);
      }



    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }


  zIndexStyle(Zindex) {
    if (Zindex > 0)
      return { "background-color": "#faf9f9" };
    else
      return { "background-color": "#fffff" };
  }


  increaseTaskIndent(pTask: ProjectTask) {
    let pt: ProjectTask = Object.assign({}, pTask);
    pt.Zindex++;

    if (pt.Zindex > 1) {
      pt.Zindex = 1;
      return;
    }



    this.repository.saveProjectToDo(pt);
  }
  decreaseTaskIndent(pTask: ProjectTask) {
    let pt: ProjectTask = Object.assign({}, pTask);
    pt.Zindex--;

    if (pt.Zindex < 0)
      pt.Zindex = 0;

    this.repository.saveProjectToDo(pt);
  }
  showSubTasks(pTask: ProjectTask) {
    let pt = Object.assign({}, pTask);
    pt.ShowSubTasks = true;
    this.repository.saveProjectToDo(pt);
  }
  hideSubTasks(pTask: ProjectTask) {
    let pt = Object.assign({}, pTask);
    pt.ShowSubTasks = false;
    this.repository.saveProjectToDo(pt);
  }


  isProjectTaskShown(pt: ProjectTask): boolean {
    if (this.dayDateStr != 'Tümü') {
      return true
    }
    let copyPt = Object.assign({}, pt);
    if (copyPt.Zindex == 0) {
      return true;
    }
    let previousIndex = this.repository.getProjectToDos().findIndex((val => val.TaskId == copyPt.TaskId)) - 1;
    // if(previousIndex < 0){
    //   return true;
    // }
    
    while (0 <= previousIndex) {
      let upperTask: ProjectTask = this.repository.getProjectToDos()[previousIndex];

      if (upperTask.Zindex > copyPt.Zindex)
        return true;

      if (upperTask.Zindex < copyPt.Zindex)
        break;

      previousIndex--;
    }

    let father: ProjectTask = this.repository.getProjectToDos()[previousIndex]
    if (!father) // no father
      return true;

    if (father.ShowSubTasks)
      return true;
    else
      return false;
  }


  isSubTaskFounded(pt: ProjectTask): boolean {
    let copyPt = Object.assign({}, pt);
    if (copyPt.Zindex == 1) {
      return false;
    }
    let nextIndex = this.repository.getProjectToDos().findIndex((val => val.TaskId == copyPt.TaskId)) + 1
    let subTask = Object.assign({}, this.repository.getProjectToDos()[nextIndex]);
    if (subTask && subTask.Zindex > copyPt.Zindex)
      return true;
    else
      return false;
  }

  @ViewChild(TaskCommentsComponent) commentsDialog;
  dialogRef: MatDialogRef<TaskCommentsComponent>
  showCommentsDialog(taskId, title) {
    if(this.innerWidth < 600){
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.className = null;
    }
    //ref https://blog.angular-university.io/angular-material-dialog/
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.hasBackdrop = true;
    // dialogConfig.autoFocus = true;
    // dialogConfig.disableClose = true; 
    dialogConfig.panelClass = 'mat-dialog-container' //adds a list of custom CSS classes to the Dialog panel
    //dialogConfig.backdropClass = '' //adds a list of custom CSS classes to the dialog backdrop
    //dialogConfig.position = { 'top': '400px' };
    //dialogConfig.width, height, minWidth, minHeight, maxWidth and maxHeight

    dialogConfig.maxHeight = this.innerHeight - 100;

    if (this.innerWidth <= 576) {
      dialogConfig.maxWidth = this.innerWidth - 10; //px is assumed  
    } else if (this.innerWidth > 577 && this.innerWidth < 768) {
      dialogConfig.maxWidth = '400px';
    }
    else {
      dialogConfig.maxWidth = '600px';
    }
    if(this.innerWidth < 786){
      dialogConfig.autoFocus = false;
    }
    dialogConfig.data = {
      taskId: taskId,
      kind: 'ptComments',
      title: title
    };

    //this.changeDetection.detach(); // for slow textinput problem in angular

    this.dialogRef = this.dialog.open(TaskCommentsComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
      //this.changeDetection.reattach(); // for slow textinput problem in angular

      if(this.innerWidth < 600){
        let element: HTMLElement = document.getElementsByTagName('html')[0]
        element.classList.add('hizlandir');
      }
    

    });



    // #todo last

    // this.dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });


  }
  closeCommentsDialog() {
    this.dialogRef.close();
  }

  getProject(projectId): Project {
    let p = this.repositoryProject.getProject(projectId)
    if (p == undefined)
      p = this.repositoryProject.getProjectAssigned(projectId);
    return p;
  }

  checkPrivacy(privacy, projectId) {
    let proj = Object.assign({}, this.getProject(projectId));
    proj.Privacy = privacy; // modes: onlyOwner, onlyOwnerAndPM, openOnlyTasks,listMode, open

    this.repositoryProject.saveProject(proj)
  }

  public projectToDos(): ProjectTask[] {
    return this.repository.getProjectToDos().filter(this.dayFilter).filter(this.arcFilter).filter(this.searchFilter);
  }
  // get projectToDos(): ProjectTask[] {
  //   return this.repository.getProjectToDos().filter(this.dayFilter).filter(this.arcFilter).filter(this.searchFilter);
  // }
  public getPTCommentsForCount(taskId) {
    if (this.repository.getPTCommentsCount())
      return this.repository.getPTCommentsCount().find(comment => comment.TaskId == taskId)
  }
  private arcFilter: any = (pt) => { if (!pt.Archived == true) return pt }; // closed at first.


  drop(event: CdkDragDrop<ProjectTask[]>) {
    if (this.permissions.getAccessGranted()) {

      let item1: ProjectTask = this.projectToDos().find((val, index, obj) => index == event.previousIndex);
      let indexPrevious = this.repository.getProjectToDos().findIndex((val => val.TaskId == item1.TaskId))

      let item2: ProjectTask = this.projectToDos().find((val, index, obj) => index == event.currentIndex);
      let indexCurrent = this.repository.getProjectToDos().findIndex((val => val.TaskId == item2.TaskId))

      if (indexPrevious == indexCurrent) {
        return;
      }

      if (!this.repository.checkOwnerOrProjectManager(item1.TaskId))
        return;

      // burada hedef saptırma yap. taşınılan yerdeki ana görev kapalıysa(alt görevleri) bu durumda
      // current index bu görev yerine en dipteki subtask'in index değerine atanmalı. aksi halde sorun çıkıyor.
      if (!item2.ShowSubTasks && indexCurrent > indexPrevious) // taşınan yerdeki görev kapalıysa(alt görevleri var ise)
      {
        // taşınan yerdeki görevin en alttaki subtaskini bul
        //1) Find subtasks, OK
        let subTasksOfTarget: ProjectTask[] = []
        let indexTarget = indexCurrent + 1;
        while (indexTarget < this.repository.getProjectToDos().length) {
          let subTaskElementOfTarget = Object.assign({}, this.repository.getProjectToDos()[indexTarget]);
          if (subTaskElementOfTarget.Zindex <= item2.Zindex)
            break;

          subTasksOfTarget.push(subTaskElementOfTarget);
          indexTarget++;
        }
        if (subTasksOfTarget.length > 0) {
          let deepestSubTask = subTasksOfTarget[subTasksOfTarget.length - 1]
          indexCurrent = this.repository.getProjectToDos().findIndex((val => val.TaskId == deepestSubTask.TaskId))
        }

      }

      //1) Find subtasks, OK
      let subTasks: ProjectTask[] = []
      let index = indexPrevious + 1;
      while (index < this.repository.getProjectToDos().length) {
        let subTaskElement = Object.assign({}, this.repository.getProjectToDos()[index]);
        if (subTaskElement.Zindex <= item1.Zindex)
          break;

        subTasks.push(subTaskElement);
        index++;
      }




      //2) Move first task, OK
      moveItemInArray(this.repository.getProjectToDos(), indexPrevious, indexCurrent);

      let cancelSubTaskMovement = false;

      // This is in TEST, BUT REQUIRED
      if (indexCurrent > indexPrevious) { // aşağı yönde task subtaskin içine sürüklenirse seviye farkı var ise iptal et(alt görevlerin taşınması iptal)
        let founded = subTasks.find(val => val.TaskId == item2.TaskId); // ya da bırakılan yerde sub task var ise ve aşağı yönde sürükleniyorsa iptal et.
        if (founded != undefined)
          cancelSubTaskMovement = true;
      }

      //3) Move subtasks
      if (!cancelSubTaskMovement) {

        if (indexCurrent < indexPrevious) { // yukarı yön(alt görev başlama pozisyonunda artış oluyor)
          let current = indexCurrent + 1;
          subTasks.forEach((subTaskVal, index, arr) => {
            let subTaskIndexPrevious = this.repository.getProjectToDos().findIndex((val => val.TaskId == subTaskVal.TaskId))
            moveItemInArray(this.repository.getProjectToDos(), subTaskIndexPrevious, current);
            current++;
          })
        }
        else { // aşağı yönde taşıma oluyosa ( alt görev yeni pozisyon ana görev ile aynı oluyor(bir kayma söz konusu çünkü))
          let current = this.repository.getProjectToDos().findIndex(val => val.TaskId == item1.TaskId);
          // let current = indexCurrent;
          subTasks.forEach((subTaskVal, index, arr) => {
            let subTaskIndexPrevious = this.repository.getProjectToDos().findIndex((val => val.TaskId == subTaskVal.TaskId))
            moveItemInArray(this.repository.getProjectToDos(), subTaskIndexPrevious, current);
          })
        }

      }

      this.repository.reOrderAndSavePT(this.projectId);



    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }

  public getMember(username): Member {
    let member: Member = this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
    if (member == undefined)
      member = this.repositoryTM.getTeamMembersJoinedAsMembers().find(m => m.Username == username);
    return member;
  }
  private dayFilter: any = (qt) => { return qt };

  public dayDateStr: string;
  switchDay(dayDateStr) {
    if (dayDateStr != 'ArsivKutusu') {
      this.projectToDoModel.Archived = false;
      this.closeArchived();
    }


    this.dayDateStr = dayDateStr;
    if (dayDateStr == "Tümü") {
      this.showAll();
      this.startDate = null;
      this.deadlineDate = null;
      this.projectToDoModel.Start = null;
      this.projectToDoModel.Deadline = null;
      this.timeDeadline = { hour: 0, minute: 0, second: 0 }
      this.timeStart = { hour: 0, minute: 0, second: 0 }
    } else if (dayDateStr == "Gecikmiş") {
      this.showLateToDos();
      this.startDate = null;
      this.deadlineDate = null;
      this.projectToDoModel.Start = null;
      this.projectToDoModel.Deadline = null;
      this.timeDeadline = { hour: 0, minute: 0, second: 0 }
      this.timeStart = { hour: 0, minute: 0, second: 0 }
    } else if (dayDateStr == "ArsivKutusu") {
      this.showArchived();
      this.startDate = null;
      this.deadlineDate = null;
      this.projectToDoModel.Start = null;
      this.projectToDoModel.Deadline = null;
      this.timeDeadline = { hour: 0, minute: 0, second: 0 }
      this.timeStart = { hour: 0, minute: 0, second: 0 }
      this.projectToDoModel.Archived = true;
    }
    else {
      this.showToDosOfTheDay(dayDateStr);
      this.dayDateStr = 'Gün'
      //easy day assignment to task adding
      let date = new Date(dayDateStr);
      let dateSelected: NgbDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } // getMonth starts at 0


      let deadLineAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-red';
      let startAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-green';

      if (deadLineAllowed)
        this.onSelectDeadlineDate(dateSelected)
      else {
        this.onSelectDeadlineDate(null)
      }
      if (startAllowed)
        this.onSelectStartDate(dateSelected);
      else {
        this.onSelectStartDate(null);
      }



    }
    this.focusOnInputCreate();
  }
  showAll() {
    this.dayFilter = (qt) => { return qt };
  }
  showLateToDos() {
    this.dayFilter = (pt: ProjectTask) => {
      let dateDeadline = new Date(pt.Deadline)
      let dateStart = new Date(pt.Start)
      let now = new Date()

      if (pt.Start && pt.Deadline) { // başlangıç zamanı şu andan küçük ve de hala başlamamış olanları göster VEYA bitiş tarih zamanı şu andan küçük ve tamamlanmamış olanları göster
        let diff = ((now.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.

        let diff2 = ((now.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.

        if ((diff > 0 && minutediff >= 1 && (pt.Status == 'Bekliyor' || pt.Status == null))
          || (diff2 > 0 && minutediff2 >= 1 && !pt.IsCompleted))
          return pt;

        // ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
      } else if (pt.Start) { // başlangıç zamanı şu andan küçük ve de hala başlamamış olanları göster(sadece bekliyor olanları)
        let diff = ((now.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff > 0 && minutediff >= 1 && (pt.Status == 'Bekliyor' || pt.Status == null))
          return pt;
      }
      else if (pt.Deadline) { // bitiş tarih zamanı şu andan küçük ve tamamlanmamış olanları göster
        let diff = ((now.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff > 0 && minutediff >= 1 && !pt.IsCompleted)
          return pt;
      }
    };
  }

  isTaskLate(pt: ProjectTask, type: number): boolean { // return true if tasks is being late by start or deadline, TYPE is FOR PERFORMANCE
    let dateDeadline = new Date(pt.Deadline)
    let dateStart = new Date(pt.Start)
    let now = new Date()

    if (type == 0) { // başlangıç zamanı şu andan küçük ve de hala başlamamış olanları göster(sadece bekliyor olanları)
      let diff = ((now.getTime() - dateStart.getTime()) / 1000)
      let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
      if (diff > 0 && minutediff >= 1 && (pt.Status == 'Bekliyor' || pt.Status == null))
        return true;
    }
    else if (type == 1) { // bitiş tarih zamanı şu andan küçük ve tamamlanmamış olanları göster
      let diff = ((now.getTime() - dateDeadline.getTime()) / 1000)
      let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
      if (diff > 0 && minutediff >= 1 && !pt.IsCompleted)
        return true;
    }
    else { // For performance reasons.
      let diff = ((now.getTime() - dateStart.getTime()) / 1000)
      let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.

      let diff2 = ((now.getTime() - dateDeadline.getTime()) / 1000)
      let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.

      if ((diff > 0 && minutediff >= 1 && (pt.Status == 'Bekliyor' || pt.Status == null))
        || (diff2 > 0 && minutediff2 >= 1 && !pt.IsCompleted))
        return true;

      // ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
    }
    return false;
  }
  showToDosOfTheDay(dayDateStr) { // seçilen gün başlangıç ve bitiş tarihleri dahil aralığında ise göster.
    this.dayFilter = (pt: ProjectTask) => {
      let dateDeadline = new Date(pt.Deadline)
      let dateStart = new Date(pt.Start)
      let date = new Date(dayDateStr)
      dateDeadline.setHours(0, 0, 0, 0);
      dateStart.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);


      if (pt.Start && pt.Deadline) { // seçilen tarih başlangıç ile bitiş arasında(veya eşit) ise göster.
        let diff = ((date.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.

        let diff2 = ((date.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.


        if (diff >= 0 && minutediff >= 0 && diff2 <= 0 && minutediff2 >= 0 && !this.isTaskLate(pt, 2)) // bugün doğru değil ise !isLate iptal.
          return pt;

      } else if (pt.Start) {
        let diff = ((date.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff == 0 && minutediff == 0 && !this.isTaskLate(pt, 0))
          return pt;
      }
      else if (pt.Deadline) {
        let diff2 = ((date.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff2 == 0 && minutediff2 == 0 && !this.isTaskLate(pt, 1))
          return pt;
      }
    };
  }
  showArchived() {
    this.showAll();
    this.arcFilter = (pt: ProjectTask) => {
      if (pt.Archived)
        return pt;
    }
  }
  closeArchived() {
    this.arcFilter = (pt) => { if (!pt.Archived == true) return pt }; // closed
  }
  onAssignedToEvent($event) {
    this.projectToDoModel.AssignedTo = $event as string;
    this.projectToDoModel.Status = null;
  }

  newProjectToDoPanelOpen: boolean = false;
  toggleProjectToDoPanel() {
    if (this.newProjectToDoPanelOpen == false) {
      this.newProjectToDoPanelOpen = true;
      this.focusOnInputCreate();
    }
    else
      this.newProjectToDoPanelOpen = false;

  }

  @ViewChild('editChild') editChild: AssignAutocompleteComponent;

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  @ViewChild('projectToDoEditForm') form: NgForm;
  onKeydownEvent(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      event.preventDefault(); // surpass enter
      this.form.ngSubmit.emit();
      this.form.reset();
    }
  }

  modelSentEdit: boolean = false;
  modelSubmittedEdit: boolean = false; // That's for validation method
  editProjectToDo(projectToDoEditForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmittedEdit = true;
      if (projectToDoEditForm.valid) {
        this.repository.saveProjectToDo(this.projectToDoModelEdit)
        this.projectToDoModelEdit = new ProjectTask(0, null);

        this.dateEdit = null;
        this.dateEditStart = null;

        this.modelSentEdit = true;
        this.modelSubmittedEdit = false;
        this.editProjectToDoPanelOpen = false;
        this.oldTaskId = 0;
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  focusOnInputCreate() {
    setTimeout(() => {
      if (document.getElementById('textForFocusCreate'))
        document.getElementById('textForFocusCreate').focus();
    }, 10);
  }
  projectToDoModelEdit: ProjectTask = new ProjectTask(0, null);
  addProjectToDo(projectToDoForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmitted = true;
      if (projectToDoForm.valid) {
        this.repository.saveProjectToDo(this.projectToDoModel)
        this.modelSent = true;
        this.modelSubmitted = false;
        this.projectToDoModel = new ProjectTask(this.projectId, null, this.projectToDoModel.AssignedTo, null, this.projectToDoModel.Start, null, this.projectToDoModel.Deadline, false, 0, 0, this.projectToDoModel.Archived);
        this.focusOnInput();
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }
  invalidLicensePanelOpen: boolean = false;

  datePipe = new DatePipe('tr-TR');
  editProjectToDoPanelOpen: boolean = false;
  oldTaskId: number = 0;
  toggleEditProjectToDoPanel(taskId: number) {
    if (!this.repository.checkOwnerOrProjectManager(taskId))
      return;

    if (this.oldTaskId == 0 || this.oldTaskId == taskId) {
      if (this.editProjectToDoPanelOpen == false) {
        this.editProjectToDoPanelOpen = true;
        // load
        Object.assign(this.projectToDoModelEdit, this.repository.getProjectToDos().find(val => val.TaskId == taskId))

        if (this.projectToDoModelEdit.Deadline != null) {
          let datetime: string[] = this.datePipe.transform(this.projectToDoModelEdit.Deadline, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

          let date: string[] = datetime[0].split('/')
          let time: string[] = datetime[1].split(':')

          this.dateEdit = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
          this.timeEdit = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };


        } else {
          this.dateEdit = null;
          this.timeEdit = { hour: 0, minute: 0, second: 0 };
        }


        if (this.projectToDoModelEdit.Start != null) {
          let datetime: string[] = this.datePipe.transform(this.projectToDoModelEdit.Start, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

          let date: string[] = datetime[0].split('/')
          let time: string[] = datetime[1].split(':')

          this.dateEditStart = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
          this.timeEditStart = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };

        } else {
          this.dateEditStart = null;
          this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        }

        setTimeout(() => {
          this.editChild.selectTeamMember(this.projectToDoModelEdit.AssignedTo, false)
          //this.datePickerEdit.toggle();         
        }, 250);
        this.focusOnInput();
        // load
      }
      else {
        this.editProjectToDoPanelOpen = false;
        // load
        this.projectToDoModelEdit = new ProjectTask(0, null);
        this.dateEdit = null;
        this.dateEditStart = null;
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        // load

      }

    }
    else {
      this.editProjectToDoPanelOpen = true;
      // load
      Object.assign(this.projectToDoModelEdit, this.repository.getProjectToDos().find(val => val.TaskId == taskId))

      if (this.projectToDoModelEdit.Deadline != null) {
        let datetime: string[] = this.datePipe.transform(this.projectToDoModelEdit.Deadline, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

        let date: string[] = datetime[0].split('/')
        let time: string[] = datetime[1].split(':')

        this.dateEdit = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
        this.timeEdit = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };


      } else {
        this.dateEdit = null;
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
      }


      if (this.projectToDoModelEdit.Start != null) {
        let datetime: string[] = this.datePipe.transform(this.projectToDoModelEdit.Start, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

        let date: string[] = datetime[0].split('/')
        let time: string[] = datetime[1].split(':')

        this.dateEditStart = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
        this.timeEditStart = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };

      } else {
        this.dateEditStart = null;
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
      }

      setTimeout(() => {
        this.editChild.selectTeamMember(this.projectToDoModelEdit.AssignedTo, false)
        //this.datePickerEdit.toggle();
      }, 250);
      this.focusOnInput();
      // load
    }
    this.oldTaskId = taskId;
  }

  dateEditStart: NgbDateStruct = null
  timeEditStart: NgbTimeStruct = { hour: 0, minute: 0, second: 0 } // hour: 0, 23; minute: 0,59, second: 0,59

  onSelectDateEditStart(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.dateEditStart = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.projectToDoModelEdit.Start = this.dateTimeInfra.setupDate(this.projectToDoModelEdit.Start, dateString)

      }
      else {
        this.dateEditStart = null;
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModelEdit.Start = this.dateTimeInfra.setupDate(this.projectToDoModelEdit.Start, null)
      }
    } catch (error) {
      this.dateEditStart = null;
      this.timeEditStart = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModelEdit.Start = this.dateTimeInfra.setupDate(this.projectToDoModelEdit.Start, null)
    }

  }
  onSelectTimeEditStart(time: NgbTimeStruct) {
    try {
      if (this.dateEditStart == null)
        return;

      if (time != null) {
        this.timeEditStart = time;
        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()

        let timeString = `${hour}:${minute}:${second}`
        this.projectToDoModelEdit.Start = this.dateTimeInfra.setupTime(this.projectToDoModelEdit.Start, timeString);
      }
      else {
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModelEdit.Start = this.dateTimeInfra.setupTime(this.projectToDoModelEdit.Start, null);
      }
    } catch (error) {
      this.timeEditStart = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModelEdit.Start = this.dateTimeInfra.setupTime(this.projectToDoModelEdit.Start, null);
    }
  }


  dateEdit: NgbDateStruct = null
  timeEdit: NgbTimeStruct = { hour: 0, minute: 0, second: 0 } // hour: 0, 23; minute: 0,59, second: 0,59

  onSelectDateEdit(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.dateEdit = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.projectToDoModelEdit.Deadline = this.dateTimeInfra.setupDate(this.projectToDoModelEdit.Deadline, dateString)
      }
      else {
        this.dateEdit = null;
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModelEdit.Deadline = this.dateTimeInfra.setupDate(this.projectToDoModelEdit.Deadline, null)
      }
    } catch (error) {
      this.dateEdit = null;
      this.timeEdit = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModelEdit.Deadline = this.dateTimeInfra.setupDate(this.projectToDoModelEdit.Deadline, null)
    }
  }
  onSelectTimeEdit(time: NgbTimeStruct) {
    try {
      if (this.dateEdit == null)
        return;

      if (time != null) {
        this.timeEdit = time;
        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()

        let timeString = `${hour}:${minute}:${second}`
        this.projectToDoModelEdit.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModelEdit.Deadline, timeString);
      }
      else {
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModelEdit.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModelEdit.Deadline, null);
      }
    } catch (error) {
      this.timeEdit = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModelEdit.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModelEdit.Deadline, null);
    }
  }



  onAssignedToEventEdit($event) {
    this.projectToDoModelEdit.AssignedTo = $event as string;
    this.projectToDoModelEdit.Status = null;
  }

  setAsToday(val) {
    var startDate = new Date();
    let year = startDate.getFullYear()
    let month: number = startDate.getMonth() + 1;
    let day = startDate.getDate();

    let monthNew: string = month < 10 ? '0' + month : month.toString()
    let dayNew: string = day < 10 ? '0' + day : day.toString()

    if (val == 'Start') {

      this.projectToDoModel.Start = `${year}-${monthNew}-${dayNew}`

      this.startDate = { year: year, month: month, day: day }
    }
    else if (val == 'Deadline') {
      this.projectToDoModel.Deadline = `${year}-${monthNew}-${dayNew}` + `T00:00+0300`
      this.deadlineDate = { year: year, month: month, day: day }
    }
  }

  //Important Note: Validate date model format in UI with regex, because NgbDateStruct value can be 'f',1993, 22 only, because it fires on change event.


  startDate: NgbDateStruct = null
  timeStart: NgbTimeStruct = { hour: 0, minute: 0, second: 0 } // hour: 0, 23; minute: 0,59, second: 0,59
  onSelectStartDate(date: NgbDateStruct) { // ** new
    try {
      if (date != null) {
        this.startDate = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.projectToDoModel.Start = this.dateTimeInfra.setupDate(this.projectToDoModel.Start, dateString)

        this.projectToDoModel.Start = this.dateTimeInfra.setupTime(this.projectToDoModel.Start, '09:00:00');
        this.timeStart = { hour: 9, minute: 0, second: 0 }
      }
      else {
        this.startDate = null;
        this.timeStart = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModel.Start = this.dateTimeInfra.setupDate(this.projectToDoModel.Start, null)
      }
    } catch (error) {
      this.startDate = null;
      this.timeStart = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModel.Start = this.dateTimeInfra.setupDate(this.projectToDoModel.Start, null)
    }

  }
  onSelectTimeStart(time: NgbTimeStruct) {
    try {
      if (this.startDate == null)
        return;

      if (time != null) {
        this.timeStart = time;
        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()

        let timeString = `${hour}:${minute}:${second}`
        this.projectToDoModel.Start = this.dateTimeInfra.setupTime(this.projectToDoModel.Start, timeString);
      }
      else {
        this.timeStart = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModel.Start = this.dateTimeInfra.setupTime(this.projectToDoModel.Start, null);
      }
    } catch (error) {
      this.timeStart = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModel.Start = this.dateTimeInfra.setupTime(this.projectToDoModel.Start, null);
    }
  }

  deadlineDate: NgbDateStruct = null;
  timeDeadline: NgbTimeStruct = { hour: 0, minute: 0, second: 0 } // hour: 0, 23; minute: 0,59, second: 0,59
  onSelectDeadlineDate(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.deadlineDate = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.projectToDoModel.Deadline = this.dateTimeInfra.setupDate(this.projectToDoModel.Deadline, dateString)

        this.projectToDoModel.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModel.Deadline, '18:00:00');
        this.timeDeadline = { hour: 18, minute: 0, second: 0 }
      }
      else {
        this.deadlineDate = null;
        this.timeDeadline = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModel.Deadline = this.dateTimeInfra.setupDate(this.projectToDoModel.Deadline, null)
      }
    } catch (error) {
      this.deadlineDate = null;
      this.timeDeadline = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModel.Deadline = this.dateTimeInfra.setupDate(this.projectToDoModel.Deadline, null)
    }
  }
  onSelectTimeDeadline(time: NgbTimeStruct) {
    try {
      if (this.deadlineDate == null)
        return;

      if (time != null) {
        this.timeDeadline = time;
        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()

        let timeString = `${hour}:${minute}:${second}`
        this.projectToDoModel.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModel.Deadline, timeString);
      }
      else {
        this.timeDeadline = { hour: 0, minute: 0, second: 0 };
        this.projectToDoModel.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModel.Deadline, null);
      }
    } catch (error) {
      this.timeDeadline = { hour: 0, minute: 0, second: 0 };
      this.projectToDoModel.Deadline = this.dateTimeInfra.setupTime(this.projectToDoModel.Deadline, null);
    }
  }

  deleteProjectToDo(taskId) {
    if (this.permissions.getAccessGranted()) {
      this.repository.deleteProjectToDo(taskId);
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  completePT(projToDo: ProjectTask) {
    if (this.permissions.getAccessGranted()) {
      let projectToDo: ProjectTask = Object.assign({}, projToDo);
      if (projectToDo) {
        projectToDo.IsCompleted = true;
        // let finish: Date = new Date();
        // finish.setHours(0, 0, 0, 0);
        // projectToDo.Finish = finish.toISOString();
        projectToDo.Status = this.taskStatus[3]
        this.repository.saveProjectToDo(projectToDo, false, 1);
      }
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  deCompletePT(projToDo: ProjectTask) {
    if (this.permissions.getAccessGranted()) {
      let projectToDo: ProjectTask = Object.assign({}, projToDo);
      if (projectToDo) {
        projectToDo.IsCompleted = false;
        // projectToDo.Finish = null;
        projectToDo.Status = this.taskStatus[0]
        this.repository.saveProjectToDo(projectToDo, false, 0);
      }
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  // date picker settings
  isWeekend(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return d.getDay() === 0 || d.getDay() === 6;
  }

  isDisabled(date: NgbDateStruct, current: { month: number }) {
    return date.month !== current.month;
  }

  private today = new Date();

  isToday = (date: NgbDate) => {
    return date.day == this.today.getDate() &&
      date.month == this.today.getMonth() + 1 &&
      date.year == this.today.getFullYear();
  }
  isTomorrow = (date: NgbDate) => {

    var tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(this.today.getDate() + 1);

    return date.day == tomorrow.getDate() &&
      date.month == tomorrow.getMonth() + 1 &&
      date.year == tomorrow.getFullYear();
  }

  calendarButtonSelect(value: string, createMode = true, isDeadLine = true) {
    if (createMode) {
      switch (value) {
        case 'today':
          if (isDeadLine) {
            this.onSelectDeadlineDate(this.dateTimeInfra.todayDate[0])
          } else {
            this.onSelectStartDate(this.dateTimeInfra.todayDate[0])
          }
          break;
        case 'tomorrow':
          if (isDeadLine) {
            this.onSelectDeadlineDate(this.dateTimeInfra.tomorrowDate[0])
          } else {
            this.onSelectStartDate(this.dateTimeInfra.tomorrowDate[0])
          }

          break;

        case 'noDate':
          if (isDeadLine) {
            this.onSelectDeadlineDate(null)
          } else {
            this.onSelectStartDate(null)
          }

          break;
      }
    }
    else {
      switch (value) {
        case 'today':
          if (isDeadLine) {
            this.onSelectDateEdit(this.dateTimeInfra.todayDate[0])
          } else {
            this.onSelectDateEditStart(this.dateTimeInfra.todayDate[0])
          }


          break;

        case 'tomorrow':
          if (isDeadLine) {
            this.onSelectDateEdit(this.dateTimeInfra.tomorrowDate[0])
          } else {
            this.onSelectDateEditStart(this.dateTimeInfra.tomorrowDate[0])
          }
          break;

        case 'noDate':
          if (isDeadLine) {
            this.onSelectDateEdit(null)
          } else {
            this.onSelectDateEditStart(null)
          }
          break;
      }

    }
  }

  onDragStart(event: CdkDragStart) {
    if(this.innerWidth < 600){
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.className = null;
    }
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'visible', Left: this.left - 21 + 'px', Top: this.top + 'px' })

  } 

  getPosition(event) {
    let el = this.switchDayArea.nativeElement as HTMLDivElement
    let real = el.getBoundingClientRect()

    let switchHourComponentWidth = 62; // Defined in switchhour css file, two must be same.
    let left = real.left - switchHourComponentWidth;

    //let top = real.top + el.clientHeight; // Bu değer sürüklenen öğenin

    //let el2 = event.source.element.nativeElement

    let el2 = event.srcElement // mousedown

    let rect = el2.getBoundingClientRect()

    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    let draggedItemPositions = { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    let top = draggedItemPositions.top - 180;
    if (rect.top <= 180)
      top = draggedItemPositions.top
    return [left, top];
  }
  private left; private top

  @ViewChild('switchDayArea') switchDayArea: ElementRef

  getPositionPoor() {
    let el = this.switchDayArea.nativeElement as HTMLDivElement
    let real = el.getBoundingClientRect()

    let switchHourComponentWidth = 62; // Defined in switchhour css file, two must be same.
    let left = real.left - switchHourComponentWidth;

    let top = real.top + el.clientHeight; // Bu değer sürüklenen öğenin
    return [left, top]
  }
  onDragEnd(event: CdkDragEnd) {
    if(this.innerWidth < 600){
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.classList.add('hizlandir');
    }
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'hidden', Left: this.left - 21 + 'px', Top: this.top + 'px' })
  }


  onMouseDown(event) {
    let [left, top] = this.getPosition(event);
    this.left = left;
    this.top = top;
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'hidden', Left: left - 3.5 + 'px', Top: top + 'px' })
  }



}
