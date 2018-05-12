import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  OnInit,
  Input
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { SignalRService } from '../../../shared/services/auth/signalr.service';
import { MainChartModule } from './main-chart.module';
import { ChartMainService } from '../../../shared';

import 'highcharts/adapters/standalone-framework.src';

const Highcharts = require('highcharts/highstock.src');


@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrls: ['./main-chart.component.less'],
})

export class MainChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('chart') public chartEl: ElementRef;

  dataMain: any;
  options: Object;
  dataLine: Array<any>;

  private saleSubscritption: Subscription;

  private _chart: any;
  constructor(
    private getChartMainService: ChartMainService,
    private signalRService: SignalRService
  ) {
    this.dataLine = [];
    Highcharts.setOptions({
      lang: {
        weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        rangeSelectorZoom: '',
        rangeSelectorFrom: 'С',
        rangeSelectorTo: 'по'
      }
    });
  }


  public ngOnInit() {
    if (!this.getChartMainService.charts.getValue()) {
      this.getChartMainService.getChartMain().subscribe(data => {
        if (data.IsSuccess) {
          this.dataMain = data.LineChart;
          this.renderCharts();
        }
      });
    } else {
      this.dataMain = this.getChartMainService.charts.getValue();
      this.renderCharts();
    }

    this.saleSubscritption = this.getChartMainService.charts$.subscribe(data => {
      this.dataMain = data;
      console.log(data);
      this.renderCharts();
    });
  }

  public ngAfterViewInit() {
  }

  public ngOnDestroy() {
    if (this._chart) {
      this._chart.destroy();
    }
    if (this.saleSubscritption) {
      this.saleSubscritption.unsubscribe();
    }
  }

  renderCharts() {

      if (this.dataMain) {
        Object.keys(this.dataMain).forEach(key => {
          const newItem = this.dataMain[key].map((item: any) => {
            const newPoint = [];
            newPoint.push(new Date(item.DateTime).getTime());
            newPoint.push(item.Value);
            return newPoint;
          });
          this.dataLine.push(newItem);
        });
      }

      const opts: any = {

        chart: {
          height: 400
        },

        title: {
          text: 'Динамика продаж'
        },

        subtitle: {
          text: 'Динамика продаж всех автоматов по месяцам'
        },

        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            minTickInterval: 24 * 3600 * 1000,
            millisecond: '%b %e'
          },
        },

        tooltip: {
          dateTimeLabelFormats: {
            minTickInterval: 24 * 3600 * 1000,
            millisecond: '%A, %b %e, %H:%M',
            second: '%A, %b %e, %H:%M',
          },
        },

        rangeSelector: {
          inputDateFormat: '%e %b, %Y',
          selected: 0,
          enabled: true,
          buttons: [
            {
              type: 'month',
              count: 1,
              text: '1 мес'
            },
            {
              type: 'month',
              count: 3,
              text: '3 мес'
            },
            {
              type: 'month',
              count: 6,
              text: '6 мес'
            },
            {
              type: 'ytd',
              text: 'С 1 янв'
            },
            {
              type: 'year',
              count: 1,
              text: '1 год'
            },
            {
              type: 'all',
              text: 'Все'
            }
          ],
          buttonSpacing: 4,
          buttonTheme: {
            width: 50
          }
        },

        series: [{
          name: 'Сумма продаж',
          data: this.dataLine[0],
          pointInterval: 24 * 36e5,
          type: 'area',
          threshold: null,
          tooltip: {
            valueDecimals: 2
          }
        },
        {
          name: 'Сумма инкасации',
          data: this.dataLine[1],
          type: 'area',
          threshold: null,
          tooltip: {
            valueDecimals: 2
          }
        }],
        lang: {
          weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
          shortMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        },
        credits: {
          text: ''
        },
        responsive: {
          rules: [{
            condition: {
              maxWidth: 500
            },
            chartOptions: {
              title: {
                text: 'Динамика продаж'
              },
              chart: {
                height: 300
              },
              subtitle: {
                text: null
              },
              navigator: {
                enabled: false
              }
            }
          }]
        }
      };
      if (this.chartEl && this.chartEl.nativeElement) {
        opts.chart = {
          type: 'area',
          renderTo: this.chartEl.nativeElement
        };

        this._chart = new Highcharts.stockChart(opts);
      }

  }
}
