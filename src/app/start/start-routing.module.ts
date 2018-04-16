import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TerminalsComponent } from './terminals/terminals.component';
import { TerminalsReportComponent } from './terminals/terminals-report/terminals-report.component';

import { ReportLoggingComponent } from './report-logging/report-logging.component';


import { StartComponent } from './start.component';
import {
  TerminalItemComponent,

  CollectionComponent,
  CollectionReportComponent,

  EventsComponent,
  EventsStatsComponent,
  EventsReportComponent,

  IngridientsComponent,
  IngridientsReportComponent,

  ProductsComponent,
  ProductsReportComponent,

  SellsComponent,
  SellsReportComponent

} from './terminals/terminal-item';

import { EventsResolver } from '../shared/resolvers/events.resolver';
import { EventsStatsResolver } from '../shared/resolvers/events-stats.resolver';
import { CollectionResolver } from '../shared/resolvers/collection.resolver';
import { IngredientsResolver } from '../shared/resolvers/ingredients.resolver';
import { SignalRResolver } from '../shared/resolvers/signalR.resolver';
import { ReportLoggingResolver } from '../shared/resolvers/report-logging.resolver';

const startRoutes: Routes = [
    {
      path: 'start',
      component: StartComponent,
      // resolve: {
      //   connection: SignalRResolver
      // },
      children: [
        {
          path: '',
          component: TerminalsComponent
        },
        {
          path: 'terminals',
          component: TerminalsComponent,
        },
        {
          path: 'terminal-item/:terminalPk',
          component: TerminalItemComponent,
          children: [
            {
              path: 'collection',
              component: CollectionComponent,
              resolve: {
                collection: CollectionResolver
              }
            },

            {
              path: 'events',
              component: EventsComponent,
              resolve: {
                events: EventsResolver
              }
            },

            {
              path: 'events/stats',
              component: EventsStatsComponent,
              resolve: {
                stats: EventsStatsResolver
              }
            },
            {
              path: 'ingridients',
              component: IngridientsComponent,
              resolve: {
                ingredients: IngredientsResolver
              }
            },

            {
              path: 'products',
              component: ProductsComponent,
            },

            {
              path: 'sells',
              component: SellsComponent,
            },
            {
              path: '',
              redirectTo: 'sells',
              pathMatch: 'full'
            }
          ]
        }
      ],
    },
    {
      path: 'start/terminals/report',
      component: TerminalsReportComponent,
    },
    {
      path: 'start/terminal-item/products/report/:Pk',
      component: ProductsReportComponent,
    },
    {
      path: 'start/terminal-item/ingridients/report/:Pk',
      component: IngridientsReportComponent,
    },
    {
      path: 'start/terminal-item/events/report',
      component: EventsReportComponent,
    },
    {
      path: 'start/terminal-item/collection/report/:Pk',
      component: CollectionReportComponent,
    },
    {
      path: 'start/terminal-item/sells/report',
      component: SellsReportComponent,
    },
    {
      path: 'start/logging',
      component: ReportLoggingComponent,
      resolve: {
        logs: ReportLoggingResolver
      }
    },
];

@NgModule({
  imports: [RouterModule.forChild(startRoutes)],
  exports: [RouterModule]
})
export class StartRoutingModule { }
