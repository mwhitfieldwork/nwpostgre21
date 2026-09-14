import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUser } from '../../utilities/models/admin-user.model';
import { UserSessionService } from '../../utilities/services/user-session/user-session.service';

@Component({
  selector: 'app-admin-user-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-user-panel.component.html',
  styleUrl: './admin-user-panel.component.scss',
})
export class AdminUserPanelComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userSessionService = inject(UserSessionService);

  users: AdminUser[] = [];
  selectedUser: AdminUser | null = null;
  selectedUserId: number | null = null;

  errorMessage = '';
  isLoading = false;

  readonly userForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    occupation: ['', Validators.required],
    username: ['', [Validators.required, Validators.email]],
    isAdmin: [false],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userSessionService.getAdminUsers().subscribe({
      next: users => {
        this.users = users; 
        console.log(users, '---- users')
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load users.';
        this.isLoading = false;
      },
    });
  }

  selectUser(userId: number): void {
    const user = this.users.find(item => item.pkid === Number(userId));
    if (!user) {
      this.selectedUser = null;
      this.userForm.reset({ isAdmin: false });
      return;
    }

    this.selectedUser = user;
    this.userForm.patchValue({
      firstName: user.firstname,
      occupation: user.occupation,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  }

}
