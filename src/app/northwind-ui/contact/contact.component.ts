import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NotBlankDirective } from '../../utilities/validators/not-blank.directive';
// imports: [FormsModule, RouterLink, NotBlankDirective, MatFormFieldModule, ...]

/**
 * WHAT: A Contact / feedback page built as a TEMPLATE-DRIVEN form.
 * WHY:  To learn the template-driven style (Session 10). Next session we
 *       rebuild the same form as a REACTIVE form and compare the two.
 * HOW:  - The form's rules (required, minlength, email) live in the HTML.
 *       - [(ngModel)] links each input to a field on `contact` below,
 *         both ways: typing updates the object, and changing the object
 *         updates the input.
 *       - FormsModule is what makes ngModel and ngForm work.
 */
@Component({
  selector: 'app-contact',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, NotBlankDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  /** What the user types. ngModel keeps this in sync with the inputs. */
  contact = { name: '', email: '', message: '' };

  /** Shown after a successful send. */
  sent = false;

  /**
   * Runs when the form is submitted.
   * form = the whole form (passed from the HTML as #contactForm="ngForm").
   */
  onSubmit(form: NgForm): void {
    if (form.invalid) return;        // safety net; the button is disabled anyway

    console.log('Contact form sent:', this.contact);   // no API call yet
    this.sent = true;
    form.resetForm();                // clears the values AND the touched/dirty flags
  }
}
