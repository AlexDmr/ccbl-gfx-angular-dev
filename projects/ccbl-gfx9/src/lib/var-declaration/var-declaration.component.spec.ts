import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VarDeclarationComponent } from './var-declaration.component';

describe('VarDeclarationComponent', () => {
  let component: VarDeclarationComponent;
  let fixture: ComponentFixture<VarDeclarationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VarDeclarationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VarDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
