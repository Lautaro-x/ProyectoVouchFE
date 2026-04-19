import { Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
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
  private auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly avatarBroken = signal(false);

  onAvatarError(): void {
    this.avatarBroken.set(true);
  }

  readonly sections = [
    { path: 'profile',         labelKey: 'profile.nav_profile' },
    { path: 'public-profile',  labelKey: 'public_profile.nav' },
    { path: 'reviews',         labelKey: 'reviews.nav_reviews' },
    { path: 'badges',          labelKey: 'badges.nav' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
