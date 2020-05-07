import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject, ReplaySubject, Observable } from 'rxjs';
import { ProjectToDoRepository } from '../../repository/project-to-do-repository';

@Injectable()
export class SwitchHourDataService {

  public setupStyle: EventEmitter<{ Left, Top, Visibility,isOpen }> = new EventEmitter();
  // projectToDoRepository:ProjectToDoRepository
  constructor() { }

}
