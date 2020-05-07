import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject, ReplaySubject, Observable } from 'rxjs';


@Injectable()
export class DataService {

  public removeTeamMemberEvent: EventEmitter<number> = new EventEmitter();
  // private removeTeamMemberEventSource = new BehaviorSubject(0);
  // current = this.removeTeamMemberEventSource.asObservable();

  public newSwitchDayEvent: Subject<string> = new ReplaySubject<string>(1);
  public newDeepSearchEvent: EventEmitter<string> = new EventEmitter();

  public newContainerSearchEvent: EventEmitter<string> = new EventEmitter();
  public newContainerBlobSearchEvent: EventEmitter<string> = new EventEmitter();

  public ledTypeClassShared = "led-yellow"
  public ledToolTipMessage = 'Sarı ışık: sürükle bırak işlevi hem başlangıç hem de teslim için atama yapar.'

  public switchMode: number = 0; // Giden, Gelen 0 ; Giden 1; Gelen 2
  openPrivateTalkId: number

  saveChangesEvent: EventEmitter<[string[], number[]]> = new EventEmitter();

  public reloadAllOnTeamDestroyEvent: EventEmitter<void> = new EventEmitter();

  public signalConnectionSeconds: EventEmitter<number> = new EventEmitter();
  public startSignalConnection: EventEmitter<void> = new EventEmitter();



  constructor() { }

  // removeTeamMemberEvent(teamMemberId: number) {
  //   this.removeTeamMemberEventSource.next(teamMemberId)
  //   this.removeTeamMemberEventSource.next(0); // reset behaviour subject , #todo change that replaysubject 
  // }



}