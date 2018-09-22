import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RnaiPlatePlanComponent } from './rnai-plate-plan.component';

describe('RnaiPlatePlanComponent', () => {
  let component: RnaiPlatePlanComponent;
  let fixture: ComponentFixture<RnaiPlatePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RnaiPlatePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RnaiPlatePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
