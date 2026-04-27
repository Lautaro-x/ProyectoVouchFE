import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { LangSwitcherComponent } from '../../../shared/components/lang-switcher/lang-switcher.component';

interface NavItem {
  path: string;
  labelKey: string;
}

interface NavGroup {
  labelKey: string;
  path?: string;
  items?: NavItem[];
}

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule, LangSwitcherComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['../../layout-sidebar.css', './admin-layout.component.css'],
})
export class AdminLayoutComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;

  readonly groups: NavGroup[] = [
    { labelKey: 'admin.nav.products', path: 'products' },
    { labelKey: 'admin.nav.reviews',  path: 'reviews' },
    {
      labelKey: 'admin.nav.group_users',
      items: [
        { path: 'users',           labelKey: 'admin.nav.users' },
        { path: 'verify-requests', labelKey: 'admin.nav.verify_requests' },
      ],
    },
    {
      labelKey: 'admin.nav.group_crm',
      items: [
        { path: 'genres',     labelKey: 'admin.nav.genres' },
        { path: 'categories', labelKey: 'admin.nav.categories' },
        { path: 'platforms',  labelKey: 'admin.nav.platforms' },
      ],
    },
    {
      labelKey: 'admin.nav.group_notifications',
      items: [
        { path: 'surveys',       labelKey: 'admin.nav.surveys' },
        { path: 'announcements', labelKey: 'admin.nav.announcements' },
      ],
    },
    {
      labelKey: 'admin.nav.group_custom',
      items: [
        { path: 'custom-trailers', labelKey: 'admin.nav.custom_trailers' },
      ],
    },
  ];

  readonly openGroups = signal<Set<string>>(new Set(this.autoOpenGroups()));

  private autoOpenGroups(): string[] {
    return this.groups
      .filter(g => g.items?.some(i => this.router.url.includes(i.path)))
      .map(g => g.labelKey);
  }

  isOpen(labelKey: string): boolean {
    return this.openGroups().has(labelKey);
  }

  toggleGroup(labelKey: string): void {
    this.openGroups.update(s => {
      const next = new Set(s);
      next.has(labelKey) ? next.delete(labelKey) : next.add(labelKey);
      return next;
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
