import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditSubProgramComponent } from './dialog-edit-sub-program.component';

describe('DialogEditSubProgramComponent', () => {
  let component: DialogEditSubProgramComponent;
  let fixture: ComponentFixture<DialogEditSubProgramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditSubProgramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditSubProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
