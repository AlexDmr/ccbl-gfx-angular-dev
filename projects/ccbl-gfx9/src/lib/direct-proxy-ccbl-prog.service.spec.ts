import { TestBed } from '@angular/core/testing';

import { DirectProxyCcblProgService } from './direct-proxy-ccbl-prog.service';

describe('DirectProxyCcblProgService', () => {
  let service: DirectProxyCcblProgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectProxyCcblProgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
