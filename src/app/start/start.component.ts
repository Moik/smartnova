import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { slideInDownAnimation, urlApi } from '../shared';
import { StartModule } from './start.module';
import { ISignalRConnection, ConnectionStatus, SignalR } from 'ng2-signalr';

import { SignalRService } from '../shared/services/auth/signalr.service';
import { Subscription } from 'rxjs/Subscription';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-start',
  animations: [slideInDownAnimation],
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.less'],
})

export class StartComponent implements OnInit, OnDestroy {
  private connection: ISignalRConnection;
  private signalrSubscritption: Subscription;
  private saleSubscritption: Subscription;
  private eventSubscritption: Subscription;
  private configSubscritption: Subscription;
  userId: string;
  groupId: string;
  @HostBinding('@routeAnimation') routeAnimation = true;

  constructor(
    private route: ActivatedRoute,
    private signalRService: SignalRService,
    public snackBar: MatSnackBar,
    private signalR: SignalR
  ) { }

  ngOnInit() {
    // this.connection = this.route.snapshot.data['connection'];
    this.signalR.connect().then(connect => {
      this.connection = connect;
      this.signalRService.getConnection(connect);

      this.saleSubscritption = this.signalRService.onSaleSent$.subscribe(resp => {
        this.snackBarShow(JSON.parse(<string>resp).Notification);
      });
      this.eventSubscritption = this.signalRService.onEventSent$.subscribe(resp => {
        this.snackBarShow(JSON.parse(<string>resp).Notification);
      });
      this.configSubscritption = this.signalRService.onConfigSent$.subscribe(resp => {
        this.snackBarShow(JSON.parse(<string>resp).Notification);
      });

      this.userId = sessionStorage.getItem('UserPk');
      this.groupId = sessionStorage.getItem('TnId');
      if (!this.userId) {
          this.userId = this.signalRService.getUserDemoId();
          this.groupId = this.signalRService.getGroupDemoId();
      }

      const isSignalROn = JSON.parse(sessionStorage.getItem('signalR'));
      if (isSignalROn || isSignalROn === null) {
        this.connect(this.userId, this.groupId, true);
      }

      this.signalrSubscritption = this.signalRService.signalRToggle$.subscribe((status: boolean) => {
        this.connect(this.userId, this.groupId, status);
      });
    });
  }

  connect(userId: string, groupId: string, status: boolean) {
    if (!sessionStorage.getItem('UserPk')) {
      this.signalRService.setDemoMode();
    }
    if (status) {
      this.connection.invoke('connect', userId, groupId).then((data) => {
        if (this.signalRService.isDemoMode) {
          this.signalRService.startDemo(userId).subscribe(resp => {
            console.log(resp);
          });
        }
      }).catch(err => console.log(err));
    } else {
      this.connection.invoke('Disconnect', userId).then(data => {
        if (this.signalRService.isDemoMode) {
          this.signalRService.stopDemo(userId).subscribe(resp => {
            console.log(resp);
          });
          this.signalRService.disableDemoMode();
        }
      }).catch(err => console.log(err));
    }
  }

  snackBarShow(message) {
    return this.snackBar.open(message, 'Закрыть', {
      extraClasses: ['snack-bar-notification'],
      duration: 5000,
      horizontalPosition: 'right'
    });
  }

  ngOnDestroy() {
    if (this.signalrSubscritption) {
      this.signalrSubscritption.unsubscribe();
    }
    if (this.saleSubscritption) {
      this.saleSubscritption.unsubscribe();
    }
    if (this.eventSubscritption) {
      this.eventSubscritption.unsubscribe();
    }
    if (this.configSubscritption) {
      this.configSubscritption.unsubscribe();
    }
    // this.connect(this.userId, this.groupId, false);
    this.connection.invoke('Disconnect', this.userId).then(data => {
      if (this.signalRService.isDemoMode) {
        this.signalRService.stopDemo(this.userId).subscribe(resp => {
          console.log(resp);
        });
        this.signalRService.disableDemoMode();
      }
      // this.connection.stop();
    }).catch(err => console.log(err));
  }
}
