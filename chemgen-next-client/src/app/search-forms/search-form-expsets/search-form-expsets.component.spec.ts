import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormExpsetsComponent } from './search-form-expsets.component';

describe('SearchFormExpsetsComponent', () => {
  let component: SearchFormExpsetsComponent;
  let fixture: ComponentFixture<SearchFormExpsetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormExpsetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormExpsetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
