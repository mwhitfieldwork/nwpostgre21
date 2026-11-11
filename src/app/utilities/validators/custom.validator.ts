import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * WHAT: Our own form rules, used alongside Angular's built-in ones.
 * WHY:  Built-ins (required, email, minLength) can't express rules like
 *       "price must be more than 0."
 * HOW:  A validator is a function that gets a control and returns:
 *         null          → the value is fine
 *         { key: ... }  → what's wrong (shows up in control.errors)
 *       ValidatorFn is Angular's type for exactly that kind of function.
 */

/**
 * Number must be greater than 0.
 * Empty is allowed here on purpose: Validators.required handles "missing,"
 * so each rule does ONE job and the error messages stay clear.
 */
export function positiveNumber(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === '') return null;   // let `required` handle empty

    return Number(value) > 0 ? null : { notPositive: true };
  };
}

/**
 * Text must contain something besides spaces.
 * Why: "     " (five spaces) passes `required` AND `minLength(2)`,
 * because spaces count as characters. trim() removes them first.
 */
export function notBlank(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || value.length === 0) return null; // `required` handles empty

    return value.trim().length > 0 ? null : { blank: true };
  };
}

/**
 * CROSS-FIELD rule: reorder level can't be higher than units in stock.
 * (If you have 5 on the shelf, "reorder when we drop to 20" makes no sense.)
 * Goes on the WHOLE FormGroup, because it needs to see two fields at once.
 * The error lands on the group: productForm.errors = { reorderAboveStock: true }
 */
export function reorderNotAboveStock(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const stock   = Number(group.get('unitsInStock')?.value);
    const reorder = Number(group.get('reorderLevel')?.value);

    // If either is empty or not a number, the field-level rules handle it.
    if (isNaN(stock) || isNaN(reorder)) return null;

    return reorder <= stock ? null : { reorderAboveStock: true };
  };
}