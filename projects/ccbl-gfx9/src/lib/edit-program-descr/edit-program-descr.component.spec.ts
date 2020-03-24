import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProgramDescrComponent } from './edit-program-descr.component';

describe('EditProgramDescrComponent', () => {
  let component: EditProgramDescrComponent;
  let fixture: ComponentFixture<EditProgramDescrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditProgramDescrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProgramDescrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
