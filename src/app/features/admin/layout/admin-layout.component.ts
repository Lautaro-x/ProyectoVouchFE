import { Component, inject, ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { LangSwitcherComponent } from '../../../shared/components/lang-switcher/lang-switcher.component';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule, LangSwitcherComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);

  readonly user = this.auth.currentUser;

  readonly sections = [
    { path: 'genres',     labelKey: 'admin.nav.genres' },
    { path: 'categories', labelKey: 'admin.nav.categories' },
    { path: 'platforms',  labelKey: 'admin.nav.platforms' },
    { path: 'products',   labelKey: 'admin.nav.products' },
    { path: 'reviews',    labelKey: 'admin.nav.reviews' },
    { path: 'users',      labelKey: 'admin.nav.users' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
