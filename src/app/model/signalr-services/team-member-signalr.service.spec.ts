/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TeamMemberSignalrService } from './team-member-signalr.service';

describe('Service: TeamMemberSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeamMemberSignalrService]
    });
  });

  it('should ...', inject([TeamMemberSignalrService], (service: TeamMemberSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
