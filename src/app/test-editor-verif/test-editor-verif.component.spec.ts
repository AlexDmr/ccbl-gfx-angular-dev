import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEditorVerifComponent } from './test-editor-verif.component';

describe('TestEditorVerifComponent', () => {
  let component: TestEditorVerifComponent;
  let fixture: ComponentFixture<TestEditorVerifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestEditorVerifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestEditorVerifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
