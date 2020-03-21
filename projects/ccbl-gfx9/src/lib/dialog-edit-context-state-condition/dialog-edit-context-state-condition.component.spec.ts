import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditContextStateConditionComponent } from './dialog-edit-context-state-condition.component';

describe('DialogEditContextStateConditionComponent', () => {
  let component: DialogEditContextStateConditionComponent;
  let fixture: ComponentFixture<DialogEditContextStateConditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditContextStateConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditContextStateConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
