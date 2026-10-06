import { AfterViewInit, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { UserSessionService } from '../utilities/services/user-session/user-session.service';
import { Authentication } from '../utilities/models/authentication';
import { SafelinkDirective } from '../utilities/directives/safe-link/safelink.directive';
import { UsersComponent } from "../shared/users/users.component";
import { DUMMY_USERS } from '../utilities/models/DUMMY_USERS';
import { Visitor } from '../utilities/models/visitor.model';

@Component({
    selector: 'app-nav',
    standalone: true,
    imports: [
        RouterLink,
        SafelinkDirective,
        UsersComponent
    ],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss'
})
export class NavComponent implements AfterViewInit {
 private  _userSessionService = inject(UserSessionService);
 private router = inject(Router);
 userId!:string;
 user!:Authentication | null;
 isLoggedIn:boolean = false
 visitors = DUMMY_USERS;
 @Input() menuOpen = false;
 @Output() menuToggle = new EventEmitter<void>();

ngAfterViewInit(): void {
  const userId = localStorage.getItem('user');
  if (userId) {
      this.userId = JSON.parse(userId); 
  }
  this.getUser()
}

getVisitor():Visitor | undefined{
  if(this.userId){
    return  this.visitors.find(visitor => visitor.visitorId === Number(this.userId));
  }
  return undefined;
}

getUser(){
  if(this.userId) {
    this._userSessionService.getUser(this.userId).subscribe((response) => {
      this.user = response;
     // console.log(this.user);
    });
  }
}

Logout() {
  localStorage.removeItem('user');
  this.user = null;
  this.router.navigate(['']).then(() => {
    window.location.reload();
});
}

}
