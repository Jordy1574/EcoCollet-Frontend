import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../../api/auth.api.service';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="position:fixed;right:8px;top:8px;background:rgba(0,0,0,0.6);color:#fff;padding:8px;border-radius:6px;z-index:9999;font-size:12px;">
      <div><strong>Auth debug</strong></div>
      <div *ngIf="user; else noUser">user: {{ user?.email }} (role: {{ user?.role }})</div>
      <ng-template #noUser>user: -</ng-template>
      <div>token: {{ token ? (token | slice:0:8) + '...' : '-' }}</div>
    </div>
  `
})
export class AuthDebugComponent {
  user: any = null;
  token: string | null = null;

  constructor(private auth: AuthApiService) {
    this.auth.currentUser$.subscribe(u => this.user = u);
    this.token = localStorage.getItem('ecollet_token');
    // observe token changes (polling simple)
    setInterval(() => this.token = localStorage.getItem('ecollet_token'), 1000);
  }
}
