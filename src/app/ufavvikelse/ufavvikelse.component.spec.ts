import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UfavvikelseComponent } from './ufavvikelse.component';

describe('UfavvikelseComponent', () => {
  let component: UfavvikelseComponent;
  let fixture: ComponentFixture<UfavvikelseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UfavvikelseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UfavvikelseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
