import { Directive, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { LoginService } from '../../services/login/login.service';

/**
 * WHAT: Shows an element ONLY for admins.
 *         <button *appIfAdmin>Delete</button>
 * WHY:  One reusable rule instead of @if (isAdmin) checks copied around the app.
 * HOW:  The * turns the element into a TEMPLATE (a blueprint, not on the page yet).
 *       - TemplateRef        = that blueprint
 *       - ViewContainerRef   = the spot on the page where it could go
 *       If the user is an admin, we "stamp" the blueprint into that spot.
 *       If not, we do nothing, so the element never exists on the page at all.
 *       (Same idea as *ngIf, and the same TemplateRef you used in Session 13b.)
 */
@Directive({ selector: '[appIfAdmin]', standalone: true })
export class IfAdminDirective implements OnInit {
  private template = inject(TemplateRef<unknown>);
  private container = inject(ViewContainerRef);
  private loginService = inject(LoginService);

  ngOnInit(): void {
    if (this.loginService.isAdmin()) {
      this.container.createEmbeddedView(this.template);   // stamp it in
    }
    // not admin → leave the spot empty
  }
}