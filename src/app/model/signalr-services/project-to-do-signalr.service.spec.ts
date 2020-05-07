/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjectToDoSignalrService } from './project-to-do-signalr.service';

describe('Service: ProjectToDoSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectToDoSignalrService]
    });
  });

  it('should ...', inject([ProjectToDoSignalrService], (service: ProjectToDoSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
