import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterplotCountsComponent } from './scatterplot-counts.component';

describe('ScatterplotCountsComponent', () => {
  let component: ScatterplotCountsComponent;
  let fixture: ComponentFixture<ScatterplotCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScatterplotCountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScatterplotCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
