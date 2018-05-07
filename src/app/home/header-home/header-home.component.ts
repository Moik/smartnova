import { GetTerminalsService } from './../../shared/services/terminals/terminals.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../shared';

@Component({
  selector: 'app-header-home',
  templateUrl: './header-home.component.html',
  styleUrls: ['./header-home.component.less']
})
export class HeaderHomeComponent implements OnInit {

  public state = 'inactive';

  constructor(private auth: AuthService, private router: Router, private terminalService: GetTerminalsService) { }

  ngOnInit() {
  }

  openCloseSidebar(ev: any) {
    ev.preventDefault();
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }

  startDemo() {
    if (this.auth.isLoggedIn.getValue()) {
      this.auth.logout().subscribe(resp => {
        this.router.navigate(['/start']);
        sessionStorage.setItem('Demo','true');
        this.terminalService.terminals.next([]);
      });
    } else {
      this.router.navigate(['/start']);
      sessionStorage.setItem('Demo','true');

    }
  }
}
