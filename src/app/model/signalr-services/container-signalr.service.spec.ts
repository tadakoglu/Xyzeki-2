/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ContainerSignalrService } from './container-signalr.service';

describe('Service: ContainerSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContainerSignalrService]
    });
  });

  it('should ...', inject([ContainerSignalrService], (service: ContainerSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
