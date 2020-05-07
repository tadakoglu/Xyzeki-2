/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SwitchHourDataService } from './switch-hour-data.service';

describe('Service: SwitchHourData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SwitchHourDataService]
    });
  });

  it('should ...', inject([SwitchHourDataService], (service: SwitchHourDataService) => {
    expect(service).toBeTruthy();
  }));
});
