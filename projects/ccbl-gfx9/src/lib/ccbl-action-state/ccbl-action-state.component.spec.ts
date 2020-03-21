import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblActionStateComponent } from './ccbl-action-state.component';

describe('CcblActionStateComponent', () => {
  let component: CcblActionStateComponent;
  let fixture: ComponentFixture<CcblActionStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblActionStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblActionStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
