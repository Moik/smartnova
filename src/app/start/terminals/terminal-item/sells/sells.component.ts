import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import {
  GetTerminalSellsService,
  TItemSells,
  StateMultifilterService,
} from '../../../../shared';
import { MultiFilterSellsPipe } from '../../../../shared/shared';
import { SettingsService } from '../../../../shared/services/common/settings.service';
import { Subscription } from 'rxjs/Subscription';
import { SignalRService } from '../../../../shared/services/auth/signalr.service';

@Component({
  selector: 'app-sells',
  templateUrl: './sells.component.html',
  styleUrls: ['./sells.component.less']
})

export class SellsComponent implements OnInit, OnDestroy, AfterViewInit {

  public data: TItemSells[];
  productPk: string;
  public filterQuery = '';
  public rowsOnPage = 10;
  public sortBy: string;
  public sortOrder: string;
  public state: string;

  multiFilter: any;
  filtered: boolean;
  totalSum: number;
  page: number;
  searchFields = [
    'DateTime',
    'Name',
    'Summ',
    'SoldNumber',
    'SoldSum'
  ];

  private saleSubscritption: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceProd: GetTerminalSellsService,
    private StateMultifilter: StateMultifilterService,
    private filterPipe: MultiFilterSellsPipe,
    private settingsService: SettingsService,
    private signalRService: SignalRService
  ) { }

  ngOnInit() {
    let Item = {} as any;

    if (!!this.route.snapshot.params['Item']) {
      Item = JSON.parse(this.route.snapshot.params['Item']);
      sessionStorage.setItem('ItemProduct', this.route.snapshot.params['Item']);
    } else {
      Item = JSON.parse(sessionStorage.getItem('ItemProduct'));
    }

    const mFilter = sessionStorage.getItem('sellsMultiFilter');
    if (mFilter) {
      this.multiFilter = JSON.parse(mFilter);
      this.filtered = true;
    }

    this.productPk = Item.Pk || this.serviceProd.Pk;
    this.serviceProd.getSell(this.productPk).subscribe(product => {
        this.data = product.TerminalSales;
        this.totalSum = this.filterPipe.transform(this.data, this.multiFilter).reduce((sum, current) => {
          return sum + current.SoldSum;
        }, 0);
        return product;
      }, err => console.log(err));

    if (mFilter && sessionStorage.getItem('sellsSortOrder')) {
      this.sortBy = JSON.parse(sessionStorage.getItem('sellsSortOrder'));
      this.sortOrder = 'asc';
    } else if (this.settingsService.settings) {
      this.sortBy = this.settingsService.settings.sells.sortBy || 'DateTime';
      this.sortOrder = this.settingsService.settings.sells.sortOrder || 'desc';
    }

    this.page = this.settingsService.settings.sells.page;
  }

  ngAfterViewInit() {
    this.signalRService.signalrConnection$.subscribe(connect => {
      this.saleSubscritption = this.signalRService.onSaleSent$.subscribe(resp => {
        this.serviceProd.getSell(JSON.parse(<string>resp).TerminalPk).subscribe(product => {
          this.data = product.TerminalSales;
          this.totalSum = this.filterPipe.transform(this.data, this.multiFilter).reduce((sum, current) => {
            return sum + current.SoldSum;
          }, 0);
          return product;
        }, err => console.log(err));
      });
    });
  }

  toInt(num: string) {
    return +num;
  }

  MultifilterState(event: any) {
    event.stopPropagation();
    this.state = this.StateMultifilter.getStateMultifilter();
    this.state = this.state === 'active' ? 'inactive' : 'active';
    this.StateMultifilter.setStateMultifilter(this.state);
    return false;
  }

  // sortByWordLength = (a: any) => {
  //    return a.city.length;
  // }

  applyMultiFilter(multifilter) {
    this.multiFilter = multifilter;
    this.filtered = multifilter ? true : false;
    this.totalSum = this.filterPipe.transform(this.data, this.multiFilter).reduce((sum, current) => {
      return sum + current.SoldSum;
    }, 0);
    this.sortBy = JSON.parse(sessionStorage.getItem('sellsSortOrder'));
    this.sortOrder = 'asc';
  }

  clearMultiFilter() {
    this.multiFilter = null;
    sessionStorage.removeItem('sellsMultiFilter');
    this.filtered = false;
    this.totalSum = this.filterPipe.transform(this.data, this.multiFilter).reduce((sum, current) => {
      return sum + current.SoldSum;
    }, 0);
  }

  onChangeSort(sortBy: string) {
    this.settingsService.settings.sells.sortBy = sortBy;
  }

  onChangeSortOrder(sortOrder: string) {
    this.settingsService.settings.sells.sortOrder = sortOrder;
  }

  ngOnDestroy(): void {
    if (this.saleSubscritption) {
      this.saleSubscritption.unsubscribe();
    }
  }
}
