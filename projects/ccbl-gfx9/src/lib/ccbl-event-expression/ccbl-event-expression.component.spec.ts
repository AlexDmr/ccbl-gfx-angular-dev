import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcblEventExpressionComponent } from './ccbl-event-expression.component';

describe('CcblEventExpressionComponent', () => {
  let component: CcblEventExpressionComponent;
  let fixture: ComponentFixture<CcblEventExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcblEventExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcblEventExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
