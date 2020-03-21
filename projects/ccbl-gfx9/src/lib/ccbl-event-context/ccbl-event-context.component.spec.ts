import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblEventContextComponent } from './ccbl-event-context.component';

describe('CcblEventContextComponent', () => {
  let component: CcblEventContextComponent;
  let fixture: ComponentFixture<CcblEventContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblEventContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblEventContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
