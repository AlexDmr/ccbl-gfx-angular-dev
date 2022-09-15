import { TestBed } from '@angular/core/testing';

import { RemoteProxyCcblProgService } from './remote-proxy-ccbl-prog.service';

describe('RemoteProxyCcblProgService', () => {
  let service: RemoteProxyCcblProgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteProxyCcblProgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
