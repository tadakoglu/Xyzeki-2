/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QuickToDosService } from './quick-to-dos.service';

describe('Service: QuickToDos', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuickToDosService]
    });
  });

  it('should ...', inject([QuickToDosService], (service: QuickToDosService) => {
    expect(service).toBeTruthy();
  }));
});
