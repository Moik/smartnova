import { Component, OnInit, Output, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';

import {
  triggerMultifilterState,
  triggerPanelState,
  StateMultifilterService,
} from '../../../../../shared';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-products-multifilter',
  templateUrl: './products-multifilter.component.html',
  animations: [triggerMultifilterState, triggerPanelState],
  styleUrls: ['./products-multifilter.component.less']
})

export class ProductsMultifilterComponent implements OnInit {
  @ViewChild('cancelBtn') private cancelBtn: ElementRef;
  @Output() productsMultiFilter = new EventEmitter();
  id: string;

  public state = 'inactive';

  constructor(private StateMultifilter: StateMultifilterService) {
    StateMultifilter.stateChange$.subscribe(
      stateConfig => {
        this.state = stateConfig;
        if (stateConfig === 'active') {
          setTimeout(() => {
            this.cancelBtn.nativeElement.focus();
          }, 100);
        }
      }
    );
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === 27 && this.state === 'active') {
      this.MultifilterState();
    }
  }

  ngOnInit() {
  }

  checkFilter(form: NgForm) {
    if (form && form.valid) {
      this.productsMultiFilter.emit(form.value);
      sessionStorage.setItem('productMultiFilter', JSON.stringify(form.value));
      this.MultifilterState();
    }
  }
  MultifilterState() {
      this.state = this.state === 'active' ? 'inactive' : 'active';
      this.StateMultifilter.setStateMultifilter(this.state);
  }
}
