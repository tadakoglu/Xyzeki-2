import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input, ViewEncapsulation, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { QuickTask } from 'src/app/model/quick-task.model';
import { QuickToDoRepository } from 'src/app/model/repository/quick-to-do-repository';
import { NgbDateStruct, NgbDate, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { MemberShared } from 'src/app/model/member-shared.model';
import { AssignAutocompleteComponent } from 'src/app/ui-tools/assign-autocomplete/assign-autocomplete.component';
import { DatePipe } from '@angular/common';
import { DataService } from 'src/app/model/services/shared/data.service';
import { TeamMemberRepository } from 'src/app/model/repository/team-member-repository';
import { Member } from 'src/app/model/member.model';
import { CdkDragDrop, moveItemInArray, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TaskCommentsComponent } from 'src/app/comment/task-comments/task-comments.component';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { Subscription } from 'rxjs';
import { XyzekiDateTimeInfra } from 'src/infrastructure/xyzeki-datetime-infra';
import { SwitchHourDataService } from 'src/app/model/services/shared/switch-hour-data.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-quick-to-dos',
  templateUrl: './quick-to-dos.component.html',
  styleUrls: ['./quick-to-dos.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class QuickToDosComponent implements AfterViewInit, OnDestroy, OnInit {
  ngOnInit(): void {
    // this.quickTodoRepository.openHubConnection();
    // this.repositoryTM.openHubConnection();
    // this.pageNo = 1;
    // this.searchValue = undefined;
    // this.quickTodoRepository.loadAll(1);
  }

  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }



  ngAfterViewInit(): void {
    this.switchDaySubscription = this.dataService.newSwitchDayEvent.subscribe(dayDateStr => {
      this.switchDay(dayDateStr);
    })
    this.searchSubscription = this.dataService.newDeepSearchEvent.subscribe(searchValue => {
      this.deepSearchQT(searchValue);
    })
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'hidden', Left: this.getPositionPoor()[0] - 3.5 + 'px', Top: this.getPositionPoor()[1] + 'px' })

  }
  ngOnDestroy(): void {
    this.searchSubscription ? this.searchSubscription.unsubscribe() : () => { };
    this.switchDaySubscription ? this.switchDaySubscription.unsubscribe() : () => { };
    this.switchHourDataService.setupStyle.next({ isOpen: false, Visibility: 'hidden', Left: this.getPositionPoor()[0] - 3.5 + 'px', Top: this.getPositionPoor()[1] + 'px' })


  }
  private searchSubscription: Subscription
  private switchDaySubscription: Subscription

  focusOnInput() {
    setTimeout(() => {
      if (document.getElementById('textForFocus'))
        document.getElementById('textForFocus').focus();
    }, 10);
  }
  focusOnInputForEdit() {
    setTimeout(() => {
      if (document.getElementById('textForFocusEdit'))
        document.getElementById('textForFocusEdit').focus();
    }, 10);
  }
  constructor(private switchHourDataService: SwitchHourDataService, private dateTimeInfra: XyzekiDateTimeInfra,
    private repositoryTM: TeamMemberRepository, private permissions: MemberLicenseRepository,
    public memberShared: MemberShared, public quickTodoRepository: QuickToDoRepository,
    public dataService: DataService, private dialog: MatDialog, public changeDetection: ChangeDetectorRef) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    //request permission when opened logged in home page
    Notification.requestPermission().then(() => {
    });
  }

  @ViewChild(TaskCommentsComponent) commentsDialog;
  dialogRef: MatDialogRef<TaskCommentsComponent>
  showCommentsDialog(taskId, title) {

    if (this.innerWidth < 600) {
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
    // let ele = document.getElementById('QuickToDosContainer') as HTMLDivElement

    if (this.innerWidth < 786) {
      dialogConfig.autoFocus = false;
    }


    dialogConfig.data = {
      taskId: taskId,
      kind: 'qtComments',
      title: title
    };
    //this.changeDetection.detach(); // for slow textinput problem in angular

    this.dialogRef = this.dialog.open(TaskCommentsComponent, dialogConfig);

    this.dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
      //this.changeDetection.reattach(); // for slow textinput problem in angular

      if (this.innerWidth < 600) {
        let element: HTMLElement = document.getElementsByTagName('html')[0]
        element.classList.add('hizlandir');
      }


    });


  }
  closeCommentsDialog() {
    this.dialogRef.close();
  }
  // @ViewChild('QuickTasksArea') quickTasksArea : ElementRef;
  // getSwitchHoursPositionStyle(){
  //   let dv = this.quickTasksArea.nativeElement as HTMLDivElement;
  //   let style = {'position':'absolute', 'top': dv.offsetTop, 'left': dv.offsetLeft - 20, 'z-index': 999 }
  //   return style;
  // }
  drop(event: CdkDragDrop<QuickTask[]>) {
    if (this.permissions.getAccessGranted()) {

      if (this.quickToDoModel.Archived)
        return;
      let item1: QuickTask = this.myQuickToDos.find((val, index, obj) => index == event.previousIndex);
      let indexPrevious = this.quickTodoRepository.getMyQuickToDos().findIndex((val => val.TaskId == item1.TaskId))

      let item2: QuickTask = this.myQuickToDos.find((val, index, obj) => index == event.currentIndex);
      let indexCurrent = this.quickTodoRepository.getMyQuickToDos().findIndex((val => val.TaskId == item2.TaskId))

      moveItemInArray(this.quickTodoRepository.getMyQuickToDos(), indexPrevious, indexCurrent);

      this.quickTodoRepository.reOrderAndSaveQT();

    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);

    }

  }
  dropArc(event: CdkDragDrop<QuickTask[]>) {
    if (this.permissions.getAccessGranted()) {
      if (event.previousContainer === event.container) {
        return;
      }
      if (event.previousContainer.id === 'QuickToDosContainer') {
        let qtDragged: QuickTask = (event.item.data as QuickTask);
        if (event.container.id == 'ArsivKutusu') {
          qtDragged.Archived = true;
          qtDragged.Order = 0;
          qtDragged.ArchivedDate = new Date().toISOString(); // that could be changed with a better option
          this.quickTodoRepository.saveQuickToDo(qtDragged);
        }

      }
    } else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);

    }

  }
  @ViewChild('arsivSurukleAlani') arsivSurukleAlani: ElementRef
  @ViewChild('switchDayArea') switchDayArea: ElementRef

  onMouseDown(event) {
    let [left, top] = this.getPosition(event);
    this.left = left;
    this.top = top;
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'hidden', Left: left - 3.5 + 'px', Top: top + 'px' })
  }
  onDragStart(event: CdkDragStart) {
    if (this.innerWidth < 600) {
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.className = null;
    }

    // do something
    if (this.dayDateStr !== "ArsivKutusu") {
      this.arsivSurukleAlani.nativeElement.style.opacity = 1;
      this.arsivSurukleAlani.nativeElement.style.display = 'block';
    }
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'visible', Left: this.left - 3.5 + 'px', Top: this.top + 'px' })

  } onDragEnd(event: CdkDragEnd) {
    if (this.innerWidth < 600) {
      let element: HTMLElement = document.getElementsByTagName('html')[0]
      element.classList.add('hizlandir');
    }

    this.arsivSurukleAlani.nativeElement.style.display = 'none';
    this.switchHourDataService.setupStyle.next({ isOpen: true, Visibility: 'hidden', Left: this.left - 3.5 + 'px', Top: this.top + 'px' })
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
  getPositionPoor() {
    let el = this.switchDayArea.nativeElement as HTMLDivElement
    let real = el.getBoundingClientRect()

    let switchHourComponentWidth = 62; // Defined in switchhour css file, two must be same.
    let left = real.left - switchHourComponentWidth;

    let top = real.top + el.clientHeight; // Bu değer sürüklenen öğenin
    return [left, top]
  }




  public getQTCommentsForCount(taskId) {
    return this.quickTodoRepository.getQTCommentsCount().find(comment => comment.TaskId == taskId)
  }

  deepSearchQT(searchValue) { // connect to 'input' event with fromEvent observable
    this.quickTodoRepository.pageNo = 1;
    this.quickTodoRepository.searchValue = searchValue;
    this.quickTodoRepository.loadAll(this.quickTodoRepository.pageNo, this.quickTodoRepository.searchValue);
  }


  onScrollDown() {
    if (this.quickToDoModel.Archived) {
      this.quickTodoRepository.pageNo = this.quickTodoRepository.pageNo + 1;
      this.quickTodoRepository.loadMoreMyQuickToDos(this.quickTodoRepository.pageNo, this.quickTodoRepository.searchValue);
    }
  }
  archieve(quickToDo: QuickTask, mode) {
    if (this.permissions.getAccessGranted()) {
      if (quickToDo) {
        if (mode) {
          quickToDo.Archived = true;
          quickToDo.ArchivedDate = new Date().toISOString(); // that could be changed with a better option
          quickToDo.Order = 0;
          this.quickTodoRepository.saveQuickToDo(quickToDo);
        }
        else {
          quickToDo.Archived = false;
          quickToDo.ArchivedDate = null;
          this.quickTodoRepository.saveQuickToDo(quickToDo, true); // get next order for unarchieved item
        }



      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  public taskStatus: string[] = ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
  setStatus(taskId, type = 'my') {
    if (this.permissions.getAccessGranted()) {
      let qTask: QuickTask;
      if (type == 'my') {
        qTask = Object.assign({}, this.quickTodoRepository.getMyQuickToDos().find((val, index, obj) => val.TaskId == taskId)) // object assign doesnt allow undefined values to be assigned, checking them.
      } else {
        qTask = Object.assign({}, this.quickTodoRepository.getAssignedToMe().find((val, index, obj) => val.TaskId == taskId)) // object assign doesnt allow undefined values to be assigned, checking them.
      }

      if (!qTask)
        return;

      let currentStatus = qTask.Status;
      if (currentStatus) {
        let statusIndex = this.taskStatus.findIndex((stat) => stat == currentStatus);
        let nextIndex = (++statusIndex % 4);
        qTask.Status = this.taskStatus[nextIndex];
        if (nextIndex == 3) {
          qTask.Completedby = this.memberShared.Username;

          // let date = new Date();
          // date.setHours(0, 0, 0, 0);
          // qTask.Finish = date.toISOString();

          qTask.Archived = true;
          // qTask.ArchivedDate = new Date().toISOString();
          this.quickTodoRepository.saveQuickToDo(qTask, false, 1, 1);
        } else {
          qTask.Completedby = null;
          // qTask.Finish = null;
          this.quickTodoRepository.saveQuickToDo(qTask, false, 0, undefined);
        }

      } else { // so null ( cevap bekleniyor)
        qTask.Status = this.taskStatus[1]; // set to 'Yapılıyor'
        this.quickTodoRepository.saveQuickToDo(qTask);
      }



    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }



  get myQuickToDos(): QuickTask[] {
    return this.quickTodoRepository.getMyQuickToDos().filter(this.dayFilter).filter(this.arcFilter).sort(this.sortFilter) // both uncompleted and completed to dos in altogether
  }
  get assignedToMeUnComplete(): QuickTask[] { // only uncompleted to dos
    return this.quickTodoRepository.getAssignedToMe().filter(qt => qt.Completedby == null).filter(this.dayFilter).filter(this.arcFilter).sort(this.sortFilter);
  }
  public getMember(username): Member {
    if (this.repositoryTM.getTeamMembersOwnedAsMembers())
      return this.repositoryTM.getTeamMembersOwnedAsMembers().find(m => m.Username == username);
  }
  private sortFilter: any = (qt1, qt2) => (qt1.Order - qt2.Order);
  private dayFilter: any = (qt) => { return qt }; // closed at first.
  private arcFilter: any = (qt) => { if (!qt.Archived == true) return qt }; // closed at first.

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
            this.onSelectDate(this.dateTimeInfra.todayDate[0])
          } else {
            this.onSelectDateStart(this.dateTimeInfra.todayDate[0])
          }

          break;

        case 'tomorrow':
          if (isDeadLine) {
            this.onSelectDate(this.dateTimeInfra.tomorrowDate[0])
          } else {
            this.onSelectDateStart(this.dateTimeInfra.tomorrowDate[0])
          }

          break;

        case 'noDate':
          if (isDeadLine) {
            this.onSelectDate(null)
          } else {
            this.onSelectDateStart(null)
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

  onDateSelection(date: NgbDate) {
    if (!this.dateStart && !this.date) { // başlangıç tarihi ve teslim tarihi ayarlanmamış ise.
      this.onSelectDateStart(date);
    } else if (this.dateStart && !this.date && (date.after(this.dateStart) || date.equals(this.dateStart))) { //  // başlangıç tarihi ayarlanmış ve teslim tarihi ayarlanmamış ise.
      this.onSelectDate(date);
    } else {
      this.date = null;
      this.onSelectDateStart(date);
    }
  }

  hoveredDate: NgbDate;
  isHovered(date: NgbDate) {
    return this.dateStart && !this.date && this.hoveredDate && date.after(this.dateStart) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.dateStart) && date.before(this.date);
  }

  isRange(date: NgbDate) {
    return date.equals(this.dateStart) || date.equals(this.date) || this.isInside(date) || this.isHovered(date);
  }

  // end of range selection

  public dayDateStr: string;

  switchDay(dayDateStr) {
    if (dayDateStr != 'ArsivKutusu') {
      this.quickToDoModel.Archived = false;
      this.closeArchived();
    }

    this.dayDateStr = dayDateStr;
    if (dayDateStr == "Tümü") {
      this.showAll();

      this.date = null;
      this.dateStart = null;

      this.timeStart = { hour: 0, minute: 0, second: 0 }
      this.timeDeadline = { hour: 0, minute: 0, second: 0 }

      this.quickToDoModel.Date = null;
      this.quickToDoModel.Start = null;
    } else if (dayDateStr == "Gecikmiş") {
      this.showLateToDos();

      this.date = null;
      this.dateStart = null;

      this.timeStart = { hour: 0, minute: 0, second: 0 }
      this.timeDeadline = { hour: 0, minute: 0, second: 0 }

      this.quickToDoModel.Date = null;
      this.quickToDoModel.Start = null;

    } else if (dayDateStr == "ArsivKutusu") {
      this.showArchived();
      this.date = null;
      this.dateStart = null;

      this.timeStart = { hour: 0, minute: 0, second: 0 }
      this.timeDeadline = { hour: 0, minute: 0, second: 0 }

      this.quickToDoModel.Date = null;
      this.quickToDoModel.Start = null;

      this.quickToDoModel.ArchivedDate = new Date().toISOString();
      this.quickToDoModel.Archived = true;
    }
    else {
      this.showToDosOfTheDay(dayDateStr);

      this.dayDateStr = 'Gün';

      //easy day assignment to task adding
      let date = new Date(dayDateStr);
      let dateSelected: NgbDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() } // getMonth starts at 0

      let deadLineAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-red';
      let startAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-green';

      if (deadLineAllowed)
        this.onSelectDate(dateSelected)
      else {
        this.onSelectDate(null)
      }
      if (startAllowed)
        this.onSelectDateStart(dateSelected);
      else {
        this.onSelectDateStart(null)
      }
    }
  }

  showAll() {
    this.dayFilter = (qt) => { return qt };
  }

  showLateToDos() {
    this.dayFilter = (qt: QuickTask) => {
      let dateDeadline = new Date(qt.Date)
      let dateStart = new Date(qt.Start)
      let now = new Date()

      if (qt.Start && qt.Date) { // başlangıç zamanı şu andan küçük ve de hala başlamamış olanları göster VEYA bitiş tarih zamanı şu andan küçük ve tamamlanmamış olanları göster
        let diff = ((now.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.

        let diff2 = ((now.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.

        if ((diff > 0 && minutediff >= 1 && (qt.Status == 'Bekliyor' || qt.Status == null))
          || (diff2 > 0 && minutediff2 >= 1 && !qt.Completedby))
          return qt;

        // ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
      } else if (qt.Start) { // başlangıç zamanı şu andan küçük ve de hala başlamamış olanları göster(sadece bekliyor olanları)
        let diff = ((now.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff > 0 && minutediff >= 1 && (qt.Status == 'Bekliyor' || qt.Status == null))
          return qt;
      }
      else if (qt.Date) { // bitiş tarih zamanı şu andan küçük ve tamamlanmamış olanları göster
        let diff = ((now.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff > 0 && minutediff >= 1 && !qt.Completedby)
          return qt;
      }
    };
  }

  isTaskLate(qt: QuickTask, type: number): boolean { // return true if tasks is being late by start or deadline, TYPE is FOR PERFORMANCE
    let dateDeadline = new Date(qt.Date)
    let dateStart = new Date(qt.Start)
    let now = new Date()

    if (type == 0) { // başlangıç zamanı şu andan küçük ve de hala başlamamış olanları göster(sadece bekliyor olanları)
      let diff = ((now.getTime() - dateStart.getTime()) / 1000)
      let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
      if (diff > 0 && minutediff >= 1 && (qt.Status == 'Bekliyor' || qt.Status == null))
        return true;
    }
    else if (type == 1) { // bitiş tarih zamanı şu andan küçük ve tamamlanmamış olanları göster
      let diff = ((now.getTime() - dateDeadline.getTime()) / 1000)
      let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
      if (diff > 0 && minutediff >= 1 && !qt.Completedby)
        return true;
    }
    else { // For performance reasons.
      let diff = ((now.getTime() - dateStart.getTime()) / 1000)
      let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.

      let diff2 = ((now.getTime() - dateDeadline.getTime()) / 1000)
      let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.

      if ((diff > 0 && minutediff >= 1 && (qt.Status == 'Bekliyor' || qt.Status == null))
        || (diff2 > 0 && minutediff2 >= 1 && !qt.Completedby))
        return true;

      // ['Bekliyor', 'Yapılıyor', 'Tamamlanmak Üzere', 'Tamamlandı'] // max allowed length is 20 in db column
    }
    return false;
  }
  showToDosOfTheDay(dayDateStr) { // seçilen gün başlangıç ve bitiş tarihleri dahil aralığında ise göster.
    this.dayFilter = (qt: QuickTask) => {
      let dateDeadline = new Date(qt.Date)
      let dateStart = new Date(qt.Start)
      let date = new Date(dayDateStr)
      dateDeadline.setHours(0, 0, 0, 0);
      dateStart.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      if (qt.Start && qt.Date) { // seçilen tarih başlangıç ile bitiş arasında(veya eşit) ise göster.
        let diff = ((date.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.

        let diff2 = ((date.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.

        if (diff >= 0 && minutediff >= 0 && diff2 <= 0 && minutediff2 >= 0 && !this.isTaskLate(qt, 2))
          return qt;

      } else if (qt.Start) {
        let diff = ((date.getTime() - dateStart.getTime()) / 1000)
        let minutediff = Math.floor(Math.abs(diff) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff == 0 && minutediff == 0 && !this.isTaskLate(qt, 0))
          return qt;
      }
      else if (qt.Date) {
        let diff2 = ((date.getTime() - dateDeadline.getTime()) / 1000)
        let minutediff2 = Math.floor(Math.abs(diff2) / 60); // -0.15  0'a yuvarlanmalı.
        if (diff2 == 0 && minutediff2 == 0 && !this.isTaskLate(qt, 1))
          return qt;
      }
    };
  }

  showArchived() {
    this.showAll();
    this.arcFilter = (qt: QuickTask) => {
      if (qt.Archived)
        return qt;
    }
    this.sortFilter = (qt1, qt2) => new Date(qt2.ArchivedDate).getTime() - new Date(qt1.ArchivedDate).getTime();
  }
  closeArchived() {
    this.arcFilter = (qt) => { if (!qt.Archived == true) return qt }; // closed
    this.sortFilter = (qt1, qt2) => (qt1.Order - qt2.Order);
  }

  delete(quickToDoId: number) {
    if (this.permissions.getAccessGranted()) {
      this.quickTodoRepository.delete(quickToDoId);
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }
  }

  completeQT(quickToDo: QuickTask) {
    if (this.permissions.getAccessGranted()) {
      if (quickToDo) {
        quickToDo.Completedby = this.memberShared.Username;

        // let finish: Date = new Date();
        // finish.setHours(0, 0, 0, 0);
        // quickToDo.Finish = finish.toISOString();

        quickToDo.Archived = true;
        // quickToDo.ArchivedDate = new Date().toISOString();

        quickToDo.Order = 0;
        quickToDo.Status = this.taskStatus[3]
        this.quickTodoRepository.saveQuickToDo(quickToDo, false, 1, 1);
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);

    }

  }

  deCompleteQT(quickToDo: QuickTask) {
    if (this.permissions.getAccessGranted()) {
      if (quickToDo) {
        quickToDo.Completedby = null;
        // quickToDo.Finish = null;
        quickToDo.Status = this.taskStatus[0]
        this.quickTodoRepository.saveQuickToDo(quickToDo, false, 0, undefined);
      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);

    }
  }
  @ViewChild('datePickerEdit') datePickerEdit: any;
  @ViewChild('quickTaskEdit') quickTaskEdit: ElementRef;

  @ViewChild('editChild') editChild: AssignAutocompleteComponent;
  @ViewChild(AssignAutocompleteComponent) child: AssignAutocompleteComponent;

  onAssignedToEvent($event) {
    this.quickToDoModel.AssignedTo = $event as string;
    this.quickToDoModel.Status = null;
  }

  resetModel() {
    this.quickToDoModel = new QuickTask(null, null);
    this.date = null;
    this.dateStart = null;
    this.timeStart = { hour: 0, minute: 0, second: 0 }
    this.timeDeadline = { hour: 0, minute: 0, second: 0 }
    this.child.secimIptal();//reset assigner
  }

  public quickToDoModel: QuickTask = new QuickTask(null, null);
  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method
  saveQuickToDo(quickToDoForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmitted = true;
      if (quickToDoForm.valid) {
        if (this.quickToDoModel.Archived)
          this.quickToDoModel.ArchivedDate = new Date().toISOString();

        this.quickTodoRepository.saveQuickToDo(this.quickToDoModel)
        this.quickToDoModel = new QuickTask(null, null, null, this.quickToDoModel.Start, this.quickToDoModel.Date, null, this.quickToDoModel.AssignedTo, 0, 0, this.quickToDoModel.Archived);

        //this.child.secimIptal();//reset assigner
        //this.date = null;
        this.modelSent = true;
        this.modelSubmitted = false;
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

  newQuickToDoPanelOpen: boolean = false;
  toggleQuickToDoPanel() {
    if (this.newQuickToDoPanelOpen == false) {
      this.newQuickToDoPanelOpen = true;
    }
    else
      this.newQuickToDoPanelOpen = false;

  }

  public dateStart: NgbDateStruct = null
  public timeStart: NgbTimeStruct = { hour: 0, minute: 0, second: 0 } // hour: 0, 23; minute: 0,59, second: 0,59

  onSelectDateStart(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.dateStart = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.quickToDoModel.Start = this.dateTimeInfra.setupDate(this.quickToDoModel.Start, dateString)

        // let now = new Date();
        // if (now.getDate() == date.day && (now.getMonth() + 1) == date.month && now.getFullYear() == date.year) { // if selected today also add time as now
        //   let minutesLater = new Date()
        //   minutesLater.setMinutes(now.getMinutes() + 5); // deadline 5 min later automatically
        //   this.quickToDoModel.Start = this.dateTimeInfra.setupTime(this.quickToDoModel.Start, this.dateTimeInfra.getToTimeString(minutesLater))
        //   this.timeStart = { hour: minutesLater.getHours(), minute: minutesLater.getMinutes(), second: minutesLater.getSeconds() }
        // }
        // else { //another day
        //   this.quickToDoModel.Start = this.dateTimeInfra.setupTime(this.quickToDoModel.Start, '09:00:00');
        //   this.timeStart = { hour: 9, minute: 0, second: 0 }

        // }
        this.quickToDoModel.Start = this.dateTimeInfra.setupTime(this.quickToDoModel.Start, '09:00:00');
        this.timeStart = { hour: 9, minute: 0, second: 0 }

      }
      else {
        this.dateStart = null;
        this.timeStart = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModel.Start = this.dateTimeInfra.setupDate(this.quickToDoModel.Start, null)
      }
    } catch (error) {
      this.dateStart = null;
      this.timeStart = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModel.Start = this.dateTimeInfra.setupDate(this.quickToDoModel.Start, null)
    }

  }
  onSelectTimeStart(time: NgbTimeStruct) {
    try {
      if (this.dateStart == null)
        return;

      if (time != null) {
        this.timeStart = time;
        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()

        let timeString = `${hour}:${minute}:${second}`
        this.quickToDoModel.Start = this.dateTimeInfra.setupTime(this.quickToDoModel.Start, timeString);
      }
      else {
        this.timeStart = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModel.Start = this.dateTimeInfra.setupTime(this.quickToDoModel.Start, null);
      }
    } catch (error) {
      this.timeStart = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModel.Start = this.dateTimeInfra.setupTime(this.quickToDoModel.Start, null);
    }
  }


  public date: NgbDateStruct = null
  public timeDeadline: NgbTimeStruct = { hour: 0, minute: 0, second: 0 }
  onSelectDate(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.date = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.quickToDoModel.Date = this.dateTimeInfra.setupDate(this.quickToDoModel.Date, dateString)


        // if date is today
        // let now = new Date();
        // if (now.getDate() == date.day && (now.getMonth() + 1) == date.month && now.getFullYear() == date.year) { // if selected today also add time as now
        //   // let hourLater = new Date()
        //   // hourLater.setMinutes(now.getMinutes() + 60); // deadline one hour later automatically
        //   // this.quickToDoModel.Date = this.dateTimeInfra.setupTime(this.quickToDoModel.Date, this.dateTimeInfra.getToTimeString(hourLater))
        //   // this.timeDeadline = { hour: hourLater.getHours(), minute: hourLater.getMinutes(), second: hourLater.getSeconds() }
        // }
        // else{ //another day
        //   this.quickToDoModel.Date = this.dateTimeInfra.setupTime(this.quickToDoModel.Date, '18:00:00');
        //   this.timeDeadline = { hour: 18, minute: 0, second: 0 }

        // }

        this.quickToDoModel.Date = this.dateTimeInfra.setupTime(this.quickToDoModel.Date, '18:00:00');
        this.timeDeadline = { hour: 18, minute: 0, second: 0 }

      }
      else {
        this.date = null;
        this.timeDeadline = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModel.Date = this.dateTimeInfra.setupDate(this.quickToDoModel.Date, null)
      }
    } catch (error) {
      this.date = null;
      this.timeDeadline = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModel.Date = this.dateTimeInfra.setupDate(this.quickToDoModel.Date, null)
    }
  }
  onSelectTimeDeadline(time: NgbTimeStruct) {
    try {
      if (this.date == null)
        return;

      if (time != null) {
        this.timeDeadline = time;
        let hour: string = time.hour < 10 ? '0' + time.hour : time.hour.toString()
        let minute: string = time.minute < 10 ? '0' + time.minute : time.minute.toString()
        let second: string = time.second < 10 ? '0' + time.second : time.second.toString()

        let timeString = `${hour}:${minute}:${second}`
        this.quickToDoModel.Date = this.dateTimeInfra.setupTime(this.quickToDoModel.Date, timeString);
      }
      else {
        this.timeDeadline = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModel.Date = this.dateTimeInfra.setupTime(this.quickToDoModel.Date, null);
      }
    } catch (error) {
      this.timeDeadline = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModel.Date = this.dateTimeInfra.setupTime(this.quickToDoModel.Date, null);
    }
  }



  //Edit option
  public quickToDoModelEdit: QuickTask = new QuickTask(null, null);
  modelSentEdit: boolean = false;
  modelSubmittedEdit: boolean = false; // That's for validation method
  editQuickToDo(quickToDoEditForm: NgForm) {
    if (this.permissions.getAccessGranted()) {
      this.modelSubmittedEdit = true;
      if (quickToDoEditForm.valid) {
        this.quickTodoRepository.saveQuickToDo(this.quickToDoModelEdit)
        this.quickToDoModelEdit = new QuickTask(null, null);

        this.dateEdit = null;
        this.dateEditStart = null;

        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };

        this.modelSentEdit = true;
        this.modelSubmittedEdit = false;
        this.editQuickToDoPanelOpen = false;
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

  @ViewChild('quickToDoEditForm') form: NgForm;
  onKeydownEvent(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      event.preventDefault(); // surpass enter
      this.form.ngSubmit.emit();
      this.form.reset();
    }
  }

  datePipe = new DatePipe('tr-TR');
  editQuickToDoPanelOpen: boolean = false;
  oldTaskId: number = 0;

  toggleEditQuickToDoPanel(taskId: number) {
    if (this.oldTaskId == 0 || this.oldTaskId == taskId) {
      if (this.editQuickToDoPanelOpen == false) {
        this.editQuickToDoPanelOpen = true;
        // load
        Object.assign(this.quickToDoModelEdit, this.quickTodoRepository.getMyQuickToDos().find(val => val.TaskId == taskId))
        if (this.quickToDoModelEdit.Date != null) {
          let datetime: string[] = this.datePipe.transform(this.quickToDoModelEdit.Date, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

          let date: string[] = datetime[0].split('/')
          let time: string[] = datetime[1].split(':')

          this.dateEdit = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
          this.timeEdit = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };


        } else {
          this.dateEdit = null;
          this.timeEdit = { hour: 0, minute: 0, second: 0 };
        }

        if (this.quickToDoModelEdit.Start != null) {
          let datetime: string[] = this.datePipe.transform(this.quickToDoModelEdit.Start, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

          let date: string[] = datetime[0].split('/')
          let time: string[] = datetime[1].split(':')

          this.dateEditStart = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
          this.timeEditStart = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };

        } else {
          this.dateEditStart = null;
          this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        }

        setTimeout(() => {
          this.editChild.selectTeamMember(this.quickToDoModelEdit.AssignedTo, false)
          //this.datePickerEdit.toggle();         
        }, 250);

        this.focusOnInputForEdit();
        // load
      }
      else {
        this.editQuickToDoPanelOpen = false;
        // load
        this.quickToDoModelEdit = new QuickTask(null, null);
        this.dateEdit = null;
        this.dateEditStart = null;
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        // load

      }

    }
    else {
      this.editQuickToDoPanelOpen = true;
      // load
      Object.assign(this.quickToDoModelEdit, this.quickTodoRepository.getMyQuickToDos().find(val => val.TaskId == taskId))

      // same with upper, can be refactored.
      if (this.quickToDoModelEdit.Date != null) {
        let datetime: string[] = this.datePipe.transform(this.quickToDoModelEdit.Date, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

        let date: string[] = datetime[0].split('/')
        let time: string[] = datetime[1].split(':')

        this.dateEdit = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
        this.timeEdit = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };


      } else {
        this.dateEdit = null;
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
      }

      // same with upper , can be refactored.

      if (this.quickToDoModelEdit.Start != null) {
        let datetime: string[] = this.datePipe.transform(this.quickToDoModelEdit.Start, 'd/M/y H:m').split(' ') // H =0, 23, m=0, 59

        let date: string[] = datetime[0].split('/')
        let time: string[] = datetime[1].split(':')

        this.dateEditStart = { day: Number.parseInt(date[0]), month: Number.parseInt(date[1]), year: Number.parseInt(date[2]) }
        this.timeEditStart = { hour: Number.parseInt(time[0]), minute: Number.parseInt(time[1]), second: 0 };

      } else {
        this.dateEditStart = null;
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
      }
      //

      setTimeout(() => {
        this.editChild.selectTeamMember(this.quickToDoModelEdit.AssignedTo, false)
        //this.datePickerEdit.toggle();
      }, 250);
      this.focusOnInputForEdit();
      // load
    }
    this.oldTaskId = taskId;
  }

  dateEditStart: NgbDateStruct = null
  timeEditStart: NgbTimeStruct = { hour: 0, minute: 0, second: 0 }

  onSelectDateEditStart(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.dateEditStart = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.quickToDoModelEdit.Start = this.dateTimeInfra.setupDate(this.quickToDoModelEdit.Start, dateString)
      }
      else {
        this.dateEditStart = null;
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModelEdit.Start = this.dateTimeInfra.setupDate(this.quickToDoModelEdit.Start, null)
      }
    } catch (error) {
      this.dateEditStart = null;
      this.timeEditStart = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModelEdit.Start = this.dateTimeInfra.setupDate(this.quickToDoModelEdit.Start, null)
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
        this.quickToDoModelEdit.Start = this.dateTimeInfra.setupTime(this.quickToDoModelEdit.Start, timeString);
      }
      else {
        this.timeEditStart = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModelEdit.Start = this.dateTimeInfra.setupTime(this.quickToDoModelEdit.Start, null);
      }
    } catch (error) {
      this.timeEditStart = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModelEdit.Start = this.dateTimeInfra.setupTime(this.quickToDoModelEdit.Start, null);
    }
  }


  dateEdit: NgbDateStruct = null
  timeEdit: NgbTimeStruct = { hour: 0, minute: 0, second: 0 }
  onSelectDateEdit(date: NgbDateStruct) {
    try {
      if (date != null) {
        this.dateEdit = date;
        let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
        let day: string = date.day < 10 ? '0' + date.day : date.day.toString()

        let dateString = `${date.year}-${month}-${day}`;
        this.quickToDoModelEdit.Date = this.dateTimeInfra.setupDate(this.quickToDoModelEdit.Date, dateString)
      }
      else {
        this.dateEdit = null;
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModelEdit.Date = this.dateTimeInfra.setupDate(this.quickToDoModelEdit.Date, null)
      }
    } catch (error) {
      this.dateEdit = null;
      this.timeEdit = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModelEdit.Date = this.dateTimeInfra.setupDate(this.quickToDoModelEdit.Date, null)
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
        this.quickToDoModelEdit.Date = this.dateTimeInfra.setupTime(this.quickToDoModelEdit.Date, timeString);
      }
      else {
        this.timeEdit = { hour: 0, minute: 0, second: 0 };
        this.quickToDoModelEdit.Date = this.dateTimeInfra.setupTime(this.quickToDoModelEdit.Date, null);
      }
    } catch (error) {
      this.timeEdit = { hour: 0, minute: 0, second: 0 };
      this.quickToDoModelEdit.Date = this.dateTimeInfra.setupTime(this.quickToDoModelEdit.Date, null);
    }
  }
  onAssignedToEventEdit($event) {
    this.quickToDoModelEdit.AssignedTo = $event as string;
    this.quickToDoModelEdit.Status = null;
  }




}

/*
const reorderArray = (event, originalArray) => {
  const movedItem = originalArray.find((item, index) => index === event.previousIndex);
  const remainingItems = originalArray.filter((item, index) => index !== event.previousIndex);

  const reorderedItems = [
      ...remainingItems.slice(0, event.currentIndex),
      movedItem,
      ...remainingItems.slice(event.currentIndex)
  ];

  return reorderedItems;
}
*/


