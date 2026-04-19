import { Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SOCIAL_NETWORKS, SocialLinks } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly SOCIAL_NETWORKS = SOCIAL_NETWORKS;

  readonly loading        = signal(true);
  readonly saving         = signal(false);
  readonly saved          = signal(false);
  readonly email          = signal('');
  readonly badges         = signal<string[]>([]);
  readonly avatarBroken   = signal(false);
  readonly name           = signal('');
  readonly avatarUrl      = signal('');
  readonly socialLinks = signal<SocialLinks>({});

  ngOnInit(): void {
    this.api.getProfile().subscribe(profile => {
      this.email.set(profile.email);
      this.name.set(profile.name);
      this.avatarUrl.set(profile.avatar ?? '');
      this.socialLinks.set(profile.social_links ?? {});
      this.badges.set(profile.badges ?? []);
      this.loading.set(false);
    });
  }

  setAvatarUrl(url: string): void {
    this.avatarUrl.set(url);
    this.avatarBroken.set(false);
  }

  onAvatarError(): void {
    this.avatarBroken.set(true);
  }

  getSocialUrl(network: string): string {
    return this.socialLinks()[network]?.url ?? '';
  }

  getSocialShared(network: string): boolean {
    return this.socialLinks()[network]?.shared ?? true;
  }

  setSocialUrl(network: string, url: string): void {
    this.socialLinks.update(links => ({
      ...links,
      [network]: { url, shared: links[network]?.shared ?? true },
    }));
  }

  setSocialShared(network: string, shared: boolean): void {
    this.socialLinks.update(links => ({
      ...links,
      [network]: { url: links[network]?.url ?? '', shared },
    }));
  }

  save(): void {
    this.saving.set(true);
    this.saved.set(false);
    this.api.updateProfile({
      name:         this.name(),
      avatar:       this.avatarUrl() || null,
      social_links: this.socialLinks(),
    }).subscribe(() => {
      this.auth.updateUser({ name: this.name(), avatar: this.avatarUrl() || null });
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    });
  }
}
