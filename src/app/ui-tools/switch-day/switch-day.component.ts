import { Component, OnInit, AfterViewInit, Input, HostListener, Renderer, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DataService } from 'src/app/model/services/shared/data.service';
import { QuickTask } from 'src/app/model/quick-task.model';
import { QuickToDoRepository } from 'src/app/model/repository/quick-to-do-repository';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ProjectTask } from 'src/app/model/project-task.model';
import { ProjectToDoRepository } from 'src/app/model/repository/project-to-do-repository';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { XyzekiDateTimeInfra } from 'src/infrastructure/xyzeki-datetime-infra';
import { MemberSettingService } from 'src/app/model/services/member-setting.service';
import { concatMap } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-switch-day',
  templateUrl: './switch-day.component.html',
  styleUrls: ['./switch-day.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SwitchDayComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {
    this.selectDay(null, 'Tümü')
  }
  constructor(private memberSettingService: MemberSettingService, private datetimeInfra: XyzekiDateTimeInfra, public dataService: DataService, private permissions: MemberLicenseRepository) { }
  drop(event: CdkDragDrop<QuickTask[]>) {
    if (this.permissions.getAccessGranted()) {
      if (event.previousContainer === event.container) {
        return;
      }
      let deadLineAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-red';
      let startAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-green';

      if (event.previousContainer.id === 'QuickToDosContainer') {
        let qtDragged: QuickTask = Object.assign({}, event.item.data as QuickTask);
        let oldQt: QuickTask = Object.assign({}, qtDragged);
        let removeFromArc = (qtDragged: QuickTask) => { qtDragged.Archived = null; };
        if (event.container.id !== 'ArsivKutusu' && event.container.id !== 'Gecikmiş') {
          removeFromArc(qtDragged);
        }

        switch (event.container.id) {
          case 'ArsivKutusu':
            qtDragged.Archived = true;
            qtDragged.Order = 0;
            qtDragged.ArchivedDate = new Date().toISOString(); // that could be changed with a better option
            break;
          case 'Gecikmiş':

            if (deadLineAllowed)
              qtDragged.Date = null;
            if (startAllowed)
              qtDragged.Start = null;

            break;
          case 'Tümü':
            //qtDragged.Date = null;
            break;
          case '0gunsonra': // bugun     
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.today))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.today))
            break;
          case '1gunsonra':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.tomorrow))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.tomorrow))
            break;
          case '2gunsonra':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.twoDaysLater))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.twoDaysLater))
            break;
          case '3gunsonra':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.threeDaysLater))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.threeDaysLater))
            break;
          case '4gunsonra':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.fourDaysLater))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.fourDaysLater))
            break;
          case '5gunsonra':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.fiveDaysLater))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.fiveDaysLater))
            break;
          case '6gunsonra':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(this.sixDaysLater))
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(this.sixDaysLater))
            break;
        }

        

        if (event.container.id != 'ArsivKutusu' && event.container.id != 'Gecikmiş' && event.container.id != 'Tümü') {
          if (isNullOrUndefined(oldQt.Start) && startAllowed) {
            qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, '09:00:00');
          }
          if (isNullOrUndefined(oldQt.Date) && deadLineAllowed) {
            qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, '18:00:00');
          }
        }


        //arşivden çıkan öğe için sıra alma(order) işlemi;
        //önceki yapılacak arşivlenmiş olmalı ve bu hafta ve tümü conteynırlarına taşınıyor olmalı. 
        //diğer tüm durumlarda normal kaydetmeyi kullan.
        if (oldQt.Archived && event.container.id !== 'ArsivKutusu' && event.container.id !== 'Gecikmiş')
          this.quickTodoRepository.saveQuickToDo(qtDragged, true);
        else  // 
          this.quickTodoRepository.saveQuickToDo(qtDragged);

      }
      else if (event.previousContainer.id === 'ProjectToDosContainer') {
        let ptDragged: ProjectTask = Object.assign({}, event.item.data as ProjectTask);
        let oldPt: ProjectTask = Object.assign({}, ptDragged);

        let removeFromArc = (ptDragged: ProjectTask) => { ptDragged.Archived = null };
        if (event.container.id !== 'ArsivKutusu' && event.container.id !== 'Gecikmiş') {
          removeFromArc(ptDragged);
        }
        switch (event.container.id) {
          case 'ArsivKutusu':
            ptDragged.Archived = true;
            break;
          case 'Gecikmiş':
            // do nothing for now.

            if (deadLineAllowed)
              ptDragged.Deadline = null;
            if (startAllowed)
              ptDragged.Start = null;

            break;
          case '0gunsonra': // bugun   
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.today))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.today))
            break;
          case '1gunsonra':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.tomorrow))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.tomorrow))
            break;
          case '2gunsonra':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.twoDaysLater))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.twoDaysLater))
            break;
          case '3gunsonra':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.threeDaysLater))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.threeDaysLater))
            break;
          case '4gunsonra':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.fourDaysLater))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.fourDaysLater))
            break;
          case '5gunsonra':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.fiveDaysLater))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.fiveDaysLater))
            break;
          case '6gunsonra':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(this.sixDaysLater))
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(this.sixDaysLater))
            break;
        }

        if (event.container.id != 'ArsivKutusu' && event.container.id != 'Gecikmiş' && event.container.id != 'Tümü') {
          if (isNullOrUndefined(oldPt.Start) && startAllowed) {
            ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, '09:00:00');
          }
          if (isNullOrUndefined(oldPt.Deadline) && deadLineAllowed) {
            ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, '18:00:00');
          }
        }

        this.projectTodoRepository.saveProjectToDo(ptDragged);

      }
    }
    else {
      this.invalidLicensePanelOpen = true;
      setTimeout(() => {
        this.invalidLicensePanelOpen = false;
      }, 4000);
    }

  }
  switchMode() {
    this.dataService.switchMode++;
    if (this.dataService.switchMode > 2)
      this.dataService.switchMode = 0;

    this.memberSettingService.mySetting().pipe(
      concatMap(setting => {
        setting.SwitchMode = this.dataService.switchMode;
        return this.memberSettingService.updateMySetting(setting);
      })).subscribe();

  }
  @Input() public isProjectMode: boolean = false;

  invalidLicensePanelOpen: boolean = false;
  @Input() projectTodoRepository: ProjectToDoRepository
  @Input() quickTodoRepository: QuickToDoRepository
  datePipe = new DatePipe('tr-TR');

  public dates: Date[] = [];
  public dateDayNames: string[] = [];



  today = new Date()
  tomorrow = new Date(); // set up on nginit ..
  twoDaysLater = new Date();
  threeDaysLater = new Date();
  fourDaysLater = new Date();
  fiveDaysLater = new Date();
  sixDaysLater = new Date();

  ngOnInit() {

    let todayName = "Bugün"
    this.today.setHours(0, 0, 0, 0);
    //let todayName = 'Bugün(' + this.getDayName(this.today.getDay()) + ')'; // Örneğin, Bugün(Paz)
    this.dates.push(this.today);
    this.dateDayNames.push(todayName);


    this.tomorrow.setHours(0, 0, 0, 0)
    this.tomorrow.setDate(this.today.getDate() + 1);
    let tomorrowName = "Yarın"
    //let tomorrowName = 'Yarın(' + this.getDayName(tomorrow.getDay()) + ')';//  Yarın(Pzt)
    this.dates.push(this.tomorrow);
    this.dateDayNames.push(tomorrowName);


    this.twoDaysLater.setHours(0, 0, 0, 0)
    this.twoDaysLater.setDate(this.today.getDate() + 2);
    let twoDaysLaterName = this.getDayName(this.twoDaysLater.getDay())//  Sal
    this.dates.push(this.twoDaysLater);
    this.dateDayNames.push(twoDaysLaterName);


    this.threeDaysLater.setHours(0, 0, 0, 0)
    this.threeDaysLater.setDate(this.today.getDate() + 3);
    let threeDaysLaterName = this.getDayName(this.threeDaysLater.getDay()) //  Çar
    this.dates.push(this.threeDaysLater);
    this.dateDayNames.push(threeDaysLaterName);


    this.fourDaysLater.setHours(0, 0, 0, 0)
    this.fourDaysLater.setDate(this.today.getDate() + 4);
    let fourDaysLaterName = this.getDayName(this.fourDaysLater.getDay())// Per
    this.dates.push(this.fourDaysLater);
    this.dateDayNames.push(fourDaysLaterName);

    this.fiveDaysLater.setHours(0, 0, 0, 0)
    this.fiveDaysLater.setDate(this.today.getDate() + 5);
    let fiveDaysLaterName = this.getDayName(this.fiveDaysLater.getDay())// Cum
    this.dates.push(this.fiveDaysLater);
    this.dateDayNames.push(fiveDaysLaterName);

    this.sixDaysLater.setHours(0, 0, 0, 0)
    this.sixDaysLater.setDate(this.today.getDate() + 6);
    let sixDaysLaterName = this.getDayName(this.sixDaysLater.getDay())// Cmt
    this.dates.push(this.sixDaysLater);
    this.dateDayNames.push(sixDaysLaterName);
  }
  public selectedDate: Date;
  public selectedDayName;
  selectDay(date: Date, dateDayName) {
    // if (dateDayName == "ArsivKutusu")
    //   this.dataService.switchMode = 1;

    this.selectedDate = date;
    this.selectedDayName = dateDayName;
    if (date == null)
      //dateDayName= gecikmiş or tümü
      this.dataService.newSwitchDayEvent.next(dateDayName) // gecikmiş veya tümü
    else {
      this.dataService.newSwitchDayEvent.next(date.toISOString()) // gecikmiş veya tümü  
    }
    // #todo, send this date to main UI
  }
  getDateWithoutTime(dayDateStr) {
    let date = new Date(dayDateStr)
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }
  getDayName(day) {
    switch (day) {
      case 0:
        return 'Paz'; // Pazar
      case 1:
        return 'Pzt';
      case 2:
        return 'Sal';
      case 3:
        return 'Çar';
      case 4:
        return 'Per';
      case 5:
        return 'Cum';
      case 6:
        return 'Cmt';
    }
  }

  toggleLedType() { // Order: led-green(start) > led-red(deadline) > led-yellow(both)
    if (this.dataService.ledTypeClassShared == 'led-green') {
      this.dataService.ledTypeClassShared = 'led-red'
      this.dataService.ledToolTipMessage = 'Kırmızı ışık: sürükle bırak işlevi teslim için atama yapar.'
    }
    else if (this.dataService.ledTypeClassShared == 'led-red') {
      this.dataService.ledTypeClassShared = 'led-yellow'
      this.dataService.ledToolTipMessage = 'Sarı ışık: sürükle bırak işlevi hem başlangıç hem de teslim için atama yapar.'
    }
    else { // yellow
      this.dataService.ledTypeClassShared = 'led-green'// turnover
      this.dataService.ledToolTipMessage = 'Yeşil ışık: sürükle bırak işlevi başlangıç için atama yapar.'
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e) {
    if (e.key == 'x' || e.key == 'X' || e.key == 'Shift') {
      this.dataService.ledTypeClassShared = 'led-red'// turnover
      this.dataService.ledToolTipMessage = 'Kırmızı ışık: sürükle bırak işlevi teslim için atama yapar.'
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e) {
    if (e.key == 'x' || e.key == 'X' || e.key == 'Shift') {
      this.dataService.ledTypeClassShared = 'led-green'// turnover
      this.dataService.ledToolTipMessage = 'Yeşil ışık: sürükle bırak işlevi başlangıç için atama yapar.'
    }
  }


}
  //let value = '1993-07-12T00:00+0300';