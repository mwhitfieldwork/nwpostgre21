import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
      isAdmin: user.admin,
    });
  }

  updateUser(form: FormGroup): void {
    if (!this.selectedUser || form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const updatedUser: AdminUser = {
      ...this.selectedUser,
      firstname: form.value.firstName,
      occupation: form.value.occupation,
      username: form.value.username,
      admin: form.value.isAdmin,
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.userSessionService.updateAdminUser(updatedUser).subscribe({
      next: savedUser => {
        const userIndex = this.users.findIndex(user => user.pkid === savedUser.pkid);
        if (userIndex >= 0) {
          this.users[userIndex] = savedUser;
          this.users = [...this.users];
        }
        this.selectedUser = savedUser;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to update user.';
        this.isLoading = false;
      },
    });
  }

}
