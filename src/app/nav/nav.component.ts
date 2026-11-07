import { AfterViewInit, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { UserSessionService } from '../utilities/services/user-session/user-session.service';
import { Authentication } from '../utilities/models/authentication';
import { SafelinkDirective } from '../utilities/directives/safe-link/safelink.directive';
import { UsersComponent } from "../shared/users/users.component";
import { DUMMY_USERS } from '../utilities/models/DUMMY_USERS';
import { Visitor } from '../utilities/models/visitor.model';
import { filter } from 'rxjs';
import { DatePickerFilterComponent } from '../shared/date-picker-filter/date-picker-filter.component';
import { DateRangeService } from '../utilities/services/date-range/date-range.service';
@Component({
    selector: 'app-nav',
    standalone: true,
    imports: [
        RouterLink,
        SafelinkDirective,
        UsersComponent,
        DatePickerFilterComponent
    ],
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit, AfterViewInit {
 private  _userSessionService = inject(UserSessionService);
 private router = inject(Router);
 private _router = inject(Router);
private _dateRangeService = inject(DateRangeService);

// True only while the user is on the dashboard page
public isDashboard = false;

 userId!:string;
 user!:Authentication | null;
 isLoggedIn:boolean = false
 visitors = DUMMY_USERS;
 @Input() menuOpen = false;
 @Output() menuToggle = new EventEmitter<void>();

ngOnInit(): void {
  // Check the page we start on
  this.isDashboard = this._router.url.startsWith('/dashboard');

  // Re-check every time the user moves to a new page
  this._router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.isDashboard = event.urlAfterRedirects.startsWith('/dashboard');
    });
}

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

// Picker picked dates → drop them in the shared mailbox
onDateRangeSelected(range: { beginningDate: Date; endingDate: Date }): void {
  this._dateRangeService.setRange(range.beginningDate, range.endingDate);
}

Logout() {
  localStorage.removeItem('user');
  this.user = null;
  this.router.navigate(['']).then(() => {
    window.location.reload();
});
}

}
