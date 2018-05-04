import { Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appForbidNegativeNumberForConf]'
})


export class ForbidNegativeNumberForConfDirective {
  constructor(private el: ElementRef) { }
    @HostListener('keydown', ['$event']) onKeyDown(e) {
      const value = this.el.nativeElement.value;
      if ( value === '' && e.key === ',') {return; }
      if (!((e.keyCode > 95 && e.keyCode < 106)
        || (e.key === ',' && value.indexOf(',') === -1)
        || (e.keyCode > 47 && e.keyCode < 58)
        || e.keyCode === 8)) {
          return false;
      }
    }

}


/*
 @HostListener('keydown', ['$event']) onKeyDown(e) {
    if (!((e.keyCode > 95 && e.keyCode < 106)
      || (e.keyCode > 47 && e.keyCode < 58)
      || e.keyCode === 8
      || e.keyCode === 46
      || e.keyCode === 16
      || e.keyCode === 17
      || e.key === ','
      || (e.keyCode > 36 && e.keyCode < 41))) {
        return false;
    }
    if ((!this.el.nativeElement.value.length || this.el.nativeElement.value.indexOf(',') !== -1) && e.key === ',') {
      return false;
    }
  }
  */
