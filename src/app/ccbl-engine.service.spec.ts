import { TestBed } from '@angular/core/testing';

import { CcblEngineService } from './ccbl-engine.service';

describe('CcblEngineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CcblEngineService = TestBed.get(CcblEngineService);
    expect(service).toBeTruthy();
  });
});
