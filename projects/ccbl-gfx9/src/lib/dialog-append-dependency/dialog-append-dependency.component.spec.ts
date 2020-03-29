import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAppendDependencyComponent } from './dialog-append-dependency.component';

describe('DialogAppendDependencyComponent', () => {
  let component: DialogAppendDependencyComponent;
  let fixture: ComponentFixture<DialogAppendDependencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAppendDependencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAppendDependencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
