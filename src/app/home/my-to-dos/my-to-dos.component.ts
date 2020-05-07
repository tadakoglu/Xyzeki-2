import { Component, OnInit, AfterViewInit, HostListener, ViewChild, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MemberShared } from 'src/app/model/member-shared.model';
import { ProjectToDosService } from 'src/app/model/services/project-to-dos.service';
import { ProjectToDoRepository } from 'src/app/model/repository/project-to-do-repository';
import { ProjectTask } from 'src/app/model/project-task.model';
import { DataService } from 'src/app/model/services/shared/data.service';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { TaskCommentsComponent } from 'src/app/comment/task-comments/task-comments.component';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { ProjectRepository } from 'src/app/model/repository/project-repository';
import { Project } from 'src/app/model/project.model';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs';
import { SwitchHourDataService } from 'src/app/model/services/shared/switch-hour-data.service';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { TimeService } from 'src/app/model/services/time.service';

@Component({
  selector: 'app-my-to-dos',
  templateUrl: './my-to-dos.component.html',
  styleUrls: ['./my-to-dos.component.css'],
  changeDetection: ChangeDetectionStrategy.Default})
export class MyToDosComponent implements OnInit, AfterViewInit, OnDestroy {
  ngOnInit(): void {
    // this.repository.openHubConnection();
    // this.switchHourDataService.setupStyle.subscribe((c: { Left, Top, Display, Opacity }) => {
    //   this.switchHourStyle.Left = c.Left
    //   this.switchHourStyle.Top = c.Top
    //   this.switchHourStyle.Display = c.Display
    //   this.switchHourStyle.Opacity = c.Opacity;
    // })

  }
  //switchHourStyle = { Left: '0px', Top: '0px', Display: 'none', Opacity: '0' }
  ngAfterViewInit(): void {
    this.switchDaySubscription = this.dataService.newSwitchDayEvent.subscribe(dayDateStr => {
      this.switchDay(dayDateStr);
    })
    this.searchSubscription = this.dataService.newDeepSearchEvent.subscribe(searchValue => {
      this.deepSearchPT(searchValue);
    })
  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
    this.switchDaySubscription ? this.switchDaySubscription.unsubscribe() : () => { };
  }
  private searchSubscription: Subscription
  private switchDaySubscription: Subscription

