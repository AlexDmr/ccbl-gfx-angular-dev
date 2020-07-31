import { TestBed } from '@angular/core/testing';

import { SmtService } from './smt.service';
import { P0 } from './tests/P0';
import { ActionsPath } from './smt.definitions';
import { P1 } from './tests/P1';

describe('SmtService', () => {
  let service: SmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should process program P0', async () => {
    const LAP: ActionsPath[] = await service.evalProgram(P0);
    const alpha = LAP.find(ap => ap.context.id === 'alpha');
    const beta  = LAP.find(ap => ap.context.id === 'beta' );
    const gamma = LAP.find(ap => ap.context.id === 'gamma');
    expect(alpha).toBeDefined();
    expect(beta ).toBeDefined();
    expect(gamma).toBeDefined();
    expect(alpha.canBeTrue.length).toEqual(1);
    expect( beta.canBeTrue.length).toEqual(1);
    expect(gamma.canBeTrue.length).toEqual(1);
    expect(alpha.canBeTrue[0].length).toEqual(1);
    expect(alpha.canBeTrue[0][0].context.id).toEqual('gamma');
    expect(beta.canBeTrue[0].length).toEqual(2);
    expect(beta.canBeTrue[0][0].context.id).toEqual('alpha');
    expect(beta.canBeTrue[0][1].context.id).toEqual('gamma');
    expect(gamma.canBeTrue[0].length).toEqual(1);
    expect(gamma.canBeTrue[0][0].context.id).toEqual('gamma');
  });

  it('should process program P1', async () => {
    const LAP: ActionsPath[] = await service.evalProgram(P1);
    const alpha = LAP.find(ap => ap.context.id === 'alpha');
    const beta  = LAP.find(ap => ap.context.id === 'beta' );
    const beta1 = LAP.find(ap => ap.context.id === 'beta.1');
    const gamma = LAP.find(ap => ap.context.id === 'gamma');
    const delta = LAP.find(ap => ap.context.id === 'delta');
    expect(alpha).toBeDefined();
    expect(beta ).toBeDefined();
    expect(beta1).toBeDefined();
    expect(gamma).toBeDefined();
    expect(delta).toBeDefined();
    expect(alpha.canBeTrue.length).toEqual(2);
    expect(alpha.canBeTrue[0].length).toEqual(1);
    expect(alpha.canBeTrue[0][0].context.id).toEqual('gamma');
    expect(alpha.canBeTrue[1][0].context.id).toEqual('delta');
  });
});
