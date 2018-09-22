import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateImagingDatesComponent } from './plate-imaging-dates.component';

describe('PlateImagingDatesComponent', () => {
  let component: PlateImagingDatesComponent;
  let fixture: ComponentFixture<PlateImagingDatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlateImagingDatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlateImagingDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
