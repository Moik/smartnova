import { DatexPipe } from './pipes/datex.pipe';
import { ShareDataService } from './services/common/share-data.service';
import { RadioLabelsPipe } from './pipes/radio-labels.pipe';

import { AuthService } from './services/auth/auth.service';
import { ClientDataService } from './services/auth/client-data.service';
import { SignalRService } from './services/auth/signalr.service';


import {
  StateConfiguratorService,
  StateConfigModeService,
  StateMultifilterService,
  StateUserpanelService,
  TerminalProductsConfiguratorService,
  TerminalEventsConfiguratorService,
  TerminalIngredientsConfiguratorService
} from './index';

import { User } from './models';

import { emailMatcher } from './pipes/email-matcher';
import { DateTimePipe } from './pipes/date-time.pipe';
import { DataFilterPipe } from './pipes/data-filter.pipe';
import { MultiFilterProductsPipe } from './pipes/multi-filter-products.pipe';
import { MultiFilterTerminalsPipe } from './pipes/multi-filter-terminals.pipe';
import { MultiFilterSellsPipe } from './pipes/multi-filter-sells.pipe';
import { MultiFilterCollectPipe } from './pipes/multi-filter-collect.pipe';
import { MultiFilterIngredientsPipe } from './pipes/multi-filter-ingredients.pipe';
import { MultiFilterEventsPipe } from './pipes/multi-filter-events.pipe';
import { ReportLoggingService } from './services/common/report-logging.service';

const SHARED_PIPE: any[] = [
  DataFilterPipe,
  MultiFilterProductsPipe,
  MultiFilterSellsPipe,
  MultiFilterCollectPipe,
  MultiFilterEventsPipe,
  MultiFilterIngredientsPipe,
  MultiFilterTerminalsPipe,
  RadioLabelsPipe,
  DateTimePipe,
  DatexPipe
];
const SHARED_PROVIDE: any[] = [
  AuthService,
  ReportLoggingService,
  ClientDataService,
  StateConfiguratorService,
  StateConfigModeService,
  StateMultifilterService,
  StateUserpanelService,
  TerminalProductsConfiguratorService,
  TerminalIngredientsConfiguratorService,
  TerminalEventsConfiguratorService,
  ShareDataService,
  SignalRService
];

export {

  AuthService,
  ReportLoggingService,
  ClientDataService,
  SHARED_PROVIDE,

  DataFilterPipe,
  MultiFilterProductsPipe,
  MultiFilterSellsPipe,
  MultiFilterCollectPipe,
  MultiFilterEventsPipe,
  MultiFilterIngredientsPipe,
  MultiFilterTerminalsPipe,
  RadioLabelsPipe,
  DateTimePipe,
  DatexPipe,
  SHARED_PIPE,

  User,
  emailMatcher
};
