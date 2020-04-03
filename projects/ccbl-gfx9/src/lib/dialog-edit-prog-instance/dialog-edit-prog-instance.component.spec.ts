import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditProgInstanceComponent } from './dialog-edit-prog-instance.component';

describe('DialogEditProgInstanceComponent', () => {
  let component: DialogEditProgInstanceComponent;
  let fixture: ComponentFixture<DialogEditProgInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogEditProgInstanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogEditProgInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
