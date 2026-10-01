import { Directive, ElementRef, Input, OnChanges, SimpleChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tickerText]'
})
export class TickerTextDirective implements OnChanges {

  @Input() tickerText!: string | number | null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickerText']) {
      this.animateTicker(this.tickerText);
    }
  }

  private animateTicker(value: string | number | null) {
    if (value === null || value === undefined) {
      this.renderer.setProperty(this.el.nativeElement, 'innerText', '');
      return;
    }

    const finalText = String(value);

    // Create wrapper span
    const span = this.renderer.createElement('span');
    this.renderer.setStyle(span, 'display', 'inline-block');
    this.renderer.setStyle(span, 'transform', 'translateY(100%)');
    this.renderer.setStyle(span, 'transition', 'transform 0.4s ease');

    // Set text
    this.renderer.setProperty(span, 'innerText', finalText);

    // Clear existing content
    this.el.nativeElement.innerHTML = '';

    // Insert new animated span
    this.renderer.appendChild(this.el.nativeElement, span);

    // Trigger animation
    requestAnimationFrame(() => {
      this.renderer.setStyle(span, 'transform', 'translateY(0)');
    });
  }
}
