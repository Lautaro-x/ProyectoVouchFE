import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SOCIAL_NETWORKS, SocialLinks } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  private readonly api  = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly SOCIAL_NETWORKS = SOCIAL_NETWORKS;

  readonly BADGE_COLORS: Record<string, string> = {
    verified:      'var(--color-accent)',
    top_critic:    '#f4a261',
    early_adopter: '#7c4dff',
    beta_tester:   '#00b894',
  };

  readonly loading      = signal(true);
  readonly saving       = signal(false);
  readonly saved        = signal(false);
  readonly email        = signal('');
  readonly badges       = signal<string[]>([]);
  readonly avatarBroken = signal(false);

  readonly name          = signal('');
  readonly avatarUrl     = signal('');
  readonly showEmail     = signal(false);
  readonly reviewsPublic = signal(true);
  readonly socialLinks   = signal<SocialLinks>({});

  ngOnInit(): void {
    this.api.getProfile().subscribe(profile => {
      this.email.set(profile.email);
      this.name.set(profile.name);
      this.avatarUrl.set(profile.avatar ?? '');
      this.showEmail.set(profile.show_email);
      this.reviewsPublic.set(profile.reviews_public);
      this.socialLinks.set(profile.social_links ?? {});
      this.badges.set(profile.badges ?? []);
      this.loading.set(false);
    });
  }

  badgeColor(slug: string): string {
    return this.BADGE_COLORS[slug] ?? 'var(--color-text-muted)';
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
      name:           this.name(),
      avatar:         this.avatarUrl() || null,
      show_email:     this.showEmail(),
      reviews_public: this.reviewsPublic(),
      social_links:   this.socialLinks(),
    }).subscribe(() => {
      this.auth.updateUser({ name: this.name(), avatar: this.avatarUrl() || null });
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    });
  }
}
