import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditExpressionComponent } from './dialog-edit-expression.component';

describe('DialogEditExpressionComponent', () => {
  let component: DialogEditExpressionComponent;
  let fixture: ComponentFixture<DialogEditExpressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditExpressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
