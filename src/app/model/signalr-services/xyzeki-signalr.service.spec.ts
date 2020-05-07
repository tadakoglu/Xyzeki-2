/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { XyzekiSignalrService } from './xyzeki-signalr.service';

describe('Service: XyzekiSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XyzekiSignalrService]
    });
  });

  it('should ...', inject([XyzekiSignalrService], (service: XyzekiSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
