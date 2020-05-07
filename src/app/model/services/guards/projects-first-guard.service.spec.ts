/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjectsFirstGuardService } from './projects-first-guard.service';

describe('Service: ProjectsFirstGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectsFirstGuardService]
    });
  });

  it('should ...', inject([ProjectsFirstGuardService], (service: ProjectsFirstGuardService) => {
    expect(service).toBeTruthy();
  }));
});
