import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RxLabComponent } from './rx-lab.component';

describe('RxLabComponent', () => {
  let component: RxLabComponent;
  let fixture: ComponentFixture<RxLabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RxLabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RxLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
