/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjectSignalrService } from './project-signalr.service';

describe('Service: ProjectSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectSignalrService]
    });
  });

  it('should ...', inject([ProjectSignalrService], (service: ProjectSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
