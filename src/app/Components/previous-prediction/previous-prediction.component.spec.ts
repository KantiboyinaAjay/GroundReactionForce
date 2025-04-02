import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousPredictionComponent } from './previous-prediction.component';

describe('PreviousPredictionComponent', () => {
  let component: PreviousPredictionComponent;
  let fixture: ComponentFixture<PreviousPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreviousPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
