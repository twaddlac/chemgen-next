import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalSecondaryComponent } from './chemical-secondary.component';

describe('ChemicalSecondaryComponent', () => {
  let component: ChemicalSecondaryComponent;
  let fixture: ComponentFixture<ChemicalSecondaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChemicalSecondaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChemicalSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
