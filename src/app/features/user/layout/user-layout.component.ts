import { Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LangSwitcherComponent } from '../../../shared/components/lang-switcher/lang-switcher.component';

@Component({
  selector: 'app-user-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule, LangSwitcherComponent],
  templateUrl: './user-layout.component.html',
  styleUrls: ['../../layout-sidebar.css', './user-layout.component.css'],
})
export class UserLayoutComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly user         = this.auth.currentUser;
  readonly avatarBroken = signal(false);
  readonly navOpen      = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.navOpen.set(false));
  }

  onAvatarError(): void { this.avatarBroken.set(true); }
  toggleNav(): void     { this.navOpen.update(v => !v); }
  closeNav(): void      { this.navOpen.set(false); }

  readonly sections = [
    { path: 'profile',        labelKey: 'profile.nav_profile' },
    { path: 'consents',       labelKey: 'consents.nav' },
    { path: 'public-profile', labelKey: 'public_profile.nav' },
    { path: 'reviews',        labelKey: 'reviews.nav_reviews' },
    { path: 'badges',         labelKey: 'badges.nav' },
    { path: 'followers',      labelKey: 'followers.nav' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
