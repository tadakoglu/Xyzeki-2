import { Component, OnInit, Input, AfterViewInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { QuickTask } from 'src/app/model/quick-task.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MemberLicenseRepository } from 'src/app/model/repository/member-license-repository';
import { ProjectTask } from 'src/app/model/project-task.model';
import { ProjectToDoRepository } from 'src/app/model/repository/project-to-do-repository';
import { QuickToDoRepository } from 'src/app/model/repository/quick-to-do-repository';
import { XyzekiDateTimeInfra } from 'src/infrastructure/xyzeki-datetime-infra';
import { DataService } from 'src/app/model/services/shared/data.service';
import { SwitchHourDataService } from 'src/app/model/services/shared/switch-hour-data.service';

@Component({
  selector: 'app-switch-hour',
  templateUrl: './switch-hour.component.html',
  styleUrls: ['./switch-hour.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class SwitchHourComponent implements OnInit, AfterViewInit {
  ngAfterViewInit(): void {

    // this.switchHourDataService.hourAreaDropListRef = this.hourAreaDropListRefView;

  }
  invalidLicensePanelOpen: boolean = false

  constructor(public projectToDoRepository:ProjectToDoRepository, public switchHourDataService: SwitchHourDataService, public dataService: DataService, private datetimeInfra: XyzekiDateTimeInfra, private permissions: MemberLicenseRepository, private quickTodoRepository: QuickToDoRepository) { }

  // @ViewChild('hourAreaDropListRef') hourAreaDropListRefView;

  ngOnInit() {
  }
  hourNames = ["Şimdi", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  drop(event: CdkDragDrop<any>) { // QuickTask[] or ProjectTask[] = any
    if (this.permissions.getAccessGranted()) {
      if (event.previousContainer === event.container) {
        return;
      }
      let deadLineAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-red';
      let startAllowed = this.dataService.ledTypeClassShared == 'led-yellow' || this.dataService.ledTypeClassShared == 'led-green';
      if (event.previousContainer.id === 'QuickToDosContainer') {
        let qtDragged: QuickTask = Object.assign({}, event.item.data as QuickTask);


        switch (event.container.id) {
          case 'Şimdi':
            if (deadLineAllowed) {
              qtDragged.Date = this.datetimeInfra.setupDate(qtDragged.Date, this.datetimeInfra.getToDateString(new Date()));
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, this.datetimeInfra.getToTimeString(new Date()));
            }

            if (startAllowed) {
              qtDragged.Start = this.datetimeInfra.setupDate(qtDragged.Start, this.datetimeInfra.getToDateString(new Date()));
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, this.datetimeInfra.getToTimeString(new Date()));
            }

            break;
          case '09:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "09:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "09:00:00");
            break;
          case '10:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "10:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "10:00:00");
            break;
          case '11:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "11:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "11:00:00");

            break;
          case '13:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "13:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "13:00:00");

            break;
          case '14:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "14:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "14:00:00");

            break;
          case '15:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "15:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "15:00:00");

            break;
          case '16:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "16:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "16:00:00");

            break;
          case '17:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "17:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "17:00:00");

            break;

          case '18:00':
            if (deadLineAllowed)
              qtDragged.Date = this.datetimeInfra.setupTime(qtDragged.Date, "18:00:00");
            if (startAllowed)
              qtDragged.Start = this.datetimeInfra.setupTime(qtDragged.Start, "18:00:00");

            break;
        }
        this.quickTodoRepository.saveQuickToDo(qtDragged);
      }
      else if (event.previousContainer.id === 'ProjectToDosContainer') {
        let ptDragged: ProjectTask = Object.assign({}, event.item.data as ProjectTask);
        switch (event.container.id) {
          case 'Şimdi': // bugun  
            if (deadLineAllowed) {
              ptDragged.Deadline = this.datetimeInfra.setupDate(ptDragged.Deadline, this.datetimeInfra.getToDateString(new Date()));
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, this.datetimeInfra.getToTimeString(new Date()));
            }

            if (startAllowed) {
              ptDragged.Start = this.datetimeInfra.setupDate(ptDragged.Start, this.datetimeInfra.getToDateString(new Date()));
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, this.datetimeInfra.getToTimeString(new Date()));
            }


            break;
          case '09:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "09:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "09:00:00");
            break;
          case '10:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "10:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "10:00:00");
            break;
          case '11:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "11:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "11:00:00");

            break;
          case '13:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "13:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "13:00:00");

            break;
          case '14:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "14:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "14:00:00");

            break;
          case '15:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "15:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "15:00:00");

            break;
          case '16:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "16:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "16:00:00");

            break;
          case '17:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "17:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "17:00:00");

            break;
          case '18:00':
            if (deadLineAllowed)
              ptDragged.Deadline = this.datetimeInfra.setupTime(ptDragged.Deadline, "18:00:00");
            if (startAllowed)
              ptDragged.Start = this.datetimeInfra.setupTime(ptDragged.Start, "18:00:00");

            break;
        }
        this.projectToDoRepository.saveProjectToDo(ptDragged);
        //this.projectTodoRepository.saveProjectToDo(ptDragged);
      }
      else {
        this.invalidLicensePanelOpen = true;
        setTimeout(() => {
          this.invalidLicensePanelOpen = false;
        }, 4000);
      }


    }
  }


  //public color = this.dataService.ledTypeClassShared.split('-')[1]
}