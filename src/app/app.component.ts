import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { DisplayLinkDirective } from './utilities/directives/auth/display-link.directive';
import {NgClass } from '@angular/common';
import { UsersComponent } from "./shared/users/users.component";
import { Authentication } from './utilities/models/authentication';
import { UserSessionService } from './utilities/services/user-session/user-session.service';
import { Visitor } from './utilities/models/visitor.model';
import { DUMMY_USERS } from './utilities/models/DUMMY_USERS';
import { LoadingSpinnerComponent } from "./shared/loader/site-wide-loader";
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
    RouterOutlet,
    NavComponent,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
    DisplayLinkDirective,
    NgClass,
    RouterLinkActive,
    UsersComponent,
    LoadingSpinnerComponent
],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'nwrevised';
  userId!:string | null;
  isLoggedIn = true;
  isCollapsed = false;
  user!:Authentication | null;
  visitors = DUMMY_USERS;

  private _router = inject(Router);
  private  _userSessionService = inject(UserSessionService);



  ngOnInit(): void {
    this._router.events
    .pipe(
      // Only act on NavigationEnd events
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe((event: NavigationEnd) => {
      // Use router.url to get the current address, e.g., '/dashboard'
      const currentUrl = event.urlAfterRedirects;
      console.log('Current URL:', currentUrl);

      // Update isLoggedIn based on your criteria
      // This example assumes a non-empty path means logged in.
      this.isLoggedIn = currentUrl !== '/' && currentUrl !== '';
    });
    const userId = localStorage.getItem('user');
    if (userId) {
        this.userId = JSON.parse(userId); 
    }
    this.getUser()
  }

  getUser(){
    if(this.userId) {
      this._userSessionService.getUser(this.userId).subscribe((response) => {
        this.user = response;
        this.getVisitor();
        console.log(this.getVisitor());
      });
    }
  }
  
  getVisitor():Visitor | undefined{
    if(this.userId){
      return  this.visitors.find(visitor => visitor.visitorId === Number(this.userId));
    }
    return undefined;
  }  

}
