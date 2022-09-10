import { TestBed } from '@angular/core/testing';

import { EmptyProxyCcblProgService } from './empty-proxy-ccbl-prog.service';

describe('EmptyProxyCcblProgService', () => {
  let service: EmptyProxyCcblProgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmptyProxyCcblProgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
