import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  HostListener,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';
import { NgForm } from '@angular/forms';

import {
  triggerConfigState,
  triggerPanelState,
  StateConfiguratorService,
  TerminalIngredientsConfiguratorService,
} from '../../../../../shared';

import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-ingredients-configurator',
  templateUrl: './ingredients-configurator.component.html',
  animations: [triggerConfigState, triggerPanelState],
  styleUrls: ['./ingredients-configurator.component.less']
})

export class IngredientsConfiguratorComponent implements OnInit, OnChanges {
  @ViewChild('cancelBtn') private cancelBtn: ElementRef;
  @ViewChild('form') private form: NgForm;
  @Input() currentIngredient: any;
  @Output() configSent = new EventEmitter();

  public stateConfig = 'inactive';
  public ingredientConfig: string;
  ingredientUpdate = {
    IngredientPk: '',
    NewIssuanceVol: '',
    IssuanceVol: '',
    PreviousIssuanceVol: '',
    NewThreshold: '',
    Threshold: '',
    PreviousThreshold: ''
  };
  errorVol: string;
  errorThreshold: string;

  constructor(
    private stateConfiguratorService: StateConfiguratorService,
    private terminalIngredientsConfiguratorService: TerminalIngredientsConfiguratorService,
    public snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    stateConfiguratorService.stateChange$.subscribe(
      stateConfig => {
        this.stateConfig = stateConfig;
        if (stateConfig === 'active') {
          setTimeout(() => {
            this.cancelBtn.nativeElement.focus();
          }, 100);
        }
      }
    );
  }

  ngOnInit() {
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === 27 && this.stateConfig === 'active') {
      this.ConfigState(event);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.form.resetForm();
    this.errorVol = '';
    this.errorThreshold = '';
    if (changes.currentIngredient && !changes.currentIngredient.isFirstChange()) {
      this.ingredientConfig = this.terminalIngredientsConfiguratorService.getCourentIngredientConfig(this.currentIngredient);
      const terminalPk = this.route.parent.snapshot.params['terminalPk'];
      this.terminalIngredientsConfiguratorService.getCurrentIngredientConfig(this.currentIngredient.Pk, terminalPk).subscribe(resp => {
        this.ingredientUpdate = resp.IngredientUpdat;
      });
    }
  }

  ConfigState(event: any): void {
    this.stateConfig = this.stateConfig === 'active' ? 'inactive' : 'active';
    this.stateConfiguratorService.setStateConfigurator(this.stateConfig);
  }

  SaveConfig(event: any): void {
    this.terminalIngredientsConfiguratorService.setCourentIngredientConfig(this.currentIngredient);
    this.stateConfig = this.stateConfig === 'active' ? 'inactive' : 'active';
    this.stateConfiguratorService.setStateConfigurator(this.stateConfig);
  }

  submitConfig() {
    const issuanceVol = this.form.value.NewIssuanceVol;
    const threshold = this.form.value.NewThreshold;
    if (issuanceVol && threshold) {
      const setData = {
        IssuanceVol: issuanceVol,
        Threshold: threshold,
        IngredientPk: this.currentIngredient.Pk,
        TerminalPk: this.route.parent.snapshot.params['terminalPk']
      };
      this.terminalIngredientsConfiguratorService.setCurrentIngredientConfig(setData).subscribe(resp => {
        this.stateConfig = this.stateConfig === 'active' ? 'inactive' : 'active';
        this.stateConfiguratorService.setStateConfigurator(this.stateConfig);
        this.configSent.emit({
          action: 'setConfig',
          ingredient: this.currentIngredient
        });
        this.snackBarShow('Конфигурация отправлена');
      }, error => {
        this.snackBarShow('Произошла ошибка');
      });
    } else {
      this.errorVol = !issuanceVol ? 'Укажите объём выдачи' : '';
      this.errorThreshold = !threshold ? 'Укажите порог' : '';
    }
  }

  applyConfig() {
    const setData = {
      IngredientPk: this.currentIngredient.Pk,
      TerminalPk: this.route.parent.snapshot.params['terminalPk']
    };
    this.terminalIngredientsConfiguratorService.applyIngredientConfig(setData).subscribe(resp => {
      this.stateConfig = this.stateConfig === 'active' ? 'inactive' : 'active';
      this.stateConfiguratorService.setStateConfigurator(this.stateConfig);
      this.snackBarShow('Конфигурация отправлена');
      this.configSent.emit({
        action: 'applyConfig',
        ingredient: this.currentIngredient
      });
    }, error => {
      this.snackBarShow('Произошла ошибка');
    });
  }

  snackBarShow(message) {
    return this.snackBar.open(message, null, {
      duration: 2000,
      horizontalPosition: 'right'
    });
  }

}

