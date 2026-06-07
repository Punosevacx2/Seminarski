import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HybridsearchComponent } from './hybridsearch.component';

describe('HybridsearchComponent', () => {
  let component: HybridsearchComponent;
  let fixture: ComponentFixture<HybridsearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HybridsearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HybridsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
