import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditActionStateComponent } from './dialog-edit-action-state.component';

describe('DialogEditActionStateComponent', () => {
  let component: DialogEditActionStateComponent;
  let fixture: ComponentFixture<DialogEditActionStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditActionStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditActionStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
