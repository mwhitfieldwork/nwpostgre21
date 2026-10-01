import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[scrambleText]'
})
export class ScrambleTextDirective implements OnChanges {

  @Input() scrambleText!: string | number | null;

  private readonly chars = "!<>-_\\/[]{}—=+*^?#________";

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scrambleText']) {
      this.animateScramble(String(this.scrambleText));
    }
  }

  private animateScramble(finalText: string) {
    let frame = 0;
    const totalFrames = 20;

    const interval = setInterval(() => {
      const scrambled = finalText
        .split("")
        .map((char, i) => {
          if (i < frame) return finalText[i];
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        })
        .join("");

      this.el.nativeElement.innerText = scrambled;

      frame++;
      if (frame === totalFrames) {
        clearInterval(interval);
        this.el.nativeElement.innerText = finalText;
      }
    }, 30);
  }
}
