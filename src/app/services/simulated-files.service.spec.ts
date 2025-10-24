import { TestBed } from '@angular/core/testing';

import { SimulatedFilesService } from './simulated-files.service';

describe('SimulatedFilesService', () => {
  let service: SimulatedFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulatedFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
