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
  EventEmitter,
} from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';

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

  public directive: any= '';

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
    public snackBar: MatSnackBar
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
      this.terminalIngredientsConfiguratorService.getCurrentIngredientConfig(this.currentIngredient.Pk).subscribe(resp => {
        this.ingredientUpdate = resp.IngredientUpdat;
      //  this.ingredientUpdate.NewThreshold='0';
       // this.ingredientUpdate.NewIssuanceVol='0';
        // if (this.ingredientUpdate.PreviousIssuanceVol) {
        //   this.ingredientUpdate.NewIssuanceVol = this.ingredientUpdate.PreviousIssuanceVol;
        // }
        // if (this.ingredientUpdate.PreviousThreshold) {
        //   this.ingredientUpdate.NewThreshold = this.ingredientUpdate.PreviousThreshold;
        // }
      });
    }
  }

 /*
  ChangeNewThreshold(ev:any):void{
    console.log(this.form)
    if(this.ingredientUpdate.NewThreshold==null
      || this.ingredientUpdate.NewThreshold==''
      ||this.ingredientUpdate.NewThreshold=='0') {this.ingredientUpdate.NewThreshold='0'}
    let str=this.ingredientUpdate.NewThreshold;
    let result = '';
    let separatorExist = false;
    let arr = str.split('');
    arr.forEach(function(val, i){
      if(/\d/.test(val)){
        result += val;
      }
      if(val == ',' && i!=0){
        if(!separatorExist) {
          result += val;
          separatorExist = true;
        }
      }
    });
    console.log(result);
    this.ingredientUpdate.NewThreshold=result;


  }
*/

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
    const issuanceVol = this.checkDataFromField(this.form.value.NewIssuanceVol , this.ingredientUpdate.IssuanceVol);
    const threshold = this.checkDataFromField(this.form.value.NewThreshold , this.ingredientUpdate.Threshold);
    console.log(issuanceVol);
    console.log(threshold);
    if (issuanceVol && threshold) {
      const setData = {
        IssuanceVol: issuanceVol,
        Threshold: threshold,
        IngredientPk: this.currentIngredient.Pk,
        TerminalPk: sessionStorage.getItem('productPk')
      };
      this.terminalIngredientsConfiguratorService.setCurrentIngredientConfig(setData).subscribe(resp => {
        this.stateConfig = this.stateConfig === 'active' ? 'inactive' : 'active';
        this.stateConfiguratorService.setStateConfigurator(this.stateConfig);
        this.configSent.emit({
          action: 'setConfig',
          ingredient: this.currentIngredient
        });
        this.snackBarShow(`Конфигурация отправлена' Объем выдачи: ${setData.IssuanceVol},Порог: ${setData.Threshold}`);
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
      TerminalPk: sessionStorage.getItem('productPk')
    };
    this.terminalIngredientsConfiguratorService.applyIngredientConfig(setData).subscribe(resp => {
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

  checkDataFromField(news: any, old: any) {
      if (news === '' || news === undefined) {return old;  }
        return news;
  }


}