  public taskStatus: string[] = ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
  setStatus(taskId) {
    if (this.permissions.getAccessGranted()) {
      // let pTask: ProjectTask = Object.assign({}, this.repository.getProjectToDos().find((val, index, obj) => val.TaskId == taskId)) // object assign doesnt allow undefined values to be assigned, checking them.
      // if (!pTask)
      //   pTask = Object.assign({}, this.repository.getProjectToDosAssignedToMe().find((val, index, obj) => val.TaskId == taskId))


      let pTask: ProjectTask = Object.assign({}, this.repository.getProjectToDosAssignedToMe().find((val, index, obj) => val.TaskId == taskId))

      if (!pTask)
        return;



      let currentStatus = pTask.Status;
      if (currentStatus) {
        let statusIndex = this.taskStatus.findIndex((stat) => stat == currentStatus);
        let nextIndex = (++statusIndex % 4);
        pTask.Status = this.taskStatus[nextIndex];
        if (nextIndex == 3) {
          pTask.IsCompleted = true;

          // let date = new Date();
          // date.setHours(0, 0, 0, 0);
          // pTask.Finish = date.toISOString();

          this.repository.saveProjectToDo(pTask, true, 1);
        } else {
          pTask.IsCompleted = false;
          // pTask.Finish = null;
          this.repository.saveProjectToDo(pTask, true, 0);
        }

      } else { // so null ( cevap bekleniyor)
        pTask.Status = this.taskStatus[1]; // set to 'Yapılıyor'
        this.repository.saveProjectToDo(pTask, true);
      }



    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }


  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }
  // private repository: ProjectToDoRepository
  constructor(private repository: ProjectToDoRepository, private switchHourDataService: SwitchHourDataService, private projectRepo: ProjectRepository, private permissions: MemberLicenseRepository, public dataService: DataService, private router: Router,
    public memberShared: MemberShared, private projectToDosService: ProjectToDosService,
    private projectToDoSignalrService: XyzekiSignalrService, private dialog: MatDialog,
    private commentSignalService: XyzekiSignalrService,
    private projectSignalService: XyzekiSignalrService, public changeDetection: ChangeDetectorRef, private timeService: TimeService) {
    // this.repository = new ProjectToDoRepository(this.projectToDosService, 0, projectToDoSignalrService, memberShared, commentSignalService, projectSignalService, projectRepo
    //   , dataService, timeService);
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  isMyProj(projectId): boolean {
    return this.projectRepo.getMyProjects().find(p => p.ProjectId == projectId) != undefined;
  }
  getProject(projectId): Project {
    let p = this.projectRepo.getMyProjects().find(p => p.ProjectId == projectId);
    if (p == undefined)
      p = this.projectRepo.getMyProjectsAssigned().find(p => p.ProjectId == projectId);
    return p;
  }
  getProjectSpecial(projectId): Project {
    let p = this.projectRepo.getMyProjects().find(p => p.ProjectId == projectId);
    if (p == undefined)
      p = this.projectRepo.getMyProjectsAssignedWithoutPrivacyFilter().find(p => p.ProjectId == projectId);
    return p;
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

  // projectToDosAssignedToMe pager

  pageNo = 1;
  pageSize = 5;

  getNumberOfPages() {
    return Math.ceil(this.repository.getProjectToDosAssignedToMe().filter(pt => pt.IsCompleted == false && pt.Archived != true).filter(this.dayFilter).sort((a, b) => new Date(b.Start).getTime() - new Date(a.Start).getTime()).length / this.pageSize);
  }
  nextPage() {
    this.pageNo += 1;
    this.loadNextIndexes();
  }
  previousPage() {
    this.pageNo -= 1;
    this.loadNextIndexes();
  }
  //  *0 1 2 3 4 *5 6 7 8 9 *10 11 12 13 *14 15
  // 0 + 5 = 5, 5+5 = 10, 10+5 = 15, last index is not included in slice.

  loadNextIndexes() {
    this.begin = ((this.pageNo - 1) * this.pageSize);
    this.end = this.begin + this.pageSize;
  }

  begin: number = 0
  end: number = 5 // equal to pageSize
  resetPager() {
    this.pageNo = 1;
    this.begin = 0;
    this.end = 5;
  }

  sortWithStart(a: ProjectTask, b: ProjectTask) {
    if (new Date(a.Start).getTime() === new Date(b.Start).getTime()) { // a=b return 0
      return 0;
    }
    else if (isNullOrUndefined(a.Deadline)) {
      return 1;
    }
    else if (isNullOrUndefined(b.Deadline)) {
      return -1;
    }
    else {
      return new Date(a.Start).getTime() < new Date(b.Start).getTime() ? -1 : 1;
    }
  }
  sortWithDeadline(a: ProjectTask, b: ProjectTask) {
    if (new Date(a.Deadline).getTime() === new Date(b.Deadline).getTime()) { // a=b return 0
      return 0;
    }
    else if (isNullOrUndefined(a.Deadline)) {
      return 1;
    }
    else if (isNullOrUndefined(b.Deadline)) {
      return -1;
    }
    else {
      return new Date(a.Deadline).getTime() < new Date(b.Deadline).getTime() ? -1 : 1;
    }
  }

  sortProjectToDosAssignedToMe(a: ProjectTask, b: ProjectTask) {
    let ascending = true;

    // equal items sort equally
    if (new Date(a.Start).getTime() === new Date(b.Start).getTime()) {
      return 0;
    }
    // nulls sort after anything else
    else if (isNullOrUndefined(a.Start)) {
      return 1;
    }
    else if (isNullOrUndefined(b.Start)) {
      return -1;
    }
    // otherwise, if we're ascending, lowest sorts first
    else if (ascending) {
      return new Date(a.Start).getTime() < new Date(b.Start).getTime() ? -1 : 1;
    }
    // // if descending, highest sorts first
    // else { 
    //     return a < b ? 1 : -1;
    // }

  }

  // end of projectToDosAssignedToMe pager
  get projectToDosAssignedToMe() {
    return this.repository.getProjectToDosAssignedToMe().filter(pt => pt.IsCompleted == false && pt.Archived != true).filter(this.dayFilter).
      sort((a, b) => this.sortProjectToDosAssignedToMe(a, b)).slice(this.begin, this.end);
  }
  public getPTAssignedCommentsForCount(taskId) {
    return this.repository.getPTAssignedCommentsCount().find(comment => comment.TaskId == taskId)
  }

  get assignedToMeCompleted() {
    return this.repository.getProjectToDosAssignedToMe().filter(pt => pt.IsCompleted == true && pt.Archived != true).filter(this.dayFilter);
  }


  deepSearchPT(searchValue) { // connect to 'input' event with fromEvent observable
    this.searchValue = searchValue;
    this.repository.deepSearch(this.searchValue);
    this.resetPager();
  }
  searchQTRepo(searchValue) { // doesnt send requests to server

  }

  public searchValue: string;

  private dayFilter: any = (qt) => { return qt };  // closed at first.


  public dayDateStr: string;
  switchDay(dayDateStr) {
    this.dayDateStr = dayDateStr;
    if (dayDateStr == "Tümü") {
      this.showAll();
    } else if (dayDateStr == "Gecikmiş") {
      this.showLateToDos();
    } else if (dayDateStr == "ArsivKutusu") {
      this.dayDateStr = 'ArsivKutusu';
      // Do nothing !
    }
    else {
      this.showToDosOfTheDay(dayDateStr);
      this.dayDateStr = 'Gün';
      // let date = new Date(dayDateStr);
      // let dateSelected: NgbDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } // getMonth starts at 0

    }
    this.resetPager();
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

        if (diff >= 0 && minutediff >= 0 && diff2 <= 0 && minutediff2 >= 0 && !this.isTaskLate(pt, 2))
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

  completePT(projectToDo: ProjectTask) {
    if (this.permissions.getAccessGranted()) {
      if (projectToDo) {
        projectToDo.IsCompleted = true;

        // let finish: Date = new Date();
        // finish.setHours(0, 0, 0, 0);
        // projectToDo.Finish = finish.toISOString();

        projectToDo.Status = this.taskStatus[3]

        this.repository.saveProjectToDo(projectToDo,true,1);
      }
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  invalidLicensePanelOpen = false;

}


  // Use observables and signalr instead.
  //public location: Location, 
  // refresh(){    

  //   //this.router.navigateByUrl('/').then(()=> { this.router.navigateByUrl("/XYZToDo");})
  //    this.router.navigateByUrl("/",{skipLocationChange:true}).then(()=> {
  //    console.log(decodeURI(this.location.path()))
  //    this.router.navigate([decodeURI(this.location.path())] )
  //    } );
  //    /*this.router.navigate(['/XYZToDo'], {
  //     queryParams: {refresh: new Date().getTime()} // this changes URL
  //  });*/
  // }