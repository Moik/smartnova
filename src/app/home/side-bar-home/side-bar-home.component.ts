import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { trigger, state, style, animate, transition, } from '@angular/animations';

import { AppComponent } from '../../app.component';
import { User, AuthService, emailMatcher, } from '../../shared/shared';

import { triggerUserPanelState, triggerPanelState } from '../../shared';


@Component({
  selector: 'app-side-bar-home',
  templateUrl: './side-bar-home.component.html',
  styleUrls: ['./side-bar-home.component.less'],
  animations: [triggerPanelState, triggerUserPanelState],
})
export class SideBarHomeComponent implements OnInit, OnDestroy {

  tab = 1;
  loginForm: FormGroup;
  restoreForm: FormGroup;
  registerForm: FormGroup;
  errorFromServer: string;
  errorRestorePassword: string;
  errorRegister: string;
  loads = false;

  @Input() userPanelState: string;

  constructor(
    private rootComp: AppComponent,
    private router: Router,
    private authService: AuthService,
    public fb: FormBuilder) {

  }

  ngOnInit() {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.rootComp.cssClass = 'sidebar-closed';
      }
    });
    const emailPattern = '^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$';
    this.loginForm = this.fb.group({
      Password: ['', [Validators.required, Validators.minLength(6)]],
      Email: ['', [Validators.required, Validators.pattern(emailPattern)]]
    });
    this.restoreForm = this.fb.group({
      Email: ['', [Validators.required, Validators.pattern(emailPattern)]]
    });
    this.registerForm = this.fb.group({
      Tid: ['', [Validators.required, Validators.pattern('[A-Z]{3}[0-9]{7}')]],
      Email: ['', [Validators.required, Validators.pattern(emailPattern)]],
      Password: this.fb.group({
        Check: ['', [Validators.required, Validators.minLength(6)]],
        Confirm: ['', Validators.required]
      }, { validator: emailMatcher })
    });
  }

  openCloseSidebar(ev: any) {
    this.loginForm.reset();
    this.restoreForm.reset();
    this.registerForm.reset();
    ev.preventDefault();
    this.userPanelState = this.userPanelState === 'active' ? 'inactive' : 'active';
    setTimeout(() => {
      this.tab = 1;
    }, 1000);
  }

  setTab(num: number, ev: any) {
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    this.tab = num;
  }

  onSubmitLogin({ value, valid }: { value: User, valid: boolean }) {
    this.loads = true;
    this.authService.login(value).subscribe((res) => {
      if (res.IsSuccess) {
        sessionStorage.setItem('Demo','true');
        this.router.navigate(['/start']);
      } else {
        this.errorFromServer = res.Message;
        this.loads = false;
      }
    });
    // this.loginForm.reset();
  }

  ngOnDestroy() {
    this.loads = false;
  }

  onSubmitRestore({ value, valid }: { value: User, valid: boolean }) {
    this.authService.restorePassword(value).subscribe((res) => {
      if (res.IsSuccess) {
        this.setTab(5, null);
      } else {
        this.errorRestorePassword = res.Message;
      }
    });
  }

  onSubmitRegister({ value, valid }: { value: User, valid: boolean }) {
    this.authService.register(value).subscribe((res) => {
      if (res.IsSuccess) {
        this.setTab(3, null);
      } else {
        this.errorRegister = res.Message;
      }
    });
    this.registerForm.reset();
  }

}
