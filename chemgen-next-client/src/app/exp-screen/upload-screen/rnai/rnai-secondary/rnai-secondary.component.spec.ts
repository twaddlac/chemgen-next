import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RnaiSecondaryComponent } from './rnai-secondary.component';

describe('RnaiSecondaryComponent', () => {
  let component: RnaiSecondaryComponent;
  let fixture: ComponentFixture<RnaiSecondaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RnaiSecondaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RnaiSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
