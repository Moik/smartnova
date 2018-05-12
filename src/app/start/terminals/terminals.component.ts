import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SHARED_PIPE } from '../../shared/shared';

import {
  GetTerminalsService,
  StorageTerminalsData,
  StateMultifilterService,
} from '../../shared';
import { SettingsService } from '../../shared/services/common/settings.service';
import { SignalRService } from '../../shared/services/auth/signalr.service';
import { Subscription } from 'rxjs/Subscription';
import { Terminal } from './../../shared/models/terminal.model';

@Component({
  selector: 'app-terminals',
  templateUrl: './terminals.component.html',
  styleUrls: ['./terminals.component.less'],
})

export class TerminalsComponent implements OnInit, OnDestroy {

  public filterQuery = '';
  public rowsOnPage = 10;
  public sortBy: string;
  public sortOrder: string;

  public data: StorageTerminalsData;
  public state: string;
  private changeTerminalSubscription:Subscription;
  multiFilter: any;
  filtered: boolean;
  page: number;
  searchFields = [
    'Id',
    'Name',
    'Address',
    'SalesSum',
    'CollectSum'
  ];

  constructor(
    private router: Router,
    public getTerminalsService: GetTerminalsService,
    private StateMultifilter: StateMultifilterService,
    private settingsService: SettingsService,
    private signalRService: SignalRService

  ) { }


  ngOnInit() {
    // this.getTerminalsService.getTerminals()
    //   .subscribe((data) => {
    //     if (data.IsSuccess) {
    //       this.data = data.Terminals;
    //     }
    //   });
    if (this.getTerminalsService.terminals.getValue().length === 0) {
      this.getTerminalsService.getTerminals$();
    }
    const mFilter = sessionStorage.getItem('terminalsMultiFilter');
    if (mFilter) {
      this.multiFilter = JSON.parse(mFilter);
      this.filtered = true;
    }

    if (mFilter && sessionStorage.getItem('terminalsSortOrder')) {
      this.sortBy = JSON.parse(sessionStorage.getItem('terminalsSortOrder'));
      this.sortOrder = 'asc';
    } else if (this.settingsService.settings) {
      this.sortBy = this.settingsService.settings.terminals.sortBy || 'Id';
      this.sortOrder = this.settingsService.settings.terminals.sortOrder || 'asc';
    }

    this.page = this.settingsService.settings.terminals.page;
    this.rowsOnPage = this.settingsService.settings.terminals.rowsOnPage;

    this.changeTerminalSubscription = this.getTerminalsService.changeTerminal$.subscribe(res=>{
      if(res){
       this.changeItem(res);
      }
    })
  }

  setRowsOnPage() {
    this.settingsService.settings.terminals.rowsOnPage = this.rowsOnPage;
  }

  MultifilterState(event: any) {
    event.stopPropagation();
    this.state = this.StateMultifilter.getStateMultifilter();
    this.state = this.state === 'active' ? 'inactive' : 'active';
    this.StateMultifilter.setStateMultifilter(this.state);
    return false;
  }

  toInt(num: string) {
    return +num;
  }

  goToProduct(item: any) {
    sessionStorage.setItem('ItemProduct', JSON.stringify(item));
    this.router.navigate(['start/terminal-item', item.Pk]);
  }

  applyMultiFilter(multifilter) {
    this.multiFilter = multifilter;
    this.filtered = multifilter ? true : false;
    this.sortBy = JSON.parse(sessionStorage.getItem('terminalsSortOrder'));
    this.sortOrder = 'asc';
  }

  clearMultiFilter() {
    this.multiFilter = null;
    sessionStorage.removeItem('terminalsMultiFilter');
    this.filtered = false;
  }

  onChangeSort(sortBy: string) {
    this.settingsService.settings.terminals.sortBy = sortBy;
  }

  onChangeSortOrder(sortOrder: string) {
    this.settingsService.settings.terminals.sortOrder = sortOrder;
  }
  changeItem(value:string){
    let oldTerm=this.getTerminalsService.terminals.getValue();
      if (oldTerm.length != 0) {
        let newTerm=oldTerm.map(function(val,i){
        if(val.Pk===value){
          val.Connection=true;
          return val;
        }else{
          return val;
        }
      })
      this.getTerminalsService.terminals.next(newTerm);
    
    }
   
  }

  ngOnDestroy(): void {
    this.changeTerminalSubscription.unsubscribe();
  }
}

