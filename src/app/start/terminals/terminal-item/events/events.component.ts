import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {
  StorageTerminalsData,
  TItemEvent,
  GetTerminalEventsService,
  StateMultifilterService,
  StateConfiguratorService,
  StateConfigModeService,
} from '../../../../shared';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/publishLast';

import { MultiFilterEventsPipe } from './../../../../shared/pipes/multi-filter-events.pipe';
import { SettingsService, SortSettings } from '../../../../shared/services/common/settings.service';
import { Subscription } from 'rxjs/Subscription';
import { SignalRService } from '../../../../shared/services/auth/signalr.service';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less']
})
export class EventsComponent implements OnInit, OnDestroy {
  tab = 1;
  typeMultifilter: string;

  public state: string;
  public stateConfig: string;
  public stateConfigMode: string;
  public currentEventPk: string;

  multiFilter: any;
  filtered: boolean;
  notViewed: number;
  events: any;
  setViewedLoading = false;

  sort: {
    operational: SortSettings,
    system: SortSettings,
    uncertain: SortSettings,
    custom: SortSettings
  };

  private headers = new Headers({
    'Content-Type': 'application/json'
  });

  private eventSubscritption: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceProd: GetTerminalEventsService,
    //  private getTerminals: StorageTerminalsData,
    public http: Http,
    private StateMultifilter: StateMultifilterService,
    private stateConfiguratorService: StateConfiguratorService,
    private stateConfigModeService: StateConfigModeService,
    private filterPipe: MultiFilterEventsPipe,
    private settingsService: SettingsService,
    private signalRService: SignalRService
  ) {
    stateConfigModeService.changeConfigMode$.subscribe(stateConfigMode => this.stateConfigMode = stateConfigMode);
  }

  ngOnInit() {
    this.events = this.route.snapshot.data['events'];

    const mFilter = sessionStorage.getItem('eventsMultiFilter');
    if (mFilter) {
      this.multiFilter = JSON.parse(mFilter);
      this.filtered = true;
    }

    this.countNotViewedEvents();

    if (this.settingsService.settings) {
      this.sort = this.settingsService.settings.events;
    }
    if (mFilter && sessionStorage.getItem('eventsSortOrder')) {
      Object.keys(this.sort).forEach(item => {
        this.sort[item].sortBy = JSON.parse(sessionStorage.getItem('eventsSortOrder'));
        this.sort[item].sortOrder = 'asc';
      });
    }

    this.eventSubscritption = this.signalRService.onEventSent$.subscribe(resp => {
      this.serviceProd.getEvents(JSON.parse(<string>resp).TerminalPk).subscribe(response => {
        this.events = response.IsSuccess ? response.TerminalEvents : null;
        this.countNotViewedEvents();
      });
    });
  }

  MultifilterState(event: any): void {
    this.state = this.StateMultifilter.getStateMultifilter();
    this.state = this.state === 'active' ? 'inactive' : 'active';
    this.StateMultifilter.setStateMultifilter(this.state);
  }

  ConfigState(event: any, thisPk: string): void {
    this.currentEventPk = thisPk;
    this.stateConfig = this.stateConfiguratorService.getStateConfigurator();
    this.stateConfig = this.stateConfig === 'active' ? 'inactive' : 'active';
    this.stateConfiguratorService.setStateConfigurator(this.stateConfig);
  }

  goToEventStatistic(ev: any, type: any): any {
    ev.preventDefault();
    this.router.navigate(['stats'], {
      relativeTo: this.route,
      queryParams: {
        type: type,
        pk: this.route.snapshot.parent.params['terminalPk']
      }
    });
  }

  setEventViewed(item: TItemEvent, group: string) {
    if (!item.Viewed && !this.setViewedLoading) {
      this.setViewedLoading = true;
      if (!!sessionStorage.getItem('auth_token')) {
        this.serviceProd.setEventAsViewed(item.Pk)
          .finally(() => this.setViewedLoading = false)
          .subscribe(res => {
            if (res.IsSuccess) {
              item.Viewed = true;
              item.TotalNumber = 0;
              this.notViewed -= 1;
              this.signalRService.eventWasViewed();
            } else {
              console.log(res);
            }
          }, err => console.log(err));
      } else {
        item.Viewed = true;
        this.notViewed -= 1;
        this.signalRService.eventWasViewed();
        this.setViewedLoading = false;
      }
    }
  }

  applyMultiFilter(multifilter) {
    this.multiFilter = multifilter;
    this.filtered = multifilter ? true : false;
    this.countNotViewedEvents();
    Object.keys(this.sort).forEach(item => {
      this.sort[item].sortBy = JSON.parse(sessionStorage.getItem('eventsSortOrder'));
      this.sort[item].sortOrder = 'asc';
    });
  }

  clearMultiFilter() {
    this.multiFilter = null;
    sessionStorage.removeItem('eventsMultiFilter');
    this.filtered = false;

    this.countNotViewedEvents();
  }

  openMultifilter(ev: any, tabindex: any): any {
    ev.preventDefault();
    this.typeMultifilter = tabindex;
  }

  setData() {
    sessionStorage.setItem(
      'operationalEvents',
      JSON.stringify(this.filterPipe.transform(this.events.Operational, this.multiFilter, 'Operational'))
    );
    sessionStorage.setItem(
      'systemEvents',
      JSON.stringify(this.filterPipe.transform(this.events.System, this.multiFilter, 'System'))
    );
    sessionStorage.setItem(
      'uncertainEvents',
      JSON.stringify(this.filterPipe.transform(this.events.Uncertain, this.multiFilter, 'Uncertain'))
    );
  }

  ngOnDestroy() {
    sessionStorage.removeItem('operationalEvents');
    sessionStorage.removeItem('systemEvents');
    sessionStorage.removeItem('uncertainEvents');
    if (this.eventSubscritption) {
      this.eventSubscritption.unsubscribe();
    }
  }

  countNotViewedEvents() {
    if (this.events) {
      this.notViewed = 0;
      for (const key of Object.keys(this.events)) {
        const sorted = this.filterPipe.transform(this.events[key], this.multiFilter, key);
        if (sorted) {
          sorted.forEach((item: any) => {
            if (item.Viewed === false) {
              this.notViewed += 1;
            }
          });
        }
      }
    }
  }

  onChangeSortOrder(sortOrder, type) {
    this.settingsService.settings.events[type].sortOrder = sortOrder;
  }

  onChangeSort(sortBy, type) {
    this.settingsService.settings.events[type].sortBy = sortBy;
  }
}