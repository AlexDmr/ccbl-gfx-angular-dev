import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblEventChannelActionComponent } from './ccbl-event-channel-action.component';

describe('CcblEventChannelActionComponent', () => {
  let component: CcblEventChannelActionComponent;
  let fixture: ComponentFixture<CcblEventChannelActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblEventChannelActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblEventChannelActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
