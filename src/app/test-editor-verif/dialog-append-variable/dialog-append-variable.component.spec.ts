import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAppendVariableComponent } from './dialog-append-variable.component';

describe('DialogAppendVariableComponent', () => {
  let component: DialogAppendVariableComponent;
  let fixture: ComponentFixture<DialogAppendVariableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAppendVariableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAppendVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
