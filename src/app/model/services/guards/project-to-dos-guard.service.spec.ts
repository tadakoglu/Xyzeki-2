/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjectToDosGuardService } from './project-to-dos-guard.service';

describe('Service: ProjectToDosGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectToDosGuardService]
    });
  });

  it('should ...', inject([ProjectToDosGuardService], (service: ProjectToDosGuardService) => {
    expect(service).toBeTruthy();
  }));
});
