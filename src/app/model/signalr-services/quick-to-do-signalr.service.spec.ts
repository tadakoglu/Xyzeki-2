/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QuickToDoSignalrService } from './quick-to-do-signalr.service';

describe('Service: QuickToDoSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuickToDoSignalrService]
    });
  });

  it('should ...', inject([QuickToDoSignalrService], (service: QuickToDoSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
