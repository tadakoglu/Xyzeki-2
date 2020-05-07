import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLiAnimate]'
})
export class LiAnimateDirective {

  constructor(public elementRef: ElementRef) { }

  @HostListener('mouseenter') onMouseEnter() {
    (this.elementRef.nativeElement as HTMLElement).classList.add('animateLi')
  }

  @HostListener('mouseleave') onMouseLeave() {
    (this.elementRef.nativeElement as HTMLElement).classList.remove('animateLi')
  }

}
