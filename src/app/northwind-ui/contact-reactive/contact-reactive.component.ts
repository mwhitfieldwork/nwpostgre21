import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl } from '@angular/forms';   // add to your existing @angular/forms import
import IntlTelInput from '@intl-tel-input/angular';

/**
 * WHAT: The Contact form again, built as a REACTIVE form.
 * WHY:  To compare with the template-driven version at /contact.
 *       Here the form and its rules live in the .ts, not the HTML.
 * HOW:  - fb.nonNullable.group({...}) builds a TYPED FormGroup:
 *         TypeScript knows name/email/message are strings,
 *         and reset() puts them back to '' (not null).
 *       - Each field is [startingValue, [validators]].
 *       - The HTML just points at fields with formControlName="...".
 */
@Component({
  selector: 'app-contact-reactive',
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, IntlTelInput],
  templateUrl: './contact-reactive.component.html',
  styleUrl: './contact-reactive.component.scss'
})
export class ContactReactiveComponent {
  private fb = inject(FormBuilder);

  /** The whole form. The rules are here instead of in the HTML. */
  form = this.fb.nonNullable.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    // Optional. The phone component brings its own validator:
    // an invalid number puts an 'invalidPhone' error on this control.
    // Its value is the full number as a string (e.g. +13125550123).
    phone:   new FormControl('', { nonNullable: true }),
    message: ['', [Validators.required, Validators.minLength(10)]],
  });
  
  /**
   * Loads Google's phone-number rules only when the field appears,
   * so they're not in the app's first download (Session 7 thinking).
   */
  loadUtils = () => import('intl-tel-input/utils');
  sent = false;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // show every error at once
      return;
    }
    // getRawValue() is typed: { name: string; email: string; message: string }
    console.log('Contact form sent (reactive):', this.form.getRawValue());
    this.sent = true;
    this.form.reset();                // back to '' everywhere, errors hidden
  }
}
