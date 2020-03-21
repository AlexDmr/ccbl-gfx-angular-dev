import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblEventTriggerActionComponent } from './ccbl-event-trigger-action.component';

describe('CcblEventTriggerActionComponent', () => {
  let component: CcblEventTriggerActionComponent;
  let fixture: ComponentFixture<CcblEventTriggerActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblEventTriggerActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblEventTriggerActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
