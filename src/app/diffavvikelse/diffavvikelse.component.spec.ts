import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffavvikelseComponent } from './diffavvikelse.component';

describe('DiffavvikelseComponent', () => {
  let component: DiffavvikelseComponent;
  let fixture: ComponentFixture<DiffavvikelseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffavvikelseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffavvikelseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
