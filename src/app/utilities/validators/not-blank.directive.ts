import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { notBlank } from './custom.validator';

/**
 * WHAT: Lets template-driven forms use our notBlank rule as an HTML attribute:
 *         <input ngModel appNotBlank />
 * WHY:  Template-driven forms put rules in the HTML. Angular's built-ins
 *       (required, minlength) are attributes, so our rule needs to be one too.
 * HOW:  - selector: this directive attaches to any element that has BOTH
 *         appNotBlank and ngModel.
 *       - NG_VALIDATORS: "Angular, add me to this field's list of validators."
 *         multi: true means "add me to the list," not "replace the list."
 *       - validate() just calls the SAME notBlank() function the reactive
 *         form uses, so the rule is written once and used both ways.
 */
@Directive({
  selector: '[appNotBlank][ngModel]',
  providers: [{ provide: NG_VALIDATORS, useExisting: NotBlankDirective, multi: true }],
})
export class NotBlankDirective implements Validator {
  private check = notBlank();

  validate(control: AbstractControl): ValidationErrors | null {
    return this.check(control);
  }
}