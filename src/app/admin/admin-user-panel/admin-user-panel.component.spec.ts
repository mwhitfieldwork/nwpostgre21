import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserPanelComponent } from './admin-user-panel.component';

describe('AdminUserPanelComponent', () => {
  let component: AdminUserPanelComponent;
  let fixture: ComponentFixture<AdminUserPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
