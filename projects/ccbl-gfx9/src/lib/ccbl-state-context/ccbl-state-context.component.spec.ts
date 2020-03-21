import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblStateContextComponent } from './ccbl-state-context.component';

describe('CcblStateContextComponent', () => {
  let component: CcblStateContextComponent;
  let fixture: ComponentFixture<CcblStateContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblStateContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblStateContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
