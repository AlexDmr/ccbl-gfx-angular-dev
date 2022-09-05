import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperimentateurComponent } from './experimentateur.component';

describe('ExperimentateurComponent', () => {
  let component: ExperimentateurComponent;
  let fixture: ComponentFixture<ExperimentateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExperimentateurComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperimentateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
