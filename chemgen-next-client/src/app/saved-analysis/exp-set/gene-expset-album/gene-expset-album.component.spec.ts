import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneExpsetAlbumComponent } from './gene-expset-album.component';

describe('GeneExpsetAlbumComponent', () => {
  let component: GeneExpsetAlbumComponent;
  let fixture: ComponentFixture<GeneExpsetAlbumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneExpsetAlbumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneExpsetAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
