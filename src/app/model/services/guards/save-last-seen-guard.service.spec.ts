/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SaveLastSeenGuardService } from './save-last-seen-guard.service';

describe('Service: SaveLastSeenGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaveLastSeenGuardService]
    });
  });

  it('should ...', inject([SaveLastSeenGuardService], (service: SaveLastSeenGuardService) => {
    expect(service).toBeTruthy();
  }));
});
