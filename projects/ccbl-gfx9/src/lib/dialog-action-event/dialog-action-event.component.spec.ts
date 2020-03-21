import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogActionEventComponent } from './dialog-action-event.component';

describe('DialogActionEventComponent', () => {
  let component: DialogActionEventComponent;
  let fixture: ComponentFixture<DialogActionEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogActionEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogActionEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
