/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ContainerBlobSignalrService } from './container-blob-signalr.service';

describe('Service: ContainerBlobSignalr', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContainerBlobSignalrService]
    });
  });

  it('should ...', inject([ContainerBlobSignalrService], (service: ContainerBlobSignalrService) => {
    expect(service).toBeTruthy();
  }));
});
